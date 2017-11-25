import 'reflect-metadata'
import { eachLimit } from 'async'
import { Connection, getConnectionManager, Repository } from 'typeorm'
import { Shop, Url } from '../persistence'
import { SitemapParser } from '../scraper/SitemapParser2'
import * as normalizeUrl from 'normalize-url'
import { timestampToSql } from '../util'
import { Dictionary } from '../interfaces/Dictionary'
import { Task } from '../interfaces/Task'
import { escapeString } from '../persistence/index'

export class TaskUpdateSitemap implements Task {
  private connection: Connection
  private repository = {} as Dictionary<Repository<any>>

  private config = {
    ShopConcurrency: 10,
    NextUpdIncrement: 10000, // 10 seconds
    UrlBatchSize: 250,
    ShopBatchSize: 100,
    DefaultTimeToNextRun: 60000 // 1 minute
  }

  constructor (public stats: Dictionary<any> = {}, config?: any) {
    if (typeof config === 'object') {
      Object.assign(this.config, config)
    }
    this.connection = getConnectionManager().get()
    this.repository.shop = this.connection.getRepository(Shop)
    this.repository.url = this.connection.getRepository(Url)
  }

  /**
   * Add new Urls from sitemap.xml
   */
  async run (): Promise<void> {
    console.info(`[RUN] ${TaskUpdateSitemap.name}`)
    return new Promise<void>(async resolve => {
      let shops = await this.repository.shop.createQueryBuilder('shop')
        .where('shop.dateNextUpd < :value', { value: new Date() })
        .andWhere('shop.sitemap IS NOT NULL')
        .andWhere('shop.active = 1')
        .orderBy('shop.dateNextUpd', 'ASC')
        .take(this.config.ShopBatchSize)
        .getMany()

      eachLimit<Shop, Error>(shops, this.config.ShopConcurrency, async (shop: Shop) => {
        // Set next sitemap update date
        await this.updateShopDateNextUpd(shop)
        // Download sitemap and add urls
        await this.proccessSitemap(shop)
      }, async (err: any) => {
        if (err) {
          console.warn(err)
        } // no reject(err), if error, continue

        let timespan = await this.getNextUpdate()
        setTimeout(resolve, timespan)
      })
    })
  }

  /**
   * @returns set of all url Hashes for a given shop
   * 100mb~150mb of RAM per million (1.000.000) of hashes
   */
  async getAllShopUrlHashes (shop: Shop): Promise<Set<number>> {
    return this.repository.url.createQueryBuilder('url')
      .select('url.hash')
      .where('url.shopId = ' + shop.id)
      .getRawMany()
      .then(data => {
        const hashSet = new Set<number>()
        data.forEach(row => hashSet.add(+row.hash))
        return hashSet
      })
      .catch(() => new Set<number>())
  }

  /**
   * @returns number of ms to the next update
   */
  async getNextUpdate (): Promise<number> {
    return this.repository.shop.createQueryBuilder('shop')
      .select('shop.dateNextUpd')
      .orderBy('shop.dateNextUpd', 'ASC')
      .where('shop.sitemap IS NOT NULL')
      .andWhere('shop.active = 1')
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

  async updateShopDateNextUpd (shop: Shop) {
    let now = Date.now()
    shop.dateNextUpd = new Date(now + shop.sitemapUpdInterval)
    return this.repository.shop.save(shop as any) // TO FIX
      .catch((e: any) => { console.error('[ERROR] on database', e) })
  }

  /**
   * Stores a set of rows in the database
   * @param toAdd Array<String>
   */
  async addUrls (toAdd: string[]) {
    let query = 'INSERT IGNORE INTO url (shopId, hash, href, dateNextUpd) VALUES '
    query += toAdd.join(',')
    return this.connection
      .query(query)
      .catch(() => console.error('[ERROR] ON INSERT'/*, e*/))
  }

  /**
   * Download sitemap and add urls to the database
   * @param shop
   */
  async proccessSitemap (shop: Shop) {
    let stats = {
      total: 0,
      new: 0,
      saved: 0,

      current: 'NOT STARTED'
    }
    this.stats[shop.name] = stats

    const currentHashes = await this.getAllShopUrlHashes(shop)
    let rowsToAdd: string[] = []
    let nextUpd = 0 // Date.now() // High priority
    let parser = new SitemapParser(onUrl, () => {
      // NOOP
    })

    const This = this
    return parser.asPromise(shop.sitemap)
      .then(() => {
        if (rowsToAdd.length > 0) {
          save()
        }

        stats.current = 'FINALIZED'

        autoDeleteStats(3)

        function autoDeleteStats (time: number) {
          let countdown = time * 2
          function fn () {
            if (countdown === 0) {
              if (stats.saved === stats.new) {
                delete This.stats[shop.name]
                return
              }
            } else {
              countdown--
            }
            setTimeout(fn, 500)
          }
          setTimeout(fn, 500)
        }

      })
      .catch(() => console.error('[Error] in proccessSitemap: Cant parse.'))

    async function save () {
      const valuesToAdd = rowsToAdd
      rowsToAdd = []
      parser.pause()
      await This.addUrls(valuesToAdd)
      parser.resume()
      stats.saved += valuesToAdd.length
    }

    // Action when finding a url in the sitemap
    async function onUrl (url: string) {
      url = normalizeUrl(url, { stripWWW: false })
      stats.current = url
      const urlHash = Url.getHashCode(url)
      stats.total++

      if (currentHashes.has(urlHash)) {
        return
      }

      currentHashes.add(urlHash)
      stats.new++
      nextUpd += This.config.NextUpdIncrement

      url = escapeString(url)
      const dateNextUpd = timestampToSql(nextUpd)
      rowsToAdd.push(`('${shop.id}','${urlHash}','${url}','${dateNextUpd}')`)

      if (rowsToAdd.length === This.config.UrlBatchSize) {
        save()
      }
    }
  }
}
