import 'reflect-metadata'
import { createConnection, useContainer, ConnectionOptions, Connection } from 'typeorm'
import { Container } from 'typedi'
import * as express from 'express';
import { createExpressServer } from 'routing-controllers'
import { LoggingMiddleware } from './middleware/LoggingMiddleware'
import { connectionOptions } from './persistence/connectionOptions'

const config = {
    port: 80,
}

useContainer(Container)
createConnection(connectionOptions)
    .then(async (connection: Connection) => {
        let app = createExpressServer({
            cors: true,
            development: true,
            middlewares: [LoggingMiddleware],
            controllers: [__dirname + '/controller/*{.js,.ts}']
        })
        app.use('/', express.static('public'));
        app.listen(config.port)
        console.log(`Server running on port ${config.port}.`)
    })
    .catch(error => console.error('Error: ', error))
 