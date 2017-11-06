import { IncomingMessage as httpIncomingMessage } from 'http'

/**
 * Generate a numeric hash of a string
 * @param str
 */
export function stringHash (str: string): number {
  let hash = 5381
  let i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  /* Convert signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0
}

/**
 * Convert timestamp with ms precision to date in sql format
 * @param timestamp
 */
export function timestampToSql (timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Groups the elements of an array according to the result of "iteratee"
 * @param arr
 * @param iteratee
 */
export function groupBy<T> (arr: T[], iteratee: (value: T, index: number, arr: T[]) => string) {
  let result: { [key: string]: T[] } = {}
  arr.forEach((value, index) => {
    let key = iteratee(value, index, arr)
    if (result.hasOwnProperty(key)) {
      result[key].push(value)
    } else result[key] = [value]
  })
  return result
}

/**
 * EventLoopDelayAlert is a tool that notifies when a function takes a long time and blocks the event loop.
 */
type hrTime = [number, number]
export class EventLoopDelayAlert {
  private stoping = false

  constructor (
    private interval: number = 300,
    private maxDelay: number = 100,
    private onDelayAlert: (delay: number) => void) {
  }

  start () {
    if (this.stoping) {
      this.stoping = false
      return
    }
    let before = process.hrtime()
    let This = this
    setTimeout(() => {
      const delay = This.getHrDiffTime(before) - This.interval

      if (delay > This.maxDelay) {
        This.onDelayAlert(delay)
      }

      This.start()
    }, this.interval)
  }

  stop () {
    this.stoping = true
  }

  private getHrDiffTime (time: hrTime) {
    let ts = process.hrtime(time)
    // convert seconds & nanoseconds to miliseconds
    return ts[0] * 1000 + ts[1] / 1000000
  }
}

export function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * @param value String value that you want to convert
 * @param decimal String Separator character like ',' or '.', if it is not provided, it is autodetected.
 */
export function parsePrice (value: string | string[], decimal?: string): Number | Number[] {
  // Recursively unformat arrays:
  if (Array.isArray(value)) {
    return value.map(val => parsePrice(val)) as Number[]
  }

  // Fails silently (need decent errors):
  let result = value || 0
  // Return the value as-is if it's already a number:
  if (typeof result === 'number') {
    return result
  }

  // Detect decimal point separator char
  function detectDecimalPointSeparatorChar (val: string): string {
    const lastDot = val.lastIndexOf('.')
    const lastComma = val.lastIndexOf(',')

    if (lastDot === lastComma) {
      return ''
    }

    let numDots = lastDot >= 0 ? (val.match(/\./g) || []).length : 0
    let numCommas = lastComma >= 0 ? (val.match(/,/g) || []).length : 0

    if (numDots > 2) numDots = 2
    if (numCommas > 2) numCommas = 2
    const last = lastDot > lastComma ? '.' : ','

    /*
    0 0 ''   | 0 1 ','                    | 0 2 '.'
    1 0 '.'  | 1 1 last                   | 1 2 last == '.' ? '.' : ''
    2 0 ','  | 2 1 last == ',' ? ',' : '' | 2 2 ''
    */
    const decimalLookup: { [key: number]: { [key: number]: { [key: string]: string } } } = {
      0: { 1: { ',': ',' }, 2: { ',': '.' } },
      1: { 0: { '.': '.' }, 1: { '.': '.', ',': ',' }, 2: { '.': '.', ',': '' } },
      2: { 0: { '.': ',' }, 1: { '.': '', ',': ',' }, 2: { '.': '', ',': '' } }
    }
    return decimalLookup[numDots][numCommas][last]
  }

  if (decimal === undefined) {
    decimal = detectDecimalPointSeparatorChar(result)
  }

  // Build regex to strip out everything except digits, decimal point and minus sign:
  let regex = new RegExp('[^0-9\-' + decimal + ']', 'g')

  result = result
    .replace(/\((?=\d+)(.*)\)/, '-$1') // replace bracketed values with negatives
    .replace(regex, '')         // strip out any cruft

  // make sure decimal point is standard
  if (decimal !== '' && decimal !== '.') {
    result = result.replace(decimal, '.')
  }

  result = parseFloat(result)

  // This will fail silently which may cause trouble, let's wait and see:
  return !isNaN(result) ? result : 0
}

// https://github.com/node-modules/charset/blob/master/index.js
// SEE: https://github.com/bitinn/node-fetch/blob/60cf26c2f3baf566c15632b723664b47f5b1f2db/src/body.js#L230
const CHARTSET_RE = /(?:charset|encoding)\s{0,10}=\s{0,10}['"]? {0,10}([\w\-]{1,100})/i
/**
 * Guest data charset from req.headers, xml, html content-type meta tag
 * headers:
 *  'content-type': 'text/html;charset=gbk'
 * meta tag:
 *  <meta http-equiv="Content-Type" content="text/html; charset=xxxx"/>
 * xml file:
 *  <?xml version="1.0" encoding="UTF-8"?>
 *
 * @param {Object} obj `Content-Type` String, or `res.headers`, or `res` Object
 * @param {Buffer} [data] content buffer
 * @param {Number} [peekSize] max content peek size, default is 512
 * @return {String} charset, lower case, e.g.: utf8, gbk, gb2312, ....
 *  If can\'t guest, return null
 * @api public
 */
export function charset (obj: String | httpIncomingMessage | Object, data?: Buffer, peekSize?: number) {
  let matchs = null
  let end = 0
  if (data) {
    peekSize = peekSize || 512
    end = data.length > peekSize ? peekSize : data.length
  }
  // charset('text/html;charset=gbk')
  let contentType = obj
  if (contentType && typeof contentType !== 'string') {
    let headers: any = obj.hasOwnProperty('headers') ? (obj as httpIncomingMessage).headers : obj
    contentType = headers['content-type'] || headers['Content-Type']
  }
  if (contentType) {
    // guest from obj first
    matchs = CHARTSET_RE.exec(contentType as string)
  }
  if (!matchs && end > 0) {
    // guest from content body (html/xml) header
    contentType = (data as Buffer).slice(0, end).toString()
    matchs = CHARTSET_RE.exec(contentType as string)
  }
  let cs = null
  if (matchs) {
    cs = matchs[1].toLowerCase()
    if (cs === 'utf-8') {
      cs = 'utf8'
    }
  }
  return cs
}
