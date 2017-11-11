import 'reflect-metadata'
import { createConnection, useContainer } from 'typeorm'
import { Container } from 'typedi'
import { connectionOptions } from './persistence'
import { whilst } from 'async'
import { TaskUpdateSitemap } from './tasks/TaskUpdateSitemap'
import { TaskUpdateUrls } from './tasks/TaskUpdateUrls'

process.setMaxListeners(0)
require('events').EventEmitter.prototype._maxListeners = 250
process.on('uncaughtException', console.error)

useContainer(Container)

async function main () {
  await createConnection(connectionOptions)

  let stats = {} as any
  (global as any).statistics = stats
  // const statsTimer = setInterval(() => console.dir(stats, { depth: null, colors:true }), 1000)

  // Concurrent tasks
  let task = [TaskUpdateSitemap, TaskUpdateUrls]
  let taskPromise = task.map(async task => {
    return new Promise<void>(async (resolve, reject) => {
      console.info(`[START] ${task.name}`)
      stats[task.name] = {}
      const taskInstance = new task(stats[task.name])// or Reflect.construct(task, [stats[task.name]])

      whilst<Error>(
        () => true, // TODO set stop condition
        taskInstance.run.bind(taskInstance),
        (error) => {
          error ? console.error(`[ERROR] ${task.name}`, error) : console.info(`[STOP] ${task.name}`)
          resolve() // Silence the error
        }
      )
    })
  })
  return Promise.all(taskPromise)/*.then(() => clearInterval(statsTimer));*/
}

main()
  .then(() => { console.info('End of execution.') })
  .catch((e) => { console.error('The execution ended with errors.', e) })
