import { JsonController, Get, QueryParam } from 'routing-controllers'
import { Connection, getConnectionManager } from 'typeorm'

@JsonController('/api/brands')
export class BrandController {
  private connection: Connection

  constructor () {
    this.connection = getConnectionManager().get()
  }

  @Get('/')
  getAll (@QueryParam('type') type: string) {
    if (type === 'simpleList') {
      return this.connection
        .query('SELECT DISTINCT p.brand FROM product p WHERE p.brand IS NOT NULL ORDER BY p.brand ASC')
        .then(data => data.map((row: any) => row.brand))
    }

    throw new Error('Incorrect type.')
  }
}
