import * as gdom from '.'
import { writeJsonFile } from '../../debug'

let query = `{
  page(url:"http://news.ycombinator.com") {
    items: query(selector:"tr.athing") {
      rank: text(selector:"td span.rank")
      title: text(selector:"td.title a")
      sitebit: text(selector:"span.comhead a")
      url: attr(selector:"td.title a", name:"href")
      attrs: next {
         score: text(selector:"span.score")
      }
    }
  }
}`

gdom.parse(query).then(function (result) {
  console.log(result)
  writeJsonFile(result)
})
