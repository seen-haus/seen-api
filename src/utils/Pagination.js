module.exports = class Pagination {
    constructor(data, perPage, page) {
        this.data = data
        this.perPage = perPage
        this.page = parseInt(page)

        this.setup()
    }

    setup() {
        const totalPages = Math.ceil(this.data.total / this.perPage)

        this.pagination = {
            total: parseInt(this.data.total),
            count: this.data.results.length,
            perPage: parseInt(this.perPage),
            currentPage: parseInt(this.page),
            totalPages: parseInt(totalPages),
        }
    }

    get() {
        return {
            data: this.data.results,
            pagination: this.pagination,
        }
    }
}
