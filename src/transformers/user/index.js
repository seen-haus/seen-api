const BaseTransformer = require("./../BaseTransformer");

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class UserTransformer extends BaseTransformer {
    transform(user) {
        return {
            id: user.id,
            uuid: user.uuid ? user.uuid : randomIntFromInterval(1, 100000000),
            description: user.description,
            image: user.image,
            email: user.email,
            username: user.username,
            socials: user.socials ? JSON.stringify(user.socials) : null,
            wallet: user.wallet,
        }
    }
}

module.exports = new UserTransformer();
