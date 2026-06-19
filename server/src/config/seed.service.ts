import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from '../users/entities/user.entity'
import { Account } from '../accounts/entities/account.entity'
import { Transaction } from '../transactions/entities/transaction.entity'

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async onApplicationBootstrap() {
    console.log('🌱 Checking seed data...')
    
    // 1. Seed Users
    const userCount = await this.usersRepository.count()
    if (userCount === 0) {
      console.log('👤 Seeding users...')
      const saltRounds = 12
      const hash1 = await bcrypt.hash('password123', saltRounds)
      const hash2 = await bcrypt.hash('kasun', saltRounds)
      const hash3 = await bcrypt.hash('admin', saltRounds)

      const u1 = this.usersRepository.create({
        id: 1,
        username: 'dilara',
        password: hash1,
        role: 'customer',
        fullName: 'Dilara Perera',
        nic: '200112345678',
        email: 'dilara@example.test',
      })

      const u2 = this.usersRepository.create({
        id: 2,
        username: 'kasun',
        password: hash2,
        role: 'customer',
        fullName: 'Kasun Wickramanayake',
        nic: '199812345678',
        email: 'kasun@example.test',
      })

      const u3 = this.usersRepository.create({
        id: 3,
        username: 'admin',
        password: hash3,
        role: 'admin',
        fullName: 'Platform Administrator',
        nic: '000000000000',
        email: 'root@example.test',
      })

      await this.usersRepository.save([u1, u2, u3])
    }

    // 2. Seed Accounts
    const accountCount = await this.accountsRepository.count()
    if (accountCount === 0) {
      console.log('💳 Seeding accounts...')
      const a1 = this.accountsRepository.create({
        userId: 1,
        accountNumber: '1000003423',
        accountName: 'Dilara Savings',
        balance: 100000.00,
        pin: '1234',
      })

      const a2 = this.accountsRepository.create({
        userId: 1,
        accountNumber: '1000004876',
        accountName: 'Dilara Expenses',
        balance: 42000.00,
        pin: '1234',
      })

      const a3 = this.accountsRepository.create({
        userId: 2,
        accountNumber: '2000006754',
        accountName: 'Kasun Current',
        balance: 9870.00,
        pin: '0000',
      })

      const a4 = this.accountsRepository.create({
        userId: 3,
        accountNumber: '9999999999',
        accountName: 'Admin Vault',
        balance: 9999999.99,
        pin: '9999',
      })

      await this.accountsRepository.save([a1, a2, a3, a4])
    }

    // 3. Seed Transactions
    const transactionCount = await this.transactionsRepository.count()
    if (transactionCount === 0) {
      console.log('📝 Seeding transactions...')
      
      const now = new Date()
      const getPastDate = (monthsAgo: number, day: number) => {
        const d = new Date()
        d.setMonth(now.getMonth() - monthsAgo)
        d.setDate(day)
        return d
      }

      const txs = [
        // Current Month (0 months ago)
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 1500.00,
          description: 'Uber Eats Lunch',
          category: 'Food',
          createdBy: 1,
          createdAt: getPastDate(0, 5),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '9999999999',
          amount: 5500.00,
          description: 'CEB Electricity Bill',
          category: 'Bills',
          createdBy: 1,
          createdAt: getPastDate(0, 10),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 12000.00,
          description: 'Amazon Shopping Mall',
          category: 'Shopping',
          createdBy: 1,
          createdAt: getPastDate(0, 12),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 3200.00,
          description: 'Netflix & Spotify Premium',
          category: 'Entertainment',
          createdBy: 1,
          createdAt: getPastDate(0, 15),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 2500.00,
          description: 'Uber Ride City Center',
          category: 'Transport',
          createdBy: 1,
          createdAt: getPastDate(0, 18),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000003423',
          toAccount: '2000006754',
          amount: 8000.00,
          description: 'Cash transfer to friend',
          category: 'Others',
          createdBy: 1,
          createdAt: getPastDate(0, 20),
        }),

        // 1 Month Ago
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 3500.00,
          description: 'Dinner Cafe Noir',
          category: 'Food',
          createdBy: 1,
          createdAt: getPastDate(1, 4),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '9999999999',
          amount: 5200.00,
          description: 'Telecom Mobitel Bill',
          category: 'Bills',
          createdBy: 1,
          createdAt: getPastDate(1, 9),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 8500.00,
          description: 'Clothing Mall Store',
          category: 'Shopping',
          createdBy: 1,
          createdAt: getPastDate(1, 14),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 2800.00,
          description: 'Movie Tickets Cinema',
          category: 'Entertainment',
          createdBy: 1,
          createdAt: getPastDate(1, 19),
        }),

        // 2 Months Ago
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 4200.00,
          description: 'Grocery Keells Super',
          category: 'Food',
          createdBy: 1,
          createdAt: getPastDate(2, 6),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '9999999999',
          amount: 6000.00,
          description: 'Water Board Water Bill',
          category: 'Bills',
          createdBy: 1,
          createdAt: getPastDate(2, 11),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 14000.00,
          description: 'Daraz Shopping Hub',
          category: 'Shopping',
          createdBy: 1,
          createdAt: getPastDate(2, 16),
        }),

        // 3 Months Ago
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 5100.00,
          description: 'McDonalds Dinner',
          category: 'Food',
          createdBy: 1,
          createdAt: getPastDate(3, 8),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '9999999999',
          amount: 4800.00,
          description: 'Dialog Broadband Bill',
          category: 'Bills',
          createdBy: 1,
          createdAt: getPastDate(3, 13),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 11000.00,
          description: 'Brand Store Clothes',
          category: 'Shopping',
          createdBy: 1,
          createdAt: getPastDate(3, 18),
        }),

        // 4 Months Ago
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 3900.00,
          description: 'Pizza Hut Delivery',
          category: 'Food',
          createdBy: 1,
          createdAt: getPastDate(4, 3),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '9999999999',
          amount: 5000.00,
          description: 'Insurance Premium CEB',
          category: 'Bills',
          createdBy: 1,
          createdAt: getPastDate(4, 7),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 9000.00,
          description: 'Ebay Retail purchase',
          category: 'Shopping',
          createdBy: 1,
          createdAt: getPastDate(4, 15),
        }),

        // 5 Months Ago
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 4600.00,
          description: 'Cargills Super Market',
          category: 'Food',
          createdBy: 1,
          createdAt: getPastDate(5, 5),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '9999999999',
          amount: 5300.00,
          description: 'Slt Internet Bill',
          category: 'Bills',
          createdBy: 1,
          createdAt: getPastDate(5, 12),
        }),
        this.transactionsRepository.create({
          fromAccount: '1000004876',
          toAccount: '2000006754',
          amount: 7200.00,
          description: 'Retail Shopping items',
          category: 'Shopping',
          createdBy: 1,
          createdAt: getPastDate(5, 20),
        }),
      ]
      await this.transactionsRepository.save(txs)
    }

    console.log('✨ Seed data check complete!')
  }
}
