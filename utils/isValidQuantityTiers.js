module.exports = tiers => {
  if (!Array.isArray(tiers) || tiers.length === 0) return false;

  let expectedMinPhotos = 0;
  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    const isLastTier = index === tiers.length - 1;

    if (
      !tier ||
      !Number.isSafeInteger(tier.minPhotos) ||
      tier.minPhotos !== expectedMinPhotos ||
      !Number.isSafeInteger(tier.price) ||
      tier.price < 0
    ) {
      return false;
    }

    if (tier.maxPhotos === null) {
      if (!isLastTier) return false;
    } else {
      if (
        !Number.isSafeInteger(tier.maxPhotos) ||
        tier.maxPhotos < tier.minPhotos
      ) {
        return false;
      }
      expectedMinPhotos = tier.maxPhotos + 1;
    }
  }

  return tiers[tiers.length - 1].maxPhotos === null;
};
