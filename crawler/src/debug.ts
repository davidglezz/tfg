import * as fs from 'fs'
import * as dateFormat from 'dateformat'

export function writeJsonFile (obj: any) {
  let name = dateFormat(new Date(), 'yyyy-mm-dd_HH-MM-ss_l')
  let path = `${__dirname}/../debug/${name}.json`
  fs.writeFile(path, JSON.stringify(obj), (e) => {
    if (e) {
      console.error(e)
    }
  })
}

/*
if (err.code === 'ETIMEDOUT') {
    console.log('My dish error: ', util.inspect(err, { showHidden: true, depth: 2 }));
}
*/
