import { URL } from 'url'
import * as Uri from 'urijs'

/**
 * From Simplecrawler : https://github.com/simplecrawler/simplecrawler
 */
export default class UrlScraper {
  public parseScriptTags: boolean = true
  public parseHTMLComments: boolean = true
  public respectRobotsTxt: boolean = true
  /**
   * Controls what protocols are allowed
   * @type {RegExp[]}
   */
  allowedProtocols: RegExp[] = [
    /^http(s)?$/i,                  // HTTP & HTTPS
    /^(rss|atom|feed)(\+xml)?$/i    // RSS / XML
    // TODO json, text ...
  ]

  /**
   * Collection of regular expressions and functions that are applied in the
   * default {@link this#discoverResources} method.
   * @type {Array.<RegExp|Function>}
   */
  public discoverRegex: (RegExp | Function)[] = [
    /\s(?:href|src)\s?=\s?(["']).*?\1/ig,
    /\s(?:href|src)\s?=\s?[^"'\s][^\s>]+/ig,
    /\s?url\((["']).*?\1\)/ig,
    /\s?url\([^"'].*?\)/ig,

    // This could easily duplicate matches above, e.g. in the case of href="http://example.com"
    /https?:\/\/[^?\s><'"]+/ig,

    // This might be a bit of a gamble... but get hard-coded strings out of javacript: URLs.
    // They're often popup-image or preview windows, which would otherwise be unavailable to us.
    // Worst case scenario is we make some junky requests.
    /^javascript:\s*[\w$.]+\(['"][^'"\s]+/ig,

    // Find srcset links
    (str: string) => {
      let result = /\ssrcset\s*=\s*(["'])(.*)\1/.exec(str)
      return Array.isArray(result) ? String(result[2]).split(',').map(function (str) {
        return str.trim().split(/\s+/)[0]
      }) : ''
    },

    // Find resources in <meta> redirects. We need to wrap these RegExp's in
    // functions because we only want to return the first capture group, not
    // the entire match. And we need two RegExp's because the necessary
    // attributes on the <meta> tag can appear in any order
    (str: string) => {
      let match = str.match(/<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*content\s*=\s*["'] ?[^"'>]*url=([^"'>]*)["']?[^>]*>/i)
      return Array.isArray(match) ? [match[1]] : undefined
    },
    (str: string) => {
      let match = str.match(/<meta[^>]*content\s*=\s*["']?[^"'>]*url=([^"'>]*)["']?[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/i)
      return Array.isArray(match) ? [match[1]] : undefined
    }
  ]

  constructor () {
    // TODO
  }

  /**
   * Normalize url
   * @param url
   */
  public static normalize (url: string): string {
    return Uri(url)
      .normalize()
      .href()
  }

  /**
   * Performs string replace operations on a URL string. Eg. removes HTML
   * attribute fluff around actual URL, replaces leading "//" with absolute
   * protocol etc.
   * @private
   * @param  {String} url          The URL to be cleaned
   * @param  {String} from
   * @return {String}              Returns the cleaned URL
   */
  public cleanURL (url: string, from: URL): string {
    return (url
      .replace(/^(?:\s*href|\s*src)\s*=+\s*/i, '')
      .replace(/^\s*/, '')
      .replace(/^(['"])(.*)\1$/, '$2')
      .replace(/^url\((.*)\)/i, '$1')
      .replace(/^javascript:\s*(\w*\(['"](.*)['"]\))*.*/i, '$2')
      .replace(/^(['"])(.*)\1$/, '$2')
      .replace(/^\((.*)\)$/, '$1')
      .replace(/^\/\//, from.protocol + '://')
      .replace(/&amp;/gi, '&')
      .replace(/&#38;/gi, '&')
      .replace(/&#x00026;/gi, '&')
      .split('#')
      .shift() || '')
      .trim()
  }

  /**
   * Initiates discovery of linked resources in an HTML or text document, and
   * queues the resources if applicable. Not to be confused with
   * {@link this#discoverResources}, despite that method being the main
   * component of this one, since this method queues the resources in addition to
   * discovering them.
   * @param  {String|Buffer}  resourceData The document body to search for URL's
   * @param  {URL|String} from       url that represents the fetched document body
   * @return {}               Response TODO
   */
  public scrape (resourceData: string, from: URL | string): { [key: string]: any; } {
    if (typeof from === 'string') {
      from = new URL(from)
    }

    let resources = this.discoverResources(resourceData.toString())
    resources = this.cleanExpandResources(resources, from)
    return { foundUrls: resources }
  }

  /**
   * Discovers linked resources in an HTML, XML or text document.
   * @param  {String} resourceText The body of the text document that is to be searched for resources
   * @return {Array}               Returns the array of discovered URL's. It is not the responsibility of this method to clean this array of duplicates etc. That's what {@link this#cleanExpandResources} is for.
   */
  private discoverResources (resourceText: string): string[] {
    if (!this.parseHTMLComments) {
      resourceText = resourceText.replace(/<!--([\s\S]+?)-->/g, '')
    }

    if (!this.parseScriptTags) {
      resourceText = resourceText.replace(/<script(.*?)>([\s\S]*?)<\/script>/gi, '')
    }

    if (this.respectRobotsTxt && /<meta(?:\s[^>]*)?\sname\s*=\s*["']?robots["']?[^>]*>/i.test(resourceText)) {
      let robotsValue = /<meta(?:\s[^>]*)?\svalue\s*=\s*["']?([\w\s,]+)["']?[^>]*>/i.exec(resourceText.toLowerCase())

      if (Array.isArray(robotsValue) && /nofollow/i.test(robotsValue[1])) {
        return []
      }
    }

    // Rough scan for URLs
    return this.discoverRegex.reduce((list, extracter) => {
      let resources

      if (extracter instanceof Function) {
        resources = extracter(resourceText)
      } else {
        resources = resourceText.match(extracter)
      }

      return resources ? list.concat(resources) : list
    }, [])
  }

  /**
   * Cleans a list of resources, usually provided by
   * {@link this#discoverResources}. Also makes relative URL's absolute to the
   * URL of the queueItem argument.
   * @param  {Array} urlMatch      An array of URL's
   * @param  {Url} url             The queue item representing the resource where the URL's were discovered
   * @return {Array}               Returns an array of unique and absolute URL's
   */
  private cleanExpandResources (urlMatch: string[], from: URL): string[] {
    if (!urlMatch) {
      return []
    }

    return urlMatch
      .filter(Boolean)
      .map((url) => this.cleanURL(url, from))
      .reduce((list: string[], url: string) => {
        // Ensure URL is whole and complete
        try {
          url = Uri(url)
            .absoluteTo(from.href || '')
            .normalize()
            .href()
        } catch (e) {
          // But if URI.js couldn't parse it - nobody can!
          return list
        }

        // If we hit an empty item, don't return it
        if (!url.length) {
          return list
        }

        // If we don't support the protocol in question
        if (!this.protocolSupported(url)) {
          return list
        }

        // Does the item already exist in the list?
        // var exists = list.some((entry: string) => entry === url);
        if (list.indexOf(url) >= 0) { // exists
          return list
        }

        return list.concat(url)
      }, [] as string[])
  }

  /**
   * Determines whether the this supports a protocol
   * @param  {String} url A full URL, eg. "http://example.com"
   * @return {Boolean}    Returns true if the protocol of the URL is supported, false if not
   */
  private protocolSupported (url: string): boolean {
    let protocol: string

    try {
      protocol = Uri(url).protocol()
    } catch (e) {
      // If URIjs died, we definitely /do not/ support the protocol.
      return false
    }

    // Unspecified protocol. Assume http
    if (!protocol) {
      protocol = 'http'
    }

    return this.allowedProtocols.some(
      (protocolCheck: RegExp) => protocolCheck.test(protocol)
    )
  }

}
