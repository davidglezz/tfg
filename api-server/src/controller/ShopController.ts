import { DeepPartial } from 'typeorm/common/DeepPartial'
import { JsonController, Get, Post, Patch, Put, Delete, Authorized, Param, QueryParam } from "routing-controllers"
import { Connection, getConnectionManager, Repository, FindManyOptions } from 'typeorm';
import { EntityFromParam, EntityFromBody, EntityFromBodyParam } from "typeorm-routing-controllers-extensions"
import { Shop } from "../persistence"
import { Url } from '../persistence/entities/Url';

interface Dictionary<T> { [key: string]: T; }

@JsonController('/api/shops')
export class ShopController {
    private connection: Connection
    private repository: Repository<Shop>

    constructor() {
        this.connection = getConnectionManager().get()
        this.repository = this.connection.getRepository(Shop)
    }

    @Get("/")
    getAll( @QueryParam("page") page = 0,
        @QueryParam("limit") limit = 1000,
        @QueryParam("orderBy") orderBy: string,
        @QueryParam("orderWay") orderWay: 'ASC' | 'DESC' = 'ASC',
        @QueryParam("type") type: 'full' | 'simple' = 'full',
    ) {

        const query = this.repository.createQueryBuilder("shop")

        if (type === 'simple') {
            query.select([
                "shop.id",
                "shop.name",
                "shop.domain"
            ])
        }

        if (limit !== 0) {
            query.skip(page * limit).take(limit)
        }

        if (orderBy) {
            query.orderBy(orderBy, orderWay)
        }

        return query.getMany()
    }

    @Get("/urls/waiting")
    getAllPendingUrls() {
        return this.connection
            .query('SELECT count(1) as waiting FROM url WHERE url.dateNextUpd < now()')
            .then(data => data[0])
    }

    @Get("/:id/urls/waiting")
    getPendingUrls( @Param("id") id: number) {
        id = Number(id)
        if (isNaN(id) || id < 0)
            id = 0 // TODO throw error    
        return this.connection
            .query(`SELECT count(1) as waiting FROM url WHERE url.shopId = ${id} AND url.dateNextUpd < now()`)
            .then(data => data[0])
    }

    @Get("/:id")
    getById( @EntityFromParam("id", { required: true }) shop: Shop) {
        return shop
    }

    @Post("/")
    create( @EntityFromBody({ required: true }) shop: Shop) {
        return this.repository.save(shop)
    }

    @Post("/:id")
    updateOne( @EntityFromBody({ required: true }) shop: Shop) {
        return this.repository.save(shop);
    }

    @Put("/")
    createMany( @EntityFromBody({ required: true, type: Shop }) shops: Array<Shop>) {
        console.log(shops)
        shops.forEach(shop => shop.hash = Url.getHashCode(shop.domain))
        return this.repository.save(shops);
    }

    @Delete("/")
    deleteAll( @QueryParam("confirm") confirm = false) {
        if (confirm)
            return this.repository.clear();
    }

    @Delete("/:id")
    deleteOne( @Param("id") id: number) {
        return this.repository.removeById(id);
    }
}
