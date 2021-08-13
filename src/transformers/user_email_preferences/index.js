const BaseTransformer = require("./../BaseTransformer");

class UserEmailPreferencesTransformer extends BaseTransformer {
    transform(userEmailPreferences) {
        return {
            id: userEmailPreferences?.id,
            user_id: userEmailPreferences?.user_id,
            global_disable: userEmailPreferences?.global_disable,
            claim_page_go_live: userEmailPreferences?.claim_page_go_live,
            outbid: userEmailPreferences?.outbid,
        }
    }
}

module.exports = new UserEmailPreferencesTransformer();
