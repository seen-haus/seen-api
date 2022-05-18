const BigNumber = require('bignumber.js');

const { TicketCacheModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class TicketCacheRepository extends BaseRepository {
  constructor(props) {
      super(props)
  }

  getModel() {
      return TicketCacheModel
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
    }).first();

    return this.parserResult(result)
  }

  async updateTicketTokenInfo(tokenAddress, tokenId, consignmentId = null, burntByAddress = null) {
    let currentRecord = await this.findByTokenAddressAndId(tokenAddress, tokenId);

    console.log(`Updating token ${tokenId} ticket information of ticket token contract ${tokenAddress}: consignment_id = ${currentRecord.consignment_id} AND burnt_by_address = ${burntByAddress}`)

    // update ticket token info
    await this.model.query().update({
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

  async findBurntTicketTokensWithConsignmentId(tokenAddress, ticketClaimant, consignmentId) {
    const result = await this.model.query().where(function () {
      if(tokenAddress) {
        this.where('token_address', tokenAddress);
      }
      if(ticketClaimant) {
        this.where('burnt_by_address', ticketClaimant);
      }
      this.where('consignment_id', consignmentId);
    })

    return this.parserResult(result)
  }

}

module.exports = new TicketCacheRepository()
