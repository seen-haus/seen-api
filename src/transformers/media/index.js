const BaseTransformer = require("./../BaseTransformer");

class MediaTransformer extends BaseTransformer {
    transform(media) {
        return {
            id: media.id,
            url: media.url,
            origin_url: media.origin_url,
            path: media.path,
            type: media.type,
            position: media.position,
            collectable_id: media.collectable_id,
            is_preview: media.is_preview,
        }
    }
}

module.exports = new MediaTransformer();
