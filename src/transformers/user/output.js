const BaseTransformer = require("./../BaseTransformer");

class UserOutputTransformer extends BaseTransformer {
    transform(user) {
        return {
            id: user.id,
            uuid: user.uuid,
            description: user.description,
            image: user.image,
            username: user.username,
            socials: typeof user.socials == 'string' ? JSON.parse(user.socials) : user.socials,
            wallet: user.wallet,
        }
    }
}

module.exports = new UserOutputTransformer();
