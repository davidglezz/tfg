export { connectionOptions } from './connectionOptions'
export { Shop } from './entities/Shop'
export { Url } from './entities/Url'
export { Product } from './entities/Product'
export { PriceHistory } from './entities/PriceHistory'

// https://dev.mysql.com/doc/refman/5.7/en/string-literals.html
export function escapeString (str: string) {
  return str.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (char: string): string {
    switch (char) {
      case '\0':
        return '\\0'
      case "'":
        return "\\'"
      case '"':
        return '\\"'
      case '\b':
        return '\\b'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\t':
        return '\\t'
      case '\x1a':
        return '\\Z'
      case '\\':
      case '%':
        return '\\' + char
      default: return '\\' + char
    }
  })
}
