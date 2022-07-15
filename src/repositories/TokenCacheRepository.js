const BigNumber = require('bignumber.js');
const ethers = require('ethers');

BigNumber.config({ EXPONENTIAL_AT: 1e+9 })

const { 
  TokenCacheModel 
} = require("./../models");
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

    async findByTokenAddressAndHolder(tokenAddress, tokenHolder) {
      const result = await this.model.query().where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_holder', tokenHolder);
      })

      return this.parserResult(result)
    }

    async increaseNonFungibleTokenHolderBalance(tokenHolder, tokenAddress, tokenId, amount, consignmentId = null) {
      let holderRecordExists = await this.findByTokenAddressAndIdAndHolder(tokenAddress, tokenId, tokenHolder);

      if(holderRecordExists && holderRecordExists.length > 0) {
        // update existing record

        const newBalance = new BigNumber(holderRecordExists[0].token_balance).plus(new BigNumber(amount));

        console.log(`Increasing balance of holder ${tokenHolder} for token ${tokenId} of token contract ${tokenAddress} from ${holderRecordExists[0].token_balance} to ${newBalance}`)

        // update balance
        await this.model.query().update({'token_balance': newBalance.toString()}).where(function () {
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
    }

    async decreaseNonFungibleTokenHolderBalance(tokenHolder, tokenAddress, tokenId, amount) {
      let currentRecord = await this.findByTokenAddressAndIdAndHolder(tokenAddress, tokenId, tokenHolder);

      const newBalance = new BigNumber(currentRecord[0].token_balance).minus(new BigNumber(amount));

      console.log(`Decreasing balance of holder ${tokenHolder} for token ${tokenId} of token contract ${tokenAddress} from ${currentRecord[0].token_balance} to ${newBalance}`)

      // update balance
      if(newBalance.toNumber() === 0) {
        await this.model.query().delete().where(function () {
          this.where('token_address', tokenAddress);
          this.where('token_id', tokenId);
          this.where('token_holder', tokenHolder);
        })
      } else {
        await this.model.query().update({'token_balance': newBalance.toString()}).where(function () {
          this.where('token_address', tokenAddress);
          this.where('token_id', tokenId);
          this.where('token_holder', tokenHolder);
        })
      }
    }

    async increaseFungibleTokenHolderBalance(tokenHolder, tokenAddress, amount) {
      let holderRecordExists = await this.findByTokenAddressAndHolder(tokenAddress, tokenHolder);

      if(holderRecordExists && holderRecordExists.length > 0) {
        // update existing record

        const newBalance = new BigNumber(ethers.utils.parseEther(holderRecordExists[0].token_balance).toString()).plus(new BigNumber(amount));

        const useBalance = ethers.utils.formatEther(newBalance.toString());

        console.log(`Increasing balance of holder ${tokenHolder} of token contract ${tokenAddress} from ${holderRecordExists[0].token_balance} to ${useBalance} (${newBalance})`)

        // update balance
        await this.model.query().update({'token_balance': useBalance}).where(function () {
          this.where('token_address', tokenAddress);
          this.where('token_holder', tokenHolder);
        })

      } else {
        // create new record
        const useBalance = ethers.utils.formatEther(amount);
        console.log(`Setting balance of holder ${tokenHolder} of token contract ${tokenAddress} to ${useBalance} (${amount})`)
        await this.create({
          token_address: tokenAddress,
          token_holder: tokenHolder,
          token_balance: useBalance
        });
      }
    }

    async decreaseFungibleTokenHolderBalance(tokenHolder, tokenAddress, amount) {
      let currentRecord = await this.findByTokenAddressAndHolder(tokenAddress, tokenHolder);

      const newBalance = new BigNumber(ethers.utils.parseEther(currentRecord[0].token_balance).toString()).minus(new BigNumber(amount));

      const useBalance = ethers.utils.formatEther(newBalance.toString());

      console.log(`Decreasing balance of holder ${tokenHolder} of token contract ${tokenAddress} from ${currentRecord[0].token_balance} to ${useBalance} (${newBalance})`)

      // update balance
      if(new BigNumber(useBalance).toNumber() === 0) {
        await this.model.query().delete().where(function () {
          this.where('token_address', tokenAddress);
          this.where('token_holder', tokenHolder);
        })
      } else {
        await this.model.query().update({'token_balance': useBalance.toString()}).where(function () {
          this.where('token_address', tokenAddress);
          this.where('token_holder', tokenHolder);
        })
      }
    }

    async updateTicketTokenInfo(tokenAddress, tokenId, consignmentId = null) {
      let currentRecord = await this.findByTokenAddressAndId(tokenAddress, tokenId);

      console.log(`Updating token ${tokenId} ticket information of ticket token contract ${tokenAddress}: consignment_id = ${consignmentId}`)

      // update ticket token info
      await this.model.query().update({
        ...(consignmentId !== null && {
          consignment_id: consignmentId
        }),
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
      const result = await this.model.query().withGraphFetched("ticketData").where(function () {
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
