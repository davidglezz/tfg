import 'reflect-metadata'
import { createConnection, useContainer, Connection } from 'typeorm'
import { Container } from 'typedi'
import * as express from 'express'
import { createExpressServer } from 'routing-controllers'
import { LoggingMiddleware } from './middleware/LoggingMiddleware'
import { connectionOptions } from './persistence/connectionOptions'
import { resolve } from 'path'
import * as compression from 'compression'
import { BrandController } from './controller/BrandController'
import { ProductController } from './controller/ProductController'
import { ShopController } from './controller/ShopController'

const config = {
  port: 80
}

useContainer(Container)
createConnection(connectionOptions)
    .then(async (connection: Connection) => {
      let app = createExpressServer({
        cors: true,
        development: true,
        middlewares: [LoggingMiddleware],
        controllers: [BrandController, ShopController, ProductController]
      })

      app.use(compression())
      app.use('/', express.static('public'))
      app.get('/en/*', function (req: express.Request, res: express.Response) {
        res.contentType('text/html; charset=utf-8')
        res.sendFile(resolve('public/en/index.html'))
      })
      app.get('/es/*', function (req: express.Request, res: express.Response) {
        res.contentType('text/html; charset=utf-8')
        res.sendFile(resolve('public/es/index.html'))
      })
      app.get('/', function (req: express.Request, res: express.Response) {
        res.contentType('text/html; charset=utf-8')
        if (req.acceptsLanguages('es')) {
          res.sendFile(resolve('public/es/index.html'))
        } else {
          res.sendFile(resolve('public/en/index.html'))
        }
      })
      app.listen(config.port)
      console.log(`Server running on port ${config.port}.`)
    })
    .catch(error => console.error('Error: ', error))
