import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payee } from './entities/payee.entity'
import { PayeesService } from './payees.service'
import { PayeesController } from './payees.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Payee])],
  controllers: [PayeesController],
  providers: [PayeesService],
  exports: [PayeesService],
})
export class PayeesModule {}
