const BaseTransformer = require("./../BaseTransformer");

class FeaturedDropTransformer extends BaseTransformer {
    transform(featuredDrop) {
        return {
            id: featuredDrop.id,
            collectable_id: featuredDrop.collectable_id,
            created_at: featuredDrop.created_at,
            updated_at: featuredDrop.updated_at
        }
    }
}

module.exports = new FeaturedDropTransformer();
