const BigNumber = require('bignumber.js');

const { TokenCacheModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class TokenCacheRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return TokenCacheModel
    }

    async index() {
      const result = await this.model.query().where(function () {
        this.where('token_address');
      })

      return this.parserResult(result)
    }

    async findByTokenAddressAndId(tokenAddress, tokenId) {
      const result = await this.model.query().where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
      })

      return this.parserResult(result)
    }

    async findByTokenAddressAndIdAndHolder(tokenAddress, tokenId, tokenHolder) {
      const result = await this.model.query().where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
        this.where('token_holder', tokenHolder);
      })

      return this.parserResult(result)
    }

    async increaseTokenHolderBalance(tokenHolder, tokenAddress, tokenId, amount, consignmentId = null) {
      let holderRecordExists = await this.findByTokenAddressAndIdAndHolder(tokenAddress, tokenId, tokenHolder);

      let result;
      if(holderRecordExists && holderRecordExists.length > 0) {
        // update existing record

        const newBalance = new BigNumber(holderRecordExists[0].token_balance).plus(new BigNumber(amount));

        console.log(`Increasing balance of holder ${tokenHolder} for token ${tokenId} of token contract ${tokenAddress} from ${holderRecordExists[0].token_balance} to ${newBalance}`)

        // update balance
        result = await this.model.query().update({'token_balance': newBalance.toString()}).where(function () {
          this.where('token_address', tokenAddress);
          this.where('token_id', tokenId);
          this.where('token_holder', tokenHolder);
        })

      } else {
        // create new record
        console.log(`Setting balance of holder ${tokenHolder} for token ${tokenId} of token contract ${tokenAddress} to ${amount}`)
        await this.create({
          token_address: tokenAddress,
          token_id: tokenId,
          token_holder: tokenHolder,
          token_balance: amount.toString(),
          ...(consignmentId !== null && {
            consignment_id: consignmentId
          })
        });
      }

      return this.parserResult(result)
    }

    async decreaseTokenHolderBalance(tokenHolder, tokenAddress, tokenId, amount) {
      let currentRecord = await this.findByTokenAddressAndIdAndHolder(tokenAddress, tokenId, tokenHolder);

      const newBalance = new BigNumber(currentRecord[0].token_balance).minus(new BigNumber(amount));

      console.log(`Decreasing balance of holder ${tokenHolder} for token ${tokenId} of token contract ${tokenAddress} from ${currentRecord[0].token_balance} to ${newBalance}`)

      // update balance
      let result = await this.model.query().update({'token_balance': newBalance.toString()}).where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
        this.where('token_holder', tokenHolder);
      })

      return this.parserResult(result)
    }

  async updateTicketTokenInfo(tokenAddress, tokenId, consignmentId = null, burntByAddress = null) {
      let currentRecord = await this.findByTokenAddressAndId(tokenAddress, tokenId);

      console.log(`Updating token ${tokenId} ticket information of ticket token contract ${tokenAddress}: consignment_id = ${currentRecord[0].token_balance} AND burnt_by_address = ${burntByAddress}`)

      // update ticket token info
      let result = await this.model.query().update({
        ...(consignmentId !== null && {
          consignment_id: consignmentId
        }),
        ...(burntByAddress !== null && {
          burnt_by_address: burntByAddress
        })
      }).where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
      })
    }

    async findOwnedTokens(tokenAddress, tokenHolder) {
      const result = await this.model.query().where(function () {
        if(tokenAddress) {
          this.where('token_address', tokenAddress);
        }
        if(tokenHolder) {
          this.where('token_holder', tokenHolder);
        }
      })

      return this.parserResult(result)
    }

    async findOwnedTokensWithConsignmentId(tokenAddress, tokenHolder, consignmentId) {
      const result = await this.model.query().where(function () {
        if(tokenAddress) {
          this.where('token_address', tokenAddress);
        }
        if(tokenHolder) {
          this.where('token_holder', tokenHolder);
        }
        this.where('consignment_id', consignmentId);
      })

      return this.parserResult(result)
    }

    async clearTokenCacheByTokenAddress(tokenAddress) {
      const rowsDeleted = await this.model.query().delete().where(function () {
        this.where('token_address', tokenAddress);
      })
      return rowsDeleted;
    }

    async patchHolderByTokenAddressAndIdERC721(holder, tokenAddress, tokenId) {
      await this.model.query().patch({token_holder: holder}).where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
      })
    }
}

module.exports = new TokenCacheRepository()
