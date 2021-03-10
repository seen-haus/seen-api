const BaseTransformer = require("./../BaseTransformer");

class MediaTransformer extends BaseTransformer {
    transform(media) {
        return {
            url: media.url,
            path: media.path,
            type: media.type,
            position: media.position,
        }
    }
}

module.exports = new MediaTransformer();
