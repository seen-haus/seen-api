const BaseTransformer = require("./../BaseTransformer");

class MediaOutputTransformer extends BaseTransformer {
    transform(media) {
        return {
            id: media.id,
            url: media.url,
            path: media.path,
            position: media.position,
            type: media.type,
            collectable_id: media.collectable_id,
            is_preview: media.is_preview,
        }
    }
}

module.exports = new MediaOutputTransformer();
