import 'mocha'
import { expect } from 'chai'
import { parsePrice } from '../src/util'

describe('util functions', () => {

  it('should parse price', () => {
    const testInput = ['5', '25', '1.2', '1,2', '-12,25€', '-12,25 €', '144,50 € ', '$5.5', '1.256.000', '1,213.12', '.25', ',0025']
    const result = testInput.map(val => parsePrice(val))
    const spected = [5, 25, 1.2, 1.2, -12.25, -12.25, 144.50, 5.5, 1256000, 1213.12, 0.25, 0.0025]

    expect(result).to.eql(spected)
  })

})
