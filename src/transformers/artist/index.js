const BaseTransformer = require("./../BaseTransformer");

class ArtistTransformer extends BaseTransformer {
    transform(artist) {
        return {
            id: artist.id,
            name: artist.name,
            avatar: artist.avatar,
            video: artist.video,
            quote: artist.quote,
            bio: artist.bio,
            review: artist.review,
            socials: typeof artist.socials !== 'string' ? JSON.stringify(artist.socials) : artist.socials,
        }
    }
}

module.exports = new ArtistTransformer();
