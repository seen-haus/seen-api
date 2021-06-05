const BaseTransformer = require("./../BaseTransformer");

class ArtistOutputTransformer extends BaseTransformer {
    transform(artist) {
        return {
            id: artist.id,
            name: artist.name,
            slug: artist.slug,
            is_hidden_from_artist_list: !!artist.is_hidden_from_artist_list,
            avatar: artist.avatar,
            header_image: artist.header_image,
            video: artist.video,
            quote: artist.quote,
            bio: artist.bio,
            review: artist.review,
            collectablesCount: artist.collectables && artist.collectables.filter(item => !item.is_hidden_from_drop_list).length,
            socials: typeof artist.socials !== 'string' ? artist.socials : JSON.parse(artist.socials),
        }
    }
}

module.exports = new ArtistOutputTransformer();
