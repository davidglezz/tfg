import { Index, Entity, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Shop } from './Shop'
import { Product } from './Product'

export interface UrlDTO {
  shopId: number
  hash: number
  href: string
  dateAdd: Date
  dateUpd: Date
  dateNextUpd: Date
  productId: number
  status: number
}

@Entity()
/*@Index("idx_unique_domain_url", (url: Url) => [url.shop, url.hash], { unique: true })*/
export class Url {
  /*@PrimaryGeneratedColumn()
  id: number;*/

  @ManyToOne(type => Shop, {
    primary: true,
    nullable: false,
    lazy: false,
    cascadeUpdate: false,
    cascadeInsert: false,
    cascadeRemove: false
  })
  shop: Shop

  @Column('bigint', {
    primary: true,
    nullable: false
  })
  hash: number

  @Column('varchar', {
    nullable: false,
    length: 512
  })
  href: string

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false
  })
  dateAdd: Date

  @Index()
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false
  })
  dateUpd: Date

  @Index()
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'current_timestamp'
  })
  dateNextUpd: Date

  @ManyToOne(type => Product, product => product.urls, {
    nullable: true,
    lazy: false,
    cascadeInsert: true,
    cascadeUpdate: false,
    cascadeRemove: false
  })
  product: Product | null

  @Column('smallint', {
    default: 0,
    nullable: false
  })
  status: number

  constructor (href: string, shop: Shop, nexUpd?: Date, hash?: number) {
    if (href) { // (typeof href === 'string')
      this.href = href
      this.shop = shop
      this.dateNextUpd = nexUpd || new Date()
      this.hash = hash || Url.getHashCode(href)
    }
  }

  static getHashCode (href: string): number {
    // require('crypto').createHash('md5').update(this.href).digest("hex"); // 16byte char
    let hash = 5381
    for (let i = 0; i < href.length; i++) {
      hash = (hash * 33) ^ href.charCodeAt(i)
    }

    return hash >= 0 ? hash : -hash
  }

}
