const BaseTransformer = require("./../BaseTransformer");

class UserEmailPreferencesOutputTransformer extends BaseTransformer {
    transform(userEmailPreferences) {
        if(userEmailPreferences) {
            return {
                id: userEmailPreferences && userEmailPreferences.id,
                user_id: userEmailPreferences && userEmailPreferences.user_id,
                global_disable: userEmailPreferences && userEmailPreferences.global_disable,
                claim_page_go_live: userEmailPreferences && userEmailPreferences.claim_page_go_live,
                outbid: userEmailPreferences && userEmailPreferences.outbid,
            }
        } else {
            return {}
        }
    }
}

module.exports = new UserEmailPreferencesOutputTransformer();
