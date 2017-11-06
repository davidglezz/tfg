import { PrimaryColumn, Column, Entity, ManyToOne } from 'typeorm'
import { Url } from './Url'

@Entity()
export class PriceHistory {

  @PrimaryColumn('datetime')
    date: Date

  @ManyToOne(type => Url, {
    nullable: false,
    primary: true,
    cascadeAll: false
  })
    url: Url

  @Column('double', {
    nullable: false
  })
    price: number

  @Column('double', {
    nullable: false
  })
    priceTotal: number
}
