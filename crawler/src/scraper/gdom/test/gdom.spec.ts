import 'mocha'
import 'chai'
import 'chai-as-promised'
import 'fs'
import express from 'express';
import { parse } from '.'

chai.should()
chai.use(chaiAsPromised)

const app = express()
  .get('/', (req, res) => res.send(fs.readFileSync('./tests/html/test.html', 'utf8')))
  .listen(3333)

const query = `{
                page(url:"http://localhost:3333"){
                    text:text(selector:".text")
                    attr:attr(selector:".attr", name:"href")
                    tag:tag(selector:".attr")
                    items:query(selector:".list-next .item"){
                      text
                    }
                    itemsHtml:query(selector:".list .item"){
                      html:html
                    }
                    next:next(selector:".list-next"){
                      text
                    }
                    parent:query(selector:".children"){
                      parent{
                        text
                      }
                    }
                }
            }`;

describe('GDOM parser', () => {
  let result: {}
  before(() => {
    result = parse(query)
  })

  describe('text()', () => {
    it('Get text from given selector', () =>
      result.should.eventually.to.have.deep.property('data.page.text', 'text')
    )
  })

  describe('attr()', () => {
    it('Get attr from given selector and attr name', () =>
      result.should.eventually.to.have.deep.property('data.page.attr', '/href')
    )
  })

  describe('query()', () => {
    it('Get elements queried by selector', () =>
      result.should.eventually.to.have.deep.property('data.page.items')
        .that.is.an('array')
        .with.deep.property('[1]')
        .that.deep.equals({ text: '4' })
    )
  })

  describe('html()', () => {
    it('Get element innerHtml', () =>
      result.should.eventually.to.have.deep.property('data.page.itemsHtml')
        .that.is.an('array')
        .with.deep.property('[1]')
        .that.deep.equals({ html: '<span>b</span>' })
    )
  })

  describe('tag()', () => {
    it('Get element tag', () =>
      result.should.eventually.to.have.deep.property('data.page.tag', 'a')
    )
  })

  describe('next()', () => {
    it('Get next element(sibling)', () =>
      result.should.eventually.to.have.deep.property('data.page.next.text', 'Next')
    )
  })

  describe('parent()', () => {
    it('Get element parent', () =>
      result.should.eventually.to.have.deep.property('data.page.parent[0].parent.text', 'text')
    )
  })
})
