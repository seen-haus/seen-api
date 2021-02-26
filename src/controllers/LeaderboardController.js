const Controller = require('./Controller');
const {dbConfig} = require("./../config");
const {AUCTION} = require("./../constants/PurchaseTypes")
const mysql = require('mysql');

class LeaderboardController extends Controller {
    async index(req, res) {
        const query = `
            SELECT
                s.won,
                COUNT(DISTINCT events.id) as bids_count,
                SUM(events.value) as total_amount,
                s.wallet_address,
                s.username,
                s.amount_spent
            FROM (
                SELECT
                COUNT(DISTINCT collectables.id) as won,
                collectables.winner_address as wallet_address,
                users.username as username,
                SUM(collectables.min_bid) as amount_spent
                FROM collectables
                LEFT JOIN users on users.wallet = collectables.winner_address
                WHERE collectables.winner_address IS NOT NULL AND collectables.purchase_type = ${AUCTION}
                GROUP BY collectables.winner_address
            ) s
            LEFT JOIN events on events.wallet_address = s.wallet_address
            GROUP BY s.wallet_address
            ORDER BY s.amount_spent DESC
        `;
        const connection = mysql.createConnection({
            connectionLimit: 20,
            host: dbConfig.connection.host,
            user: dbConfig.connection.user,
            password: dbConfig.connection.password,
            database: dbConfig.connection.database,
        });

        connection.connect();
        await connection.query(query, (error, results, fields) => {
            if (error) {
                this.sendResponse(res, {status: "error"});
                return;
            }
            this.sendResponse(res, results);
        });
        connection.end()

    }
}

module.exports = LeaderboardController;
