import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository, In, Between } from 'typeorm'
import { Account } from '../accounts/entities/account.entity'
import { Budget } from '../budgets/entities/budget.entity'
import { Transaction } from '../transactions/entities/transaction.entity'
import { AuditLog } from '../admin/entities/audit-log.entity'
import { TransferDto } from './dto/transfer.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { User } from '../users/entities/user.entity'
import { MailService } from '../mail/mail.service'


@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private dataSource: DataSource,
  ) {}

  async execute(dto: TransferDto, userId: number) {
    if (dto.fromAccount === dto.toAccount) {
      throw new BadRequestException('Cannot transfer to the same account.')
    }

    // Verify ownership
    const sourceAccount = await this.accountsRepository.findOne({
      where: { accountNumber: dto.fromAccount, userId },
    })
    if (!sourceAccount) {
      throw new ForbiddenException('Source account not found or does not belong to you.')
    }

    // Verify destination exists
    const destAccount = await this.accountsRepository.findOne({
      where: { accountNumber: dto.toAccount },
    })
    if (!destAccount) {
      throw new NotFoundException('Destination account not found.')
    }

    // Atomic transaction
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Debit with balance check
      const debitResult = await queryRunner.query(
        `UPDATE accounts SET balance = balance - $1
         WHERE account_number = $2 AND user_id = $3 AND balance >= $1
         RETURNING balance`,
        [dto.amount, dto.fromAccount, userId],
      )

      if (!debitResult || debitResult.length === 0) {
        throw new BadRequestException('Insufficient balance.')
      }

      // Credit destination
      await queryRunner.query(
        `UPDATE accounts SET balance = balance + $1 WHERE account_number = $2`,
        [dto.amount, dto.toAccount],
      )

      // Record transaction
      const category = this.parseCategory(dto.description || '')
      const [txRecord] = await queryRunner.query(
        `INSERT INTO transactions (from_account, to_account, amount, description, category, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, from_account, to_account, amount, description, status, category, created_at`,
        [dto.fromAccount, dto.toAccount, dto.amount, dto.description || '', category, userId],
      )

      // Audit log
      await queryRunner.query(
        `INSERT INTO audit_logs (event, payload) VALUES ($1, $2)`,
        [
          'TRANSFER',
          JSON.stringify({
            from: dto.fromAccount,
            to: dto.toAccount,
            amount: dto.amount,
            userId,
            transactionId: txRecord.id,
          }),
        ],
      )

      await queryRunner.commitTransaction()

      // 1. Trigger Notification for Sender
      try {
        await this.notificationsService.create(
          userId,
          'TRANSFER',
          'Transfer Successful',
          `Sent Rs. ${Number(dto.amount).toLocaleString('en-US')} to account ${dto.toAccount}.`,
        )

        // Send Transfer Receipt Email
        try {
          const userRepo = this.dataSource.getRepository(User)
          const user = await userRepo.findOne({ where: { id: userId } })
          if (user) {
            await this.mailService.sendTransferSuccessEmail(
              user.email,
              user.fullName,
              dto.fromAccount,
              dto.toAccount,
              Number(dto.amount),
              String(txRecord.id),
            )
          }
        } catch (mailErr) {
          console.error('Failed to send transfer success email:', mailErr)
        }

        // 2. Trigger Notification for Recipient (if registered)
        if (destAccount.userId && destAccount.userId !== userId) {
          await this.notificationsService.create(
            destAccount.userId,
            'TRANSFER',
            'Funds Received',
            `Received Rs. ${Number(dto.amount).toLocaleString('en-US')} from account ${dto.fromAccount}.`,
          )
        }

        // 3. Check for Budget Alerts (Phase 2 & 4 integration)
        const budgetRepo = this.dataSource.getRepository(Budget)
        const budget = await budgetRepo.findOne({
          where: { userId, category },
        })

        if (budget) {
          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)
          
          const accounts = await this.accountsRepository.find({ where: { userId } })
          const accountNums = accounts.map(a => a.accountNumber)

          const txsInMonth = await this.transactionsRepository.find({
            where: {
              fromAccount: In(accountNums),
              category,
              createdAt: Between(startOfMonth, new Date()),
            },
            select: ['amount'],
          })

          const spent = txsInMonth.reduce((acc, t) => acc + Number(t.amount), 0)

          if (spent > Number(budget.monthlyLimit)) {
            await this.notificationsService.create(
              userId,
              'BUDGET_EXCEEDED',
              'Budget Exceeded',
              `Alert: Your monthly spending on "${category}" has reached Rs. ${spent.toLocaleString('en-US')}, exceeding your limit of Rs. ${Number(budget.monthlyLimit).toLocaleString('en-US')}.`,
            )
          }
        }
      } catch (notifyErr) {
        // Log notification failure but do not crash the successful transfer
        console.error('Failed to dispatch notifications/alerts:', notifyErr)
      }

      return {
        ok: true,
        message: 'Transfer completed successfully.',
        transaction: txRecord,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private parseCategory(description: string): string {
    const desc = (description || '').toLowerCase()
    if (/bill|utility|power|electric|water|internet|phone|telecom|insurance|tax|gas|ceb|leco|slt|mobitel|dialog|hutch/.test(desc)) {
      return 'Bills'
    }
    if (/food|grocery|groceries|restaurant|cafe|eat|lunch|dinner|breakfast|uber eats|pizza|kfc|mcdonald|keells|cargills|supermarket/.test(desc)) {
      return 'Food'
    }
    if (/transport|travel|ride|uber|pickme|taxi|bus|train|fuel|petrol|diesel|flight|air/.test(desc)) {
      return 'Transport'
    }
    if (/shopping|store|super|shop|amazon|daraz|ebay|clothing|clothes|shoes|gifts|mall/.test(desc)) {
      return 'Shopping'
    }
    if (/netflix|spotify|cinema|movie|tickets|games|gaming|concert|gym|sports|ent|fun/.test(desc)) {
      return 'Entertainment'
    }
    return 'Others'
  }
}
