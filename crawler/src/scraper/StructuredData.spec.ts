import 'mocha'
import { expect } from 'chai'
import { HttpRequest, CustomIncomingMessage } from '../clases/HttpRequest'

describe('Structured Data', () => {

  it('should test', () => {
    const url = 'https://www.orbitadigital.com/es/cctv/4883-safire-sf-ipcv798zw-5-camara-ip-5-megapixel-1-29-progressive-scan-cmos.html'
    let options = {
      method: 'GET',
      url: url,
      followAllRedirects: false, // TODO no follow
      timeout: 10000
    }
    const httpRequest = HttpRequest.getRequest().get(options)

    httpRequest.on('error', (error) => {
      console.error(error)
    })

    httpRequest.on('response', async (response: CustomIncomingMessage) => {
      console.log(response.statusCode) // 200
      console.log(response.headers['content-type'])
      console.log(response.request.uri)
      if (response.statusCode === 200) {
        let sd = new StructuredData(url)
        //writeJsonFile(await sd.extract(httpRequest))
      }
      // writeJsonFile(response)
      /*let redirect = response.request as any
      result.url = redirect.uri.href*/

    })


    //expect(result).to.eql(spected)
  })

})
