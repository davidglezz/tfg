
import { PriceHistory } from '../persistence/entities/PriceHistory'
import { JsonController, Get, QueryParam, Param, Post, Put, Delete } from 'routing-controllers'
import { Connection, Repository, getConnectionManager } from 'typeorm'
import { EntityFromParam, EntityFromBody } from 'typeorm-routing-controllers-extensions'
import { Product } from '../persistence'
import { Url } from '../persistence/entities/Url'

@JsonController('/api/products')
export class ProductController {
  private connection: Connection
  private repository: Repository<Product>

  constructor () {
    this.connection = getConnectionManager().get()
    this.repository = this.connection.getRepository(Product)
  }

  @Get('/languages')
  getLanguages () {
    return this.connection
      .query('SELECT DISTINCT p.language FROM product p WHERE p.language IS NOT NULL ORDER BY p.language ASC')
      .then(data => data.map((row: any) => row.language))
  }

  @Get('/')
  getAll (@QueryParam('skip') skip = 0,
    @QueryParam('limit') limit = 100,
    @QueryParam('orderBy') orderBy: string,
    @QueryParam('orderWay') orderWay: 'ASC' | 'DESC' = 'ASC',
    @QueryParam('filter') jsonfilter: string) {

    // TODO Improve security - Possible SQL injection
    // const queryBuilder = this.repository.createQueryBuilder('product')
    let query = `
            SELECT
                product.id AS id,
                product.language AS language,
                product.name AS name,
                product.ratingValue AS ratingValue,
                product.ratingCount AS ratingCount,
                product.brand AS brand,
                product.color AS color,
                product.gtin13 AS gtin13,
                product.mpn AS mpn,
                product.sku AS sku,
                product.productID AS productID,
                product.price AS price,
                product.priceCurrency AS priceCurrency,
                product.priceTotal AS priceTotal,
                product.description AS description,
                product.image AS image,
                product.availability AS availability,
                product.dateAdd AS dateAdd,
                product.dateUpd AS dateUpd
            FROM product product
            INNER JOIN url url ON url.productId = product.id
            `

    let filter: ProductFilter | undefined
    if (jsonfilter) {
      try {
        filter = JSON.parse(decodeURI(jsonfilter))
      } catch (e) {
        // filter = undefined
      }
    }

    if (filter) {
      // console.log(filter)
      // queryBuilder.where('TRUE')
      query += ` WHERE product.name IS NOT NULL `

      if (filter.priceMin && filter.priceMin > 0) {
        // queryBuilder.andWhere("product.priceTotal >= :priceMin", { priceMin: filter.priceMin })
        query += ` AND product.priceTotal >= ${filter.priceMin} `
      }

      if (filter.priceMin && filter.priceMax && filter.priceMax >= filter.priceMin) {
        // queryBuilder.andWhere("product.priceTotal <= :priceMax", { priceMax: filter.priceMax })
        query += ` AND product.priceTotal <= ${filter.priceMax} `
      }

      if (filter.rating) {
        // queryBuilder.andWhere("product.ratingValue >= :ratingValue", { ratingValue: filter.rating / 5 })
        const value = filter.rating / 5
        query += ` AND product.ratingValue >= ${value}`
      }

      if (filter.shop) {
        const value = filter.shop.join(',')
        query += ` AND url.shopId IN (${value}) `
      }

      if (filter.brand) {
        // queryBuilder.andWhere("product.brand IN (:brand)", { brand: filter.brand })
        const value = filter.brand.join('","')
        query += ` AND product.brand IN ("${value}") `
      }

      if (filter.availability) {
        // queryBuilder.andWhere("product.availability IN (:availability)", { availability: filter.availability })
        const value = filter.availability.join('","')
        query += ` AND product.availability IN ("${value}") `
      }

      if (filter.language) {
        // queryBuilder.andWhere("product.language IN (:language)", { language: filter.language })
        const value = filter.language.join('","')
        query += ` AND product.language IN ("${value}") `
      }

      if (filter.search) {
        // TODO usar escapeString
        // TODO buscar tambien en otras columnas mpn, sku, gtin13,..
        const value = filter.search.replace('+', '\+').replace('  ', ' ').replace(' ', '%')
        query += ` AND product.name LIKE '%${value}%'`
      }
    }

    if (orderBy) {
      // queryBuilder.orderBy(orderBy, orderWay)
      query += ` ORDER BY ${orderBy} ${orderWay} `
    }

    if (limit !== 0) {
      // queryBuilder.skip(skip).take(limit)
      query += ` LIMIT ${limit} OFFSET ${skip} `
    }

    // console.log(queryBuilder.getSql())
    // return queryBuilder.getMany()

    query = query.replace('\n', '')
    // console.log(query)
    return this.repository.query(query)
  }

