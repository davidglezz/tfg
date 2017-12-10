import { Stream } from 'stream'

export interface Scraper {
  extract(stream: Stream): Promise<any>
}
