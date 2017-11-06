import { Handler as metaparserHandler, Result, ResultJsonLd } from 'htmlmetaparser'
import * as htmlparser from 'htmlparser2'
import * as request from 'request'
import { ProductDTO } from '../persistence/entities/Product'
import { capitalize, parsePrice } from '../util'
import { Dictionary } from '../interfaces/Dictionary'
// import { Readable } from 'stream'
// import * as zlib from 'zlib'
// import * as iconv from 'iconv-lite'

export async function extractMicrodata (url: string): Promise<MicrodataResult> {
  return new Promise<MicrodataResult>((resolve, reject) => {
    // url = encodeURI(decodeURI(url))
    let result: MicrodataResult = {
      'url': url,
      'status': 200
    }

    let requestCompleted = false
    let parseComplete = false

    function onRequestEnd (error: any, response: request.RequestResponse): void {
      if (error) {
        reject(error)
      } else {
        let redirect = response.request as any
        result.url = redirect.uri.href
        requestCompleted = true
        if (parseComplete) {
          resolve(result)
        }
      }
    }

    function onMetaparserEnd (err: Error | null, data: Result) {
      if (err) {
        console.warn('Metaparser error', err)
      }

      result.data = data
      parseComplete = true
      if (requestCompleted) {
        resolve(result)
      }
    }

    const handler = new metaparserHandler(onMetaparserEnd, { 'url': url })
    const parser = new htmlparser.WritableStream(handler, { decodeEntities: true })

    let reqOptions = {
      method: 'GET',
      url: url,
      followAllRedirects: true, // TODO no follow
      timeout: 10000
    }

    let req = request(reqOptions, onRequestEnd)
    req.pipe(parser)
  })

}

export interface MicrodataResult {
  data?: Result
  url: string
  status: number
}

function getStringValue (obj: Array<Dictionary<any>> | Dictionary<any> | undefined, value?: string): string | undefined {
  if (typeof obj === 'undefined') {
    return value
  }

  // If it is an array, only the first one is taken into account
  // TODO improve support for multiple values
  if (obj.constructor === Array) {
    obj = (obj as Array<any>).shift()
  }

  if (typeof obj === 'object' && (obj as any)['@value']) {
    value = (obj as any)['@value']
  }

  return value
}

function getNumberValue (obj: Array<Dictionary<any>> | Dictionary<any> | undefined, value = 0): number {
  let n = Number(getStringValue(obj))
  return isNaN(n) ? value : n
}

export function productFromMetadata (metadata: Result): ProductDTO {
  let productMicrodata: ResultJsonLd = metadata.microdata!['@graph'].filter((d: any) => d['@type'] === 'Product')[0]

  let product = {} as ProductDTO

  if (productMicrodata.name && productMicrodata.name['@language']) {
    product['language'] = productMicrodata.name['@language']
  }

  let fields = ['name', 'description', 'image', 'productID', 'gtin13', 'mpn', 'sku', 'brand', 'color']
  fields.forEach(prop => {
    if (productMicrodata.hasOwnProperty(prop)) {
      let value = getStringValue(productMicrodata[prop])
      if (value) {
        product[prop] = value
      }
    }
  })

  // TODO
  /* elcorteingles.es does not show brand name directly
  brand
      @type: Thing
      name: HP
  */

  // FIX brand
  if (product.brand) {
    // If Url instead of name (brand-name -> Brand Name)
    const isUrl = product.brand.lastIndexOf('/')
    if (isUrl >= 0) {
      // Cut, Split by "-", capitalize and join
      product.brand = product.brand
        .substring(isUrl + 1, product.brand.length)
        .split('-')
        .map(capitalize)
        .join(' ')
    }

    // Too long brand name
    if (product.brand.length > 45) {
      console.info('product.brand truncated.', product.brand)
      product.brand = product.brand.substr(0, 45)
    }
  }

  // offers
  if (productMicrodata.hasOwnProperty('offers')) {
    let offer = productMicrodata.offers
    // We will only take into account the first 'offer', for now.
    if (productMicrodata.offers.constructor === Array) {
      offer = productMicrodata.offers.shift()
    }

    let value = getStringValue(offer.price) || ''
    product['price'] = parsePrice(value) as number

    // Euro as the default currency, to improve
    product['priceCurrency'] = getStringValue(offer.priceCurrency, 'EUR') as string

    const ItemAvailability = ['Discontinued', 'InStock', 'InStoreOnly', 'LimitedAvailability',
      'OnlineOnly', 'OutOfStock', 'PreOrder', 'PreSale', 'SoldOut']

    product['availability'] = getStringValue(offer.availability)

    if (product['availability'] && ItemAvailability.indexOf(product['availability']) < 0) {

      product['availability'] = product['availability']
        .replace('http://schema.org/', '')
        .replace('https://schema.org/', '')

      // Fix 1
      if (product['availability'] === 'in stock') {
        product['availability'] = 'InStock'
      }

      // Default
      if (ItemAvailability.indexOf(product['availability']) < 0) {
        console.log('availability not found:', product['availability'])
        product['availability'] = 'InStock'
      }

    }
  }

  // aggregateRating
  if (productMicrodata.aggregateRating && productMicrodata.aggregateRating.ratingValue) {
    let aggregateRating = productMicrodata.aggregateRating
    let worstRating = getNumberValue(aggregateRating.worstRating, 0)
    let bestRating = getNumberValue(aggregateRating.bestRating, 5)
    let ratingValue = getNumberValue(aggregateRating.ratingValue)
    let reviewCount = getNumberValue(aggregateRating.reviewCount) || getNumberValue(aggregateRating.ratingCount)
    product['ratingValue'] = (ratingValue - worstRating) / (bestRating - worstRating)
    product['ratingCount'] = reviewCount
  }
  return product
}

/**
 *
 * @param metadata htmlmetaparser result.
 * @returns number of products found
 */
export function numberOfProducts (metadata: Result): number {
  if (metadata.microdata && metadata.microdata.hasOwnProperty('@graph')) {
    return metadata.microdata['@graph'].filter((d: any) => d['@type'] === 'Product').length
  }
  return 0
}
