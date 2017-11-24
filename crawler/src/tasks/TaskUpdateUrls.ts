import 'reflect-metadata'
import { getConnectionManager, Connection, Repository } from 'typeorm'
import { Shop, Product, Url, PriceHistory } from '../persistence'
import { eachLimit } from 'async'
import { extractMicrodata, numberOfProducts, productFromMetadata } from '../scraper/microdata'
import { ProductDTO } from '../persistence/entities/Product'
import { timestampToSql } from '../util'
import { Dictionary } from '../interfaces/Dictionary'
import { Task } from '../interfaces/Task'
import { Result } from 'htmlmetaparser'

export class TaskUpdateUrls implements Task {
  private connection: Connection
  private repository: Dictionary<Repository<any>>

  private config = {
    BatchSize: 250,
    Concurrency: 25,
    RedirectUpdTime: 31536000000, // 1 year
    NoProductUpdTime: 31536000000, // 1 year
    DefaultTimeToNextRun: 5000 // 5s
  }

  constructor (public stats: Dictionary<any> = {}, config?: any) {
    if (typeof config === 'object') {
      Object.assign(this.config, config)
    }
    this.connection = getConnectionManager().get()
    this.repository = {
      shop: this.connection.getRepository(Shop),
      url: this.connection.getRepository(Url),
      product: this.connection.getRepository(Product),
      priceHistory: this.connection.getRepository(PriceHistory)
    }

    this.stats.runCount = 0
    this.stats.proccessedUrls = 0
  }

  /**
   * Analyze urls in search of microdata
   */
  async run () {
    this.stats.runCount++
    console.info(`[RUN] ${TaskUpdateUrls.name}`)
    return new Promise<void>(async resolve => {
      let result: Url[] = await this.repository.url.createQueryBuilder('url')
        .innerJoinAndSelect('url.shop', 'shop')
        .leftJoinAndSelect('url.product', 'product')
        .where('url.dateNextUpd < :value', { value: timestampToSql(Date.now()) })
        .orderBy('url.dateNextUpd', 'ASC')
        .limit(this.config.BatchSize)
        .getMany()

      eachLimit<Url, Error>(result, this.config.Concurrency, async (url: Url) => {
        this.stats.proccessedUrls++
        await this.proccessUrl(url).catch(e => console.error('[ERROR] Processing', url, e))
      }, async (err: any) => {
        if (err) {
          console.warn(err)
        } // no reject(err), if error, continue

        // Resolve immediately
        // resolve()
        setTimeout(resolve, this.config.DefaultTimeToNextRun) // Temporal FIX
        // setTimeout(resolve, await this.getNextUpdate())
      })
    })
  }

  /**
   * Extract microdata from the url and update the corresponding records
   * @param url
   */
  async proccessUrl (url: Url) {
    // TODO early redirection detection. request.on('redirect')
    let response = await extractMicrodata(url.href)
      .catch(() => console.info('Does not contain or could not obtain microdata:', url.href))

    // TODO define states
    url.status = !response || !response.status ? 600 : response.status

    // If microdata can not be obtained ...
    if (!response || !response.data) {
      console.info('Does not contain microdata:', url.href)
      url.dateNextUpd = new Date(Date.now() + this.config.RedirectUpdTime)
      return this.repository.url.save(url).catch(console.error)
    }

    // If you redirect do not scan in 1 year and add the new url
    if (response.url !== url.href) {
      console.info('Redirection', url.href + ' -> ' + response.url)
      url.status = 301
      // Check if it already exists
      let urlHash = Url.getHashCode(response.url)
      let dbUrl = await this.repository.url.findOne({ 'where': { 'hash': urlHash, 'shopId': url.shop.id } })
      url.dateNextUpd = new Date(Date.now() + this.config.RedirectUpdTime)
      const urls = [url]
      if (!dbUrl) {
        urls.push(new Url(response.url, url.shop, undefined, urlHash))
      }
      return this.repository.url.save(urls).catch(console.error)
    }

    // If the page does not contain only one product
    const nbProducts = response.data ? numberOfProducts(response.data) : 0
    if (nbProducts !== 1) {
      // Do not re-analyze for a long time
      console.info(`It contains ${nbProducts} products != 1`, url.href)
      url.dateNextUpd = new Date(Date.now() + this.config.NoProductUpdTime)
      return this.repository.url.save(url).catch(console.error)
    }

    // The page contains only one product:
    let productInfo: ProductDTO = productFromMetadata(response.data as Result)
    let priceChanges = true

    this.calcTotalPrice(productInfo, url.shop)

    // If the product is not created in db: Create and set price
    if (!url.product) {
      console.info('New product', url.href)
      url.product = this.repository.product.create(productInfo)
      await this.repository.product.save(url.product).catch(console.error)
    } else {
      // If the price or availability changes
      priceChanges = Math.abs(url.product.price - productInfo.price) >= 0.01
      if (priceChanges || url.product.availability !== productInfo.availability) {
        console.info('Price is updated:', url.href)
        url.product.price = productInfo.price
        url.product.priceTotal = productInfo.priceTotal
        url.product.availability = productInfo.availability
        await this.repository.product.save(url.product).catch(console.error)
      } else {
        console.info('Price is not updated:', url.href)
      }
    }

    // Save url
    url.dateNextUpd = new Date(Date.now() + url.shop.productUpdInterval)
    await this.repository.url.save(url).catch(() => {
      console.error('An error occurred while saving url.', url.href)
    })

    // Add price history
    if (priceChanges && productInfo.price >= 0) {
      let priceHistory = this.repository.priceHistory.create({
        date: timestampToSql(Date.now()),
        price: productInfo.price,
        priceTotal: productInfo.priceTotal,
        url: url
      })
      await this.repository.priceHistory.save(priceHistory)
    }
  }

  /**
   * @returns number of ms to the next update
   */
  async getNextUpdate (): Promise<number> {
    return this.repository.url.createQueryBuilder('url')
      .select('url.dateNextUpd')
      .orderBy('url.dateNextUpd', 'ASC')
      .getOne()
      .then(row => {
        if (!row || !row.dateNextUpd) {
          return this.config.DefaultTimeToNextRun
        }

        let timespan = row.dateNextUpd.getTime() - Date.now()
        if (timespan < 0) timespan = 0
        return timespan > this.config.DefaultTimeToNextRun ? this.config.DefaultTimeToNextRun : timespan
      })
      .catch(() => this.config.DefaultTimeToNextRun)
  }

  /**
   * Calculate the estimated total price of the product.
   * This should be improved taking into account other factors (weight, country, ...)
   * @param productInfo
   * @param shop
   */
  calcTotalPrice (productInfo: ProductDTO, shop: Shop) {
    if (productInfo.price >= 0) {
      if (shop.vatFix !== 1) {
        productInfo.price *= shop.vatFix
      }

      if (shop.shippingCost >= 0) {
        productInfo.priceTotal = productInfo.price + shop.shippingCost
      } else {
        productInfo.priceTotal = productInfo.price
      }
    } else {
      productInfo.price = 0
      productInfo.priceTotal = 0
    }
  }

}
