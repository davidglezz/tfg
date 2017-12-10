import { Stream } from 'stream'
import { Scraper } from '../interfaces/Scraper'
import { Handler as metaparserHandler, Result } from 'htmlmetaparser'
import * as htmlparser from 'htmlparser2'
import { HttpRequest, CustomIncomingMessage } from '../clases/HttpRequest'

/**
 *
 */
export class StructuredData implements Scraper {

  constructor (private url: string) {  }

  async downloadAndExtract () {
    return new Promise<Result>((resolve, reject) => {
      let options = {
        method: 'GET',
        url: this.url,
        followAllRedirects: false, // TODO no follow
        timeout: 10000
      }
      const httpRequest = HttpRequest.getRequest().get(options)
      httpRequest.on('error', (error) => {
        reject(error)
      })
      httpRequest.on('response', (response: CustomIncomingMessage) => {
        if (response.statusCode !== 200) {
          return reject(response)
        }
        this.extract(httpRequest).then(resolve)
      })
    })
  }

  async extract (stream: Stream): Promise<any> {
    return new Promise<Result>((resolve, reject) => {

      function onMetaparserEnd (error: Error | null, data: Result) {
        if (error) {
          reject(error)
        }
        resolve(data)
      }

      const handler = new metaparserHandler(onMetaparserEnd, { 'url': this.url })
      const parser = new htmlparser.WritableStream(handler, { decodeEntities: true })
      stream.pipe(parser)
    })
  }

}
