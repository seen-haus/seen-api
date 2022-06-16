const {FeaturedDropModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class FeaturedDropRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return FeaturedDropModel
    }

    async findHeroCollectable() {
        const result = await this.model.query()
            .withGraphFetched('[collectable, collectable.[artist.[collectables], user.[collectables], tags, media, additionalMedia, events, claim, secondaryMarketListings.[user, events], custom_payment_token]]')
            .first();

        console.log({result})
        if (!result) {
            return null;
        }
        return this.parserResult(result.collectable)
    }
}

module.exports = new FeaturedDropRepository()
