const BaseTransformer = require("./../BaseTransformer");

class ArtistOutputTransformer extends BaseTransformer {
    transform(artist) {
        return {
            id: artist.id,
            name: artist.name,
            avatar: artist.avatar,
            video: artist.video,
            quote: artist.quote,
            bio: artist.bio,
            review: artist.review,
            collectablesCount: artist.collectables && artist.collectables.length,
            socials: typeof artist.socials !== 'string' ? artist.socials : JSON.parse(artist.socials),
        }
    }
}

module.exports = new ArtistOutputTransformer();
