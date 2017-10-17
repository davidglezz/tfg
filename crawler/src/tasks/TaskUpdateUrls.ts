import 'reflect-metadata'
import { getConnectionManager, Connection, Repository } from "typeorm"
import { Container } from "typedi"
import { Shop, Product, Url, PriceHistory } from '../persistence'
import { eachSeries, eachLimit, ErrorCallback } from 'async'
import { extractMicrodata, numberOfProducts, productFromMetadata, microdataResult } from '../scraper/microdata'
import { writeJsonFile } from '../debug'
import { ProductDTO } from '../persistence/entities/Product'
import { groupBy, timestampToSql } from '../util'
import { Dictionary } from '../interfaces/Dictionary';
import { Task } from '../interfaces/Task';
import { Result } from 'htmlmetaparser';

export class TaskUpdateUrls implements Task {

    private connection: Connection
    private repository: Dictionary<Repository<any>>

    private config = {
        BatchSize: 1000,
        Concurrency: 25,
        RedirectUpdTime: 31536000000, // 1 año
        NoProductUpdTime: 31536000000, // 1 año
        DefaultTimeToNextRun: 60000 // 1 minuto
    }

    constructor(public stats: Dictionary<any> = {}, config?: any) {
        if (typeof config === "object")
            Object.assign(this.config, config)
        this.connection = getConnectionManager().get()
        this.repository = {
            shop: this.connection.getRepository(Shop),
            url: this.connection.getRepository(Url),
            product: this.connection.getRepository(Product),
            priceHistory: this.connection.getRepository(PriceHistory)
        }

        this.stats.runCount = 0
        this.stats.proccessedUrls = 0
    }

    /**
     * Analiza urls en busca de microdatos
     */
    async run() {
        this.stats.runCount++
        //console.log('[-] Tarea de actualizacion de url, productos y precios')
        return new Promise<void>(async (resolve, reject) => {
            let result: Url[] = await this.repository.url.createQueryBuilder("url")
                .innerJoinAndSelect("url.shop", "shop")
                .leftJoinAndSelect("url.product", "product")
                .where("url.dateNextUpd < :value", { value: timestampToSql(Date.now()) })
                .orderBy("url.dateNextUpd", "ASC")
                .limit(this.config.BatchSize)
                .getMany()

            eachLimit<Url, Error>(result, this.config.Concurrency, async (url: Url) => {
                this.stats.proccessedUrls++
                await this.proccessUrl(url).catch(e => console.error("[ERROR] Al procesar", url, e))
            }, async (err: any) => {
                if (err)
                    console.warn(err) // no se hace reject(err), No pasa nada

                // Resolver inmediatamente o // DevMode:
                resolve() // setTimeout(resolve, await this.getNextUpdate())
            })
        })
    }

    /**
     * Extrae los microdatos de la url y actualiza los registros correspondientes
     * @param url 
     */
    async proccessUrl(url: Url) {
        // TODO detección temprana de redirecciones .. request.on('redirect')
        let response = await extractMicrodata(url.href)
            .catch(() => console.info('No contiene o no se pudieron obtener microdatos:', url.href))

        // TODO definir estados
        url.status = !response || !response.status ? 600 : response.status

        // Si no se pueden obtener los microdatos...
        if (!response || !response.data) {
            console.info('No contiene microdatos:', url.href)
            url.dateNextUpd = new Date(Date.now() + this.config.RedirectUpdTime)
            return this.repository.url.save(url).catch(console.error)
        }

        // Si redirecciona no escanear en 1 año y añadir la nueva url
        if (response.url != url.href) {
            console.info("Redireccion", url.href + ' -> ' + response.url)
            url.status = 301
            // Comprobar si ya existe
            let urlHash = Url.getHashCode(response.url)
            let dbUrl = await this.repository.url.findOne({ 'where': { 'hash': urlHash, 'shopId': url.shop.id } })
            url.dateNextUpd = new Date(Date.now() + this.config.RedirectUpdTime)
            const urls = [url]
            if (!dbUrl)
                urls.push(new Url(response.url, url.shop, undefined, urlHash))
            // let newUrl = this.repository.url.create({ hash: urlHash, shop: url.shop, href: response.url })
            return this.repository.url.save(urls).catch(console.error)
        }

        // Si la página no contiene solo un producto
        const nbProducts = response.data ? numberOfProducts(response.data) : 0
        if (nbProducts != 1) {
            // No volver a analizar hasta dentro de bastante tiempo
            console.info(`Contiene ${nbProducts} productos != 1`, url.href)
            url.dateNextUpd = new Date(Date.now() + this.config.NoProductUpdTime)
            return this.repository.url.save(url).catch(console.error)
        }

        // La página contiene un solo producto:
        let productInfo: ProductDTO = productFromMetadata(response.data as Result)
        let priceChanges = true

        this.calcTotalPrice(productInfo, url.shop)

        // Si el producto no esta creado: Crear producto y establecer precio
        if (!url.product) {
            console.info("Crea producto", url.href)
            url.product = this.repository.product.create(productInfo)
            await this.repository.product.save(url.product).catch(console.error)
        } else {
            // Si el precio o disponibilidad cambia
            priceChanges = Math.abs(url.product.price - productInfo.price) >= 0.01 // Diferencia >= a 1 céntimo
            if (priceChanges || url.product.availability !== productInfo.availability) {
                console.info('Actualiza precio:', url.href)
                url.product.price = productInfo.price
                url.product.priceTotal = productInfo.priceTotal
                url.product.availability = productInfo.availability
                await this.repository.product.save(url.product).catch(console.error)
            } else {
                console.info('No actualiza precio:', url.href)
            }
        }

        // Guardar url
        url.dateNextUpd = new Date(Date.now() + url.shop.productUpdInterval)
        await this.repository.url.save(url).catch((e) => {
            console.error("Ocurrio un error al guardar url.", url.href)
        })

        // Añadir historial de precio
        if (priceChanges && productInfo.price >= 0) {
            let priceHistory = this.repository.priceHistory.create({
                date: timestampToSql(Date.now()),
                price: productInfo.price,
                priceTotal: productInfo.priceTotal,
                url: url
            })
            await this.repository.priceHistory.save(priceHistory)
        }
    }

    /**
     * @returns number of ms to the next update
     */
    async getNextUpdate(): Promise<number> {
        return this.repository.url.createQueryBuilder("url")
            .select('url.dateNextUpd')
            .orderBy("url.dateNextUpd", "ASC")
            .getOne()
            .then(row => {
                if (!row || !row.dateNextUpd)
                    return this.config.DefaultTimeToNextRun

                let timespan = row.dateNextUpd.getTime() - Date.now()
                if (timespan < 0) timespan = 0
                return timespan > this.config.DefaultTimeToNextRun ? this.config.DefaultTimeToNextRun : timespan
            })
            .catch(() => this.config.DefaultTimeToNextRun)
    }

    /**
     * Calcula el precio total del producto.
     * Esto deberia mejorarse teniendo en cuenta otros factores (peso, pais, ...)
     * @param productInfo
     * @param shop
     */
    calcTotalPrice(productInfo: ProductDTO, shop: Shop) {
        if (productInfo.price >= 0) {
            if (shop.vatFix != 1)
                productInfo.price *= shop.vatFix

            if (shop.shippingCost >= 0)
                productInfo.priceTotal = productInfo.price + shop.shippingCost
            else
                productInfo.priceTotal = productInfo.price
        } else {
            productInfo.price = 0
            productInfo.priceTotal = 0
        }
    }

}
