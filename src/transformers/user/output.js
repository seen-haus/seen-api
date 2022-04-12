const BaseTransformer = require("./../BaseTransformer");

class UserOutputTransformer extends BaseTransformer {
    transform(user) {
        return {
            id: user.id,
            uuid: user.uuid,
            email: user.email ? true : false,
            description: user.description,
            avatar_image: user.avatar_image,
            banner_image: user.banner_image,
            username: user.username,
            socials: typeof user.socials == 'string' ? JSON.parse(user.socials) : user.socials,
            wallet: user.wallet,
            collectables: user.collectables,
        }
    }
}

module.exports = new UserOutputTransformer();
