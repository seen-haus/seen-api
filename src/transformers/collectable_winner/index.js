const BaseTransformer = require("./../BaseTransformer");

class CollectableWinnerTransformer extends BaseTransformer {
    transform(collectableWinner) {
        return {
            id: collectableWinner.id,
            wallet_address: collectableWinner.wallet_address,
            collectable_id: collectableWinner.collectable_id,
            first_name: collectableWinner.first_name,
            last_name: collectableWinner.last_name,
            email: collectableWinner.email,
            address: collectableWinner.address,
            city: collectableWinner.city,
            zip: collectableWinner.zip,
            province: collectableWinner.province,
            country: collectableWinner.country,
            phone: collectableWinner.phone,
            telegram_username: collectableWinner.telegram_username,
            created_at: collectableWinner.created_at,
            updated_at: collectableWinner.updated_at,
            message: collectableWinner.message,
            cat_contract_ref: collectableWinner.cat_contract_ref,
        }
    }
}

module.exports = new CollectableWinnerTransformer();
