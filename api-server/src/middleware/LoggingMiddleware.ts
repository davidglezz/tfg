import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers'

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {

  use (request: any, response: any, next: (err?: any) => any): void {
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(time, request.url)
    next()
  }

}
