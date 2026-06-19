import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm'

@Entity('payees')
export class Payee {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @Column()
  name: string

  @Column({ name: 'account_number' })
  accountNumber: string

  @Column()
  bank: string
}
