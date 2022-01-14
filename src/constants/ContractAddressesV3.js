const ChainTypes = require('./ChainTypes');

const networkNameToAccessController = {
  [ChainTypes.ETHEREUM_MAINNET]: "",
  [ChainTypes.ETHEREUM_RINKEBY]: "0x412dA1252525120CF19B856501e9CDB28584BF9d"
}

const networkNameToMarketDiamond = {
  [ChainTypes.ETHEREUM_MAINNET]: "",
  [ChainTypes.ETHEREUM_RINKEBY]: "0x32207f46334e41A7745416D4287984b6f9Fe24b2"
}

const networkNameToSeenNFT = {
  [ChainTypes.ETHEREUM_MAINNET]: "",
  [ChainTypes.ETHEREUM_RINKEBY]: "0x1Ae79bc51137D54689d8eA640ED2f5F0A334aC79"
}

module.exports = {
  networkNameToAccessController,
  networkNameToMarketDiamond,
  networkNameToSeenNFT,
}