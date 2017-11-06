import * as request from 'request'
import * as htmlparser from 'htmlparser2'
import * as zlib from 'zlib'
import * as merge2 from 'merge2'
import { ICallback } from '../interfaces/Callback'
import { Dictionary } from '../interfaces/Dictionary'

export class SitemapParser {
  headers = { 'user-agent': 'SitemapParser' }
  agentOptions = { keepAlive: true }
  request = request.defaults({
    headers: this.headers,
    agentOptions: this.agentOptions,
    timeout: 30000
  })

  visitedSitemaps: Dictionary<boolean> = {}
  stream: merge2.Merge2Stream

  constructor (onUrl: UrlCallback, private onEnd: ICallback) {
    const handler = new SitemapHandler(onUrl, this.parse.bind(this), err => {
      this.stream.end()
      this.onEnd(err)
    })
    const parserStream = new htmlparser.WritableStream(handler, {
      xmlMode: true,
      recognizeCDATA: true,
      lowerCaseTags: true
    })

    this.stream = merge2({ end: true, objectMode: true } as any) // as any because bad typescript type definition
    this.stream.pipe(parserStream)
  }

  public parse (url: string) {
    if (!this.visitedSitemaps[url]) {
      this.visitedSitemaps[url] = true
      this.stream.add(this.download(url) as NodeJS.ReadableStream)
    }
  }

  public pause () {
    this.stream.pause()
  }

  public isPaused () {
    this.stream.isPaused()
  }

  public resume () {
    this.stream.resume()
  }

  public asPromise (url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onEnd = (err, result) => {
        // this.onEnd(err, result)
        if (err) reject(err)
        else resolve(result)
      }
      this.parse(url)
    })
  }

  private download (url: string) {
    const This = this
    function onError (error: Error) {
      console.log('[ERROR]', error.name, error.message)
      This.stream.end()
    }
    if (url.lastIndexOf('.gz') === url.length - 3) {
      return request
        .get({ url: url, encoding: null })
        .on('error', onError)
        .pipe(zlib.createUnzip())
    } else {
      return request
        .get({ url: url, gzip: true })
        .on('error', onError)
    }
  }
}

class SitemapHandler implements htmlparser.Handler {
  text: string = ''
  isURLSet = false
  isSitemapIndex = false
  inLoc = false

  constructor (private onUrl: UrlCallback, private onSitemap: UrlCallback, private done: ICallback) {
  }

  onopentagname (name: string): void {
    this.inLoc = name === 'loc'
    if (name === 'urlset') {
      this.isURLSet = true
      this.isSitemapIndex = false
    } else if (name === 'sitemapindex') {
      this.isSitemapIndex = true
      this.isURLSet = false
    }
  }

  ontext (value: string): void {
    if (this.inLoc) {
      this.text += value
    }
  }

  onclosetag (tagname: string): void {
    let text = this.text
    this.text = ''

    if (tagname === 'loc') {
      text = normalize(text)
      if (!text) {
        return
      }

      if (this.isURLSet) {
        // Fix if urlset erroneously includes sitemaps
        if (text.lastIndexOf('.xml') >= 0 || text.lastIndexOf('.gz') >= 0) {
          return this.onSitemap(text)
        }

        return this.onUrl(text)
      }

      if (this.isSitemapIndex) {
        this.onSitemap(text)
      }
    }
  }

  onerror (error: Error): void { this.done() }
  onend (): void { this.done() }
}

export type UrlCallback = (url: string) => void

/**
 * Normalize a HTML value, trimming and removing whitespace.
 */
function normalize (value?: string): string {
  return value == null ? '' : value.trim().replace(/\s+/g, ' ')
}
