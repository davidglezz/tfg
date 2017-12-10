import { IncomingHttpHeaders } from 'http'
import { Url } from 'url'
import * as request from 'request'

type Request = request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>

/**
 * Pattern: <<~Singleton>>
 */
export class HttpRequest {

  private static headers = {
    'user-agent': 'TFG-DAVID'
  }

  private static agentOptions = {
    keepAlive: false // true
  }

  private static request: Request

  public static getRequest (): Request {
    if (!this.request) {
      HttpRequest.request = request.defaults({
        headers: this.headers,
        agentOptions: this.agentOptions,
        timeout: 30000
      })
    }

    return this.request
  }

  public static async get (url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      HttpRequest.getRequest()(url, function (error, response, body) {
        if (error) {
          reject(error)
        } else if (response && response.statusCode !== 200) {
          reject(response)
        } else {
          resolve(body)
        }
      })
    })
  }
}

// request .on('response') response argument is this instead of http.IncomingMessage
export interface CustomIncomingMessage {
  headers: IncomingHttpHeaders
  statusCode: number
  request: {
    uri: Url
    method: string
    headers: IncomingHttpHeaders
  }
}
