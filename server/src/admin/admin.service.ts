import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Account } from '../accounts/entities/account.entity'
import { AuditLog } from './entities/audit-log.entity'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async getSystemOverview() {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    })

    const accounts = await this.accountsRepository.find({
      order: { id: 'ASC' },
    })

    const auditLogs = await this.auditLogsRepository.find({
      order: { id: 'DESC' },
      take: 10,
    })

    return {
      users,
      accounts,
      auditLogs,
    }
  }
}
