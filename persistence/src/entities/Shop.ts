import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm'

@Entity()
export class Shop {

  @PrimaryGeneratedColumn()
    id: number

  @Column('int', {
    nullable: false,
    default: '0'
  })
    hash: number

  @Column('varchar', {
    nullable: false,
    length: 255
  })
    domain: string

  @Column('varchar', {
    nullable: false,
    length: 255
  })
    name: string

  @Column('double', {
    nullable: false
  })
    shippingCost: number

  @Column('double', {
    nullable: false,
    default: '1'
  })
    vatFix: number

  @Column('varchar', {
    nullable: true,
    length: 255
  })
    sitemap: string

  @Column('int', {
    nullable: false,
    default: '86400000' // 1d
  })
    productUpdInterval: number

  @Column('int', {
    nullable: false,
    default: '86400000' // 1d
  })
    sitemapUpdInterval: number

  @CreateDateColumn({ type: 'timestamp', nullable: false })
    dateAdd: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
    dateUpd: Date

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'current_timestamp'
  })
    dateNextUpd: Date

  @Column('int', {
    nullable: false,
    default: '0'
  })
    type: number

  @Column('text', {
    nullable: true
  })
    comment: string

  @Column('tinyint', {
    nullable: false,
    default: '0'
  })
    active: boolean

}
