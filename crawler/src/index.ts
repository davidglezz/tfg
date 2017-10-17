import { extractMicrodata, productFromMetadata } from './scraper/microdata';
import 'reflect-metadata';
import { createConnection, useContainer, ConnectionOptions, Connection } from "typeorm"
import { Container } from "typedi"
import { error, inspect } from 'util'
import { connectionOptions  } from './persistence'
import { whilst, AsyncFunction } from 'async'
import { TaskUpdateSitemap } from './tasks/TaskUpdateSitemap'
import { TaskUpdateUrls } from './tasks/TaskUpdateUrls';
import { Url } from './persistence/entities/Url';
import { Task } from './interfaces/Task';

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100;
process.on('uncaughtException', console.error);

useContainer(Container)
async function main() {
    // Conexión con la base de datos
    const connection: Connection = await createConnection(connectionOptions)

    let stats = {} as any
    (global as any).statistics = stats;
    //const statsTimer = setInterval(() => console.dir(stats, { depth: null, colors:true }), 10000)
   // const statsTimer = setInterval(() => console.log(stats), 10000)
    
    // Tareas concurrentes
    /*let task: AsyncFunction<void, Error>[] = [taskUpdateSitemap, taskUpdateUrls]*/
    let task = [TaskUpdateSitemap, TaskUpdateUrls]
    let taskPromise = task.map(async (task, index) => {
        return new Promise<void>(async (resolve, reject) => {
            console.info(`[START] ${task.name}`)
            stats[task.name] = {}
            const taskInstance = new task(stats[task.name])//Reflect.construct(task, [stats[task.name]])

            whilst<Error>(
                () => true, // TODO establecer condición de parada
                taskInstance.run.bind(taskInstance),
                (error) => {
                    error ? console.error(`[ERROR] ${task.name}`, error) : console.info(`[STOP] ${task.name}`)
                    resolve() // Silenciamos el error
                }
            )
        })
    })
    return Promise.all(taskPromise)/*.then(() => clearInterval(statsTimer));*/
}

main()
    .then(() => { console.info("Fin de la ejecución.") })
    .catch((e) => { console.error("La ejecución termino con errores", e) })


