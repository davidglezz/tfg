import { Index, Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Url } from './Url'

export interface ProductDTO {
  id: number
  language: string
  name: string
  description: string
  image: string
  brand: string
  color: string
  gtin13: number
  mpn: string
  sku: string
  productID: string
  price: number
  priceTotal: number
  priceCurrency: string
  ratingValue: number
  ratingCount: number
  dateAdd: Date
  dateUpd: Date
  urls: Url[]
  [key: string]: any
}

@Entity()
export class Product implements ProductDTO {

  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column('char', {
    nullable: true,
    length: 5
  })
  language: string

  @Index()
  @Column('varchar', {
    nullable: true,
    length: 255
  })
  name: string

  @Index()
  @Column('float', {
    nullable: true
  })
  ratingValue: number

  @Column('int', {
    nullable: true
  })
  ratingCount: number

  @Index()
  @Column('varchar', {
    nullable: true,
    length: 45
  })
  brand: string

  @Column('varchar', {
    nullable: true,
    length: 45
  })
  color: string

  @Index()
  @Column('bigint', {
    nullable: true,
    default: 0
  })
  gtin13: number

  @Index()
  @Column('varchar', {
    nullable: true,
    length: 45
  })
  mpn: string

  @Index()
  @Column('varchar', {
    nullable: true,
    length: 45
  })
  sku: string

  @Index()
  @Column('varchar', {
    nullable: true,
    length: 45
  })
  productID: string

  @Index()
  @Column('double', {
    nullable: true
  })
  price: number

  @Column('varchar', {
    nullable: true,
    length: 3,
    default: 'EUR'
  })
  priceCurrency: string

  @Index()
  @Column('double', {
    nullable: true
  })
  priceTotal: number

  @Column('text', {
    nullable: true
  })
  description: string

  @Column('varchar', {
    nullable: true,
    length: 255
  })
  image: string

  @Index()
  @Column({
    type: 'enum',
    enum: ['Discontinued', 'InStock', 'InStoreOnly', 'LimitedAvailability',
      'OnlineOnly', 'OutOfStock', 'PreOrder', 'PreSale', 'SoldOut'],
    default: 'InStock'
  })
  availability: 'Discontinued' | 'InStock' | 'InStoreOnly' | 'LimitedAvailability' |
    'OnlineOnly' | 'OutOfStock' | 'PreOrder' | 'PreSale' | 'SoldOut'

  @Index()
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  dateAdd: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  dateUpd: Date

  @OneToMany(type => Url, urls => urls.product)
  urls: Url[]

}
