const BaseTransformer = require("./../BaseTransformer");
const StringHelper = require("../../utils/StringHelper")
class ArtistTransformer extends BaseTransformer {
    transform(artist) {
        return {
            id: artist.id,
            slug: artist.slug
                ? artist.slug
                : StringHelper.slugify(artist.name),
            name: artist.name,
            email: artist.email,
            is_hidden_from_artist_list: !!artist.is_hidden_from_artist_list,
            avatar: artist.avatar,
            header_image: artist.header_image,
            video: artist.video,
            quote: artist.quote,
            bio: artist.bio,
            review: artist.review,
            socials: typeof artist.socials !== 'string' ? JSON.stringify(artist.socials) : artist.socials,
        }
    }
}

module.exports = new ArtistTransformer();
