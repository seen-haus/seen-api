const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mergePrimaryCollectableIntoSecondary = (primary, secondary) => {
  if(secondary.collectable) {
      delete secondary.collectable;
  }
  return Object.assign({ ...primary }, secondary);
}

module.exports = {
  sleep,
  mergePrimaryCollectableIntoSecondary,
}