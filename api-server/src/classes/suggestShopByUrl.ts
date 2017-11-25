import * as request from 'request'
import * as Url from 'url'
import { Shop } from '../persistence'

export class SuggestShopByUrl {

  public async get (url: string): Promise<Shop> {
    let shop = new Shop()
    shop.vatFix = 1
    shop.type = 0
    shop.active = true
    shop.sitemapUpdInterval = 86400000
    shop.productUpdInterval = 86400000
    shop.comment = 'SuggestShopByUrl'
    shop.dateNextUpd = new Date(0)
    shop.shippingCost = 0

    // Get main url
    const parsedUrl = Url.parse(url, false)
    if (parsedUrl.hostname) {
      shop.domain = (parsedUrl.protocol || 'http:') + '//' + parsedUrl.hostname
      shop.sitemap = await this.getSitemap(shop.domain)
      shop.name = await this.getName(shop.domain)
    }

    return shop
  }

  private async getSitemap (domain: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      request.get(domain + '/robots.txt', (error: any, response: any, body: any): void => {
        if (error || response.statusCode !== 200) {
          return resolve('')
        }

        let matches: string[] = []
        body.replace(/^Sitemap:\s?([^\s]+)$/igm, (str: string, p1: string) => matches.push(p1))

        resolve(matches.pop() || '')
      })
    })
  }

  private async getName (domain: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      request.get(domain, (error: any, response: any, body: any): void => {
        if (error || response.statusCode !== 200) {
          return resolve('')
        }

        let matches: string[] = body.match(/<title>([^<]*)<\/title>/i)
        resolve(matches.pop() || '')
      })
    })
  }

}
