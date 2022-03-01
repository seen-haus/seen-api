const BaseTransformer = require("../BaseTransformer");

class TagOutputTransformer extends BaseTransformer {
    transform(tag) {
        console.log({tag})
        return {
            id: tag.id,
            name: tag.name,
        }
    }
}

module.exports = new TagOutputTransformer();
