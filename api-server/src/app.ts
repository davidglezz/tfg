import 'reflect-metadata'
import { createConnection, useContainer, ConnectionOptions, Connection } from 'typeorm'
import { Container } from 'typedi'
import { createExpressServer } from 'routing-controllers'
import { LoggingMiddleware } from './middleware/LoggingMiddleware'
import { connectionOptions } from './persistence/connectionOptions'

const config = {
    port: 3005,
}

useContainer(Container)
createConnection(connectionOptions)
    .then(async (connection: Connection) => {
        createExpressServer({
            cors: true,
            routePrefix: '/api',
            development: true,
            middlewares: [LoggingMiddleware],
            controllers: [__dirname + '/controller/*{.js,.ts}']
        }).listen(config.port)
        console.log(`Server running on port ${config.port}.`)
    })
    .catch(error => console.error('Error: ', error))
 