const {HTTP_OK, HTTP_NOT_FOUND} = require("./../constants/HTTPCodes");

class Controller {
    constructor(props) {
        this.errors = null
        this.metadata = null
    }

    setErrors(errors) {
        this.errors = errors

        return this
    }

    setMetadata(metadata) {
        this.metadata = metadata

        return this
    }

    sendResponse(res, data = null, message = "", code = HTTP_OK) {
        if (data && typeof data === "object" && !Array.isArray(data) && data.hasOwnProperty("meta")) {
            this.metadata = { ...this.metadata, ...data.meta }
        }

        res.status(code)

        res.json(this._prepareResponse(message, data))
    }

    sendError(res, error = "Error", code = HTTP_NOT_FOUND) {
        res.status(code)
        res.json(this._prepareErrorResponse(error))
    }

    _prepareResponse(message, data) {
        const response = {
            status: true,
        }

        if (message) {
            response["message"] = message
        }

        if (data) {
            response["data"] = this._extractData(data)
        }

        if (this.metadata) {
            response["metadata"] = this.metadata
        }

        return response
    }

    _prepareErrorResponse(errorMessage) {
        const response = {
            status: false,
        }

        if (errorMessage) {
            response["message"] = errorMessage
        }

        if (this.errors) {
            response["data"] = this.errors
        }

        if (this.metadata) {
            response["metadata"] = this.metadata
        }

        return response
    }

    _extractData(data) {
        if (typeof data === "object" && !Array.isArray(data) && data.hasOwnProperty("paginatedData")) {
            return data.paginatedData
        }

        return data
    }

    extractPagination(req) {
        return {
            page: req.params.page && req.params.page > 0 ? req.params.page : 1,
            perPage: req.params.perPage && req.params.perPage < 50 ?  req.params.perPage : 6,
        }
    }
}
module.exports = Controller;