  @Get('/:id')
  getById (@EntityFromParam('id', { required: true }) product: Product) {
    return product
  }

  @Get('/:id/urls')
  getProductUrls (@Param('id') id: number) {
    return this.connection.createQueryBuilder(Url, 'url')
      .innerJoinAndSelect('url.shop', 'shop')
      // .innerJoinAndSelect("url.product", "product")
      .where('url.productId = :productId', { productId: id })
      .getMany()
  }

  @Get('/:product/url/:url/prices')
  getProductPrices (@Param('product') product: number, @Param('url') url: string) {
    const urlKey = url.split('-').map(Number)
    return this.connection.createQueryBuilder(PriceHistory, 'p')
      .where('p.urlShop = :urlShop', { urlShop: urlKey[0] })
      .andWhere('p.urlHash = :urlHash', { urlHash: urlKey[1] })
      // .andWhere() // TODO limit last month and/or last 20 records
      .orderBy('p.date', 'ASC')
      .getMany()
  }

  @Get('/:id/similar')
  getSimilarProducts (@EntityFromParam('id', { required: true }) product: Product) {

    let identifiers = (['mpn', 'sku', 'productID'])
      .filter(val => Boolean((product as any)[val]))
      .map(val => (product as any)[val])
      .filter((val, i, arr) => arr.indexOf(val) === i)

    let inIdenfiers = ''
    if (identifiers.length === 1) {
      inIdenfiers = ` = '${identifiers[0]}'`
    } else if (identifiers.length > 1) {
      inIdenfiers = ` IN ('${identifiers.join("','")}') `
    }

    let where: string
    if (product.gtin13 > 0) {
      if (inIdenfiers) {
        where = ` (product.gtin13 = ${product.gtin13} OR
                                product.mpn ${inIdenfiers} OR
                                product.sku ${inIdenfiers} OR
                                product.productID ${inIdenfiers}
                            )`
      } else {
        where = ` product.gtin13 = ${product.gtin13} `
      }
    } else {
      if (inIdenfiers) {
        where = ` (product.mpn IN ('${identifiers}') OR
                                product.sku IN ('${identifiers}') OR
                                product.productID IN ('${identifiers}')
                            )`
      } else {
        return Promise.resolve([])
      }
    }

    let queryBuilder = this.connection.createQueryBuilder(Url, 'url')
      .innerJoinAndSelect('url.product', 'product')
      .innerJoinAndSelect('url.shop', 'shop')
      .where('product.id != :productId', { productId: product.id })
      .andWhere(where)
      .limit(25)

    // console.log(queryBuilder.getSql())
    return queryBuilder.getMany()
  }

  @Post('/')
  create (@EntityFromBody({ required: true }) product: Product) {
    throw new Error('Disabled until there is an authentication system')
    /*return this.repository.save(product)*/
  }

  @Put('/')
  update (@EntityFromBody({ required: true }) product: Product) {
    throw new Error('Disabled until there is an authentication system')
    /*return this.repository.save(product);*/
  }

  @Put('/:id')
  updateOne (@EntityFromBody({ required: true }) product: Product) {
    throw new Error('Disabled until there is an authentication system')
    /*return this.repository.save(product);*/
  }

  @Delete('/')
  deleteAll (@QueryParam('confirm') confirm = false) {
    throw new Error('Disabled until there is an authentication system')
    /*if (confirm)
        return this.repository.clear();*/
  }

  @Delete('/:id')
  deleteOne (@Param('id') id: number) {
    throw new Error('Disabled until there is an authentication system')
    // return this.repository.removeById(id);
  }
}

interface ProductFilter {
  priceMin?: number
  priceMax?: number
  rating?: number
  shop?: number[]
  brand?: string[]
  availability?: string[]
  language?: string[]
  search?: string
}
