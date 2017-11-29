import { JsonController, Get, QueryParam, Param, Post, Put, Delete } from 'routing-controllers'
import { Connection, Repository, getConnectionManager } from 'typeorm'
import { EntityFromParam, EntityFromBody } from 'typeorm-routing-controllers-extensions'
import { Shop, Url } from '../persistence'
import { SuggestShopByUrl } from '../classes/suggestShopByUrl'

@JsonController('/api/shops')
export class ShopController {
  private connection: Connection
  private repository: Repository<Shop>

  constructor () {
    this.connection = getConnectionManager().get()
    this.repository = this.connection.getRepository(Shop)
  }

  @Get('/suggestions')
  getSuggestion (@QueryParam('url', { required: true }) url: string) {
    const suggest = new SuggestShopByUrl()
    return suggest.get(decodeURI(url))
  }

  @Get('/')
  getAll (@QueryParam('page') page = 0,
    @QueryParam('limit') limit = 1000,
    @QueryParam('orderBy') orderBy: string,
    @QueryParam('orderWay') orderWay: 'ASC' | 'DESC' = 'ASC',
    @QueryParam('type') type: 'full' | 'simple' = 'full'
    ) {

    const query = this.repository.createQueryBuilder('shop')

    if (type === 'simple') {
      query.select([
        'shop.id',
        'shop.name',
        'shop.domain'
      ])
    }

    if (limit !== 0) {
      query.skip(page * limit).take(limit)
    }

    if (orderBy) {
      query.orderBy(orderBy, orderWay)
    }

    return query.getMany()
  }

  @Get('/urls/waiting')
  getAllPendingUrls () {
    return this.connection
      .query('SELECT count(1) as waiting FROM url WHERE url.dateNextUpd < now()')
      .then(data => data[0])
  }

  @Get('/:id/urls/waiting')
  getPendingUrls (@Param('id') id: number) {
    id = Number(id)
    if (isNaN(id) || id < 0) {
      id = 0
    } // TODO throw error
    return this.connection
      .query(`SELECT count(1) as waiting FROM url WHERE url.shopId = ${id} AND url.dateNextUpd < now()`)
      .then(data => data[0])
  }

  @Get('/:id')
  getById (@EntityFromParam('id', { required: true }) shop: Shop) {
    return shop
  }

  @Post('/')
  create (@EntityFromBody({ required: true }) shop: Shop) {
    /*if (typeof shop.dateNextUpd === 'string') {
      shop.dateNextUpd = new Date(shop.dateNextUpd)
    }*/
    shop.dateNextUpd = new Date(86400000) // 0 is too low : 1d from 1970
    return this.repository.save(shop)
  }

  @Post('/:id')
  updateOne (@EntityFromBody({ required: true }) shop: Shop) {
    return this.repository.save(shop)
  }

  @Put('/')
  createMany (@EntityFromBody({ required: true, type: Shop }) shops: Array<Shop>) {
    shops.forEach(shop => shop.hash = Url.getHashCode(shop.domain))
    return this.repository.save(shops)
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
    /*return this.repository.removeById(id);*/
  }
}
