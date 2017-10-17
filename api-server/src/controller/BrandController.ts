import { JsonController, Get, Post, Patch, Put, Delete, Authorized, Param, QueryParam } from "routing-controllers"
import { getConnectionManager, Repository, FindManyOptions, Connection } from 'typeorm';
import { EntityFromParam, EntityFromBody, EntityFromBodyParam } from "typeorm-routing-controllers-extensions"

interface Dictionary<T> { [key: string]: T; }

@JsonController('/api/brands')
export class ShopController {
    private connection: Connection

    constructor() {
        this.connection = getConnectionManager().get()
    }

    @Get("/")
    getAll( @QueryParam("type") type: string) {
        if (type === 'simpleList')
            return this.connection
                .query('SELECT DISTINCT p.brand FROM product p WHERE p.brand IS NOT NULL ORDER BY p.brand ASC')
                .then(data => data.map((row:any) => row.brand))
    }
}
