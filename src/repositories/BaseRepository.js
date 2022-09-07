const Pagination = require("./../utils/Pagination");
const BaseTransformer = require("./../transformers/BaseTransformer");

class BaseRepository {
    constructor() {
        this._init()
    }

    _init() {
        if (this.getModel === undefined) {
            throw new TypeError("Repository should have 'model' method defined.")
        }

        this.model = this.getModel()
        this.transformer = null
        this.transformerSkipped = false
    }

    async create(data) {
        // console.log("INSERT DATA", data)
        const result = await this.model.query().insert(data)

        return this.parserResult(result)
    }

    async update(data, id) {
        // console.log("UPDATE DATA", id)
        await this.find(id)

        const result = await this.model.query().patchAndFetchById(id, data)

        return this.parserResult(result)
    }

    async delete(id) {
        await this.find(id)

        return await this.model.query().deleteById(id)
    }

    async find(id) {
        const result = await this.model.query().findById(id)

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findByColumn(column, value) {
        const result = await this.model.query().where(column, value)

        if (result.length === 0) {
            return null;
        }

        return this.parserResult(result[0])
    }

    async findAllByColumn(column, value) {
        const result = await this.model.query().where(column, value)

        if (result.length === 0) {
            return null;
        }

        return this.parserResult(result)
    }

    async all() {
        const results = await this.model.query();

        return this.parserResult(results)
    }

    async paginate(perPage = 10, page = 1) {
        const results = await this.model.query().page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }


    query() {
        return this.model.query()
    }

    setTransformer(transformer) {
        this.transformer = transformer

        return this
    }

    skipTransformer(skip = true) {
        this.transformerSkipped = skip
    }

    parserResult(data) {
        if (this.transformerSkipped || !(this.transformer instanceof BaseTransformer)) {
            return data instanceof Pagination ? data.get() : data
        }

        if (data instanceof Pagination) {
            const paginatedResults = data.get()
            const results = paginatedResults.data.map(datum => this.transformer.transform(datum))
            return {paginatedData: results, meta: {pagination: paginatedResults.pagination}}
        }

        return Array.isArray(data) ? data.map(datum => this.transformer.transform(datum)) : this.transformer.transform(data)
    }
}

module.exports = BaseRepository;
