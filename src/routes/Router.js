const {Router: ExpressRouter} = require("express");
const Controllers = require('./../controllers');

class Router {
    constructor() {
        this.router = ExpressRouter()
    }

    get(path, middleware = [], ...actions) {
        actions = [...middleware, ...this._resolveController(actions)]
        this.router.get(path, ...actions)
    }

    post(path, middleware = [], ...actions) {
        actions = [...middleware, ...this._resolveController(actions)]
        this.router.post(path, ...actions)
    }

    patch(path, middleware = [], ...actions) {
        actions = [...middleware, ...this._resolveController(actions)]
        this.router.patch(path, ...actions)
    }

    put(path, middleware = [], ...actions) {
        actions = [...middleware, ...this._resolveController(actions)]
        this.router.put(path, ...actions)
    }

    delete(path, middleware = [], ...actions) {
        actions = [...middleware, ...this._resolveController(actions)]
        this.router.delete(path, ...actions)
    }

    export() {
        return this.router
    }

    _resolveController(actions) {
        const lastIndex = actions.length - 1
        const action = actions[lastIndex]
        const [controllerName, methodName] = action.split("@")
        const controller = new Controllers[controllerName]

        actions[lastIndex] = typeof action === "string" ? controller[methodName].bind(controller) : action

        return actions
    }
}

module.exports = new Router();
