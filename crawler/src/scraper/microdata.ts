import { RequestResponse } from 'request';
import { Readable } from 'stream';
import * as zlib from 'zlib';
import { Handler as metaparserHandler, Result, ResultJsonLd } from 'htmlmetaparser';
import * as htmlparser from 'htmlparser2';
import * as request from 'request';
import { ProductDTO } from '../persistence/entities/Product';
import * as iconv from 'iconv-lite';
import { charset as getCharset, capitalize, parsePrice } from '../util';
import { writeJsonFile } from '../debug';
import { Dictionary } from '../interfaces/Dictionary';

// https://search.google.com/structured-data/testing-tool/
// Encoding: https://github.com/request/request/issues/2355
// Charset https://github.com/axios/axios/pull/869/files

// TODO separar request de la extraccion de datos

export async function extractMicrodata(url: string): Promise<microdataResult> {
    return new Promise<microdataResult>((resolve, reject) => {
        url = encodeURI(url)
        let result: microdataResult = {
            'url': url,
            'status': 200
        }

        // TODO mejorar : espera 2 callbacks y resuelve promesa : usar Promise.all()
        let requestCompleted = false
        let parseComplete = false
        const resolveIfCompleted = () => {
            if (requestCompleted && parseComplete)
                resolve(result)
        }

        function onRequestEnd(error: any, response: RequestResponse, body: any): void {
            if (error) {
                reject(error);
            } else {
                let redirect = response.request as any
                result.url = redirect.uri.href;
                requestCompleted = true
                resolveIfCompleted()
            }
        }

        function onMetaparserEnd (err: Error | null, data: Result) {
            result.data = data
            parseComplete = true
            resolveIfCompleted()
        }

        const handler = new metaparserHandler(onMetaparserEnd, { 'url': url })
        const parser = new htmlparser.WritableStream(handler, { decodeEntities: true })

        let reqOptions = {
            method: "GET",
            url: url,
            followAllRedirects: true, // TODO no seguir
            timeout: 10000
        };

        let req = request(reqOptions, onRequestEnd) // .setMaxListeners(0);
        // TODO probar con opciones encoding y gzip de request
        // https://github.com/request/request/issues/311#issuecomment-244272794
        // TODO decode charset:
        // http://www.opirata.com/es/marco-expositor-para-vinilo-p-40284.html
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
        // https://developer.mozilla.org/es/docs/Web/HTTP/Headers/Accept-Charset
        /*req.on('response', function (resp) {
            let charset = getCharset(resp),
                encoding = resp.headers['content-encoding'],
                decodedRes;
            
            // unzip
            if (encoding == 'gzip' || encoding == 'deflate')
                decodedRes = resp.pipe(encoding == 'gzip' ? zlib.createGunzip() : zlib.createInflate())
            else
                decodedRes = resp

            // charset
            if (charset && charset != 'utf-8' && iconv.encodingExists(charset)) {
                return decodedRes.pipe(iconv.decodeStream(charset))
            }

            return decodedRes
        })*/
        req.pipe(parser);
    })

}

export interface microdataResult {
    data?: Result;
    url: string;
    status: number;
}

function getStringValue(obj: Array<Dictionary<any>> | Dictionary<any> | undefined, value?: string): string | undefined {
    if (typeof obj === 'undefined')
        return value

    // Si es array solo se tiene en cuenta el primero
    // TODO mejorar sorte para multiples valores
    if (obj.constructor === Array)
        obj = (obj as Array<any>).shift()

    if (typeof obj === 'object' && (obj as any)['@value'])
        value = (obj as any)['@value']

    return value
}

function getNumberValue(obj: Array<Dictionary<any>> | Dictionary<any> | undefined, value = 0): number {
    let n = Number(getStringValue(obj))
    return isNaN(n) ? value : n
}

export function productFromMetadata(metadata: Result): ProductDTO {
    let productMicrodata: ResultJsonLd = metadata.microdata!['@graph'].filter((d: any) => d['@type'] == 'Product')[0]

    let product = {} as ProductDTO;

    if (productMicrodata.name && productMicrodata.name['@language'])
        product['language'] = productMicrodata.name['@language']

    let fields = ['name', 'description', 'image', 'productID', 'gtin13', 'mpn', 'sku', 'brand', 'color']
    fields.forEach((prop, index) => {
        if (productMicrodata.hasOwnProperty(prop)) {
            let value = getStringValue(productMicrodata[prop])
            if (value)
                product[prop] = value
        }
    })

    // TODO
    /* elcorteingles no muestra el nombre directamente
    brand
        @type: Thing
        name: HP
    */

    // FIX brand
    if (product.brand) {
        // Url en vez de nombre
        const bar = product.brand.lastIndexOf('/')
        if (bar >= 0) {
            // Cortar, separar por "-", capitalizar y unir con espacion
            product.brand = product.brand
                .substring(bar + 1, product.brand.length)
                .split('-')
                .map(capitalize)
                .join(' ')
        }

        // Demasiado larga
        if (product.brand.length > 45) {
            console.info("product.brand truncated.", product.brand)
            product.brand = product.brand.substr(0, 45)
        }
    }

    // offers
    if (productMicrodata.hasOwnProperty('offers')) {
        let offer = productMicrodata.offers
        // Solo tendremos en cuenta la primera 'oferta'.
        if (productMicrodata.offers.constructor === Array)
            offer = productMicrodata.offers.shift()

        let value = getStringValue(offer.price) || ''
        product['price'] = parsePrice(value) as number
        product['priceCurrency'] = getStringValue(offer.priceCurrency, 'EUR') as string // De momento por defecto €

        const ItemAvailability = ['Discontinued', 'InStock', 'InStoreOnly', 'LimitedAvailability',
            'OnlineOnly', 'OutOfStock', 'PreOrder', 'PreSale', 'SoldOut']

        product['availability'] = getStringValue(offer.availability)

        // Correcciones
        if (product['availability'] && ItemAvailability.indexOf(product['availability']) < 0) {

            product['availability'] = product['availability']
                .replace('http://schema.org/', '')
                .replace('https://schema.org/', '')

            // Fix 1
            if (product['availability'] == 'in stock')
                product['availability'] = 'InStock'

            // Default
            if (ItemAvailability.indexOf(product['availability']) < 0) {
                console.log('availability no reconocido:', product['availability'])
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
 * @param metadata Resultado de htmlmetaparser
 * @returns number of products found
 */
export function numberOfProducts(metadata: Result): number {
    if (metadata.microdata && metadata.microdata.hasOwnProperty('@graph'))
        return metadata.microdata['@graph'].filter((d: any) => d['@type'] == 'Product').length
    return 0
}
