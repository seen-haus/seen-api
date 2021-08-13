const BaseTransformer = require("./../BaseTransformer");

class UserEmailPreferencesTransformer extends BaseTransformer {
    transform(userEmailPreferences) {
        return {
            id: userEmailPreferences && userEmailPreferences.id ? userEmailPreferences.id : false,
            user_id: userEmailPreferences && userEmailPreferences.user_id ? userEmailPreferences.user_id : false,
            global_disable: userEmailPreferences && userEmailPreferences.global_disable ? userEmailPreferences.global_disable : false,
            claim_page_go_live: userEmailPreferences && userEmailPreferences.claim_page_go_live ? userEmailPreferences.claim_page_go_live : false,
            outbid: userEmailPreferences && userEmailPreferences.outbid ? userEmailPreferences.outbid : false,
        }
    }
}

module.exports = new UserEmailPreferencesTransformer();
