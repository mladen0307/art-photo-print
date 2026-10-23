export const calculateOrderQuote = (files, selectedFormat) => {
  const photoCount = files.reduce(
    (total, file) => total + file.brojKomada,
    0
  );
  const selectedTier =
    selectedFormat &&
    selectedFormat.quantityTiers.find(
      tier =>
        photoCount >= tier.minPhotos &&
        (tier.maxPhotos === null || photoCount <= tier.maxPhotos)
    );
  const pricePerPhoto = selectedTier ? selectedTier.price : '';
  const total = selectedTier ? selectedTier.price * photoCount : '';

  return {
    photoCount,
    pricePerPhoto,
    total,
    hasValidQuote:
      Number.isSafeInteger(pricePerPhoto) && Number.isSafeInteger(total)
  };
};

export const isOrderDetailsValid = ({
  userInfo,
  files,
  selectedFormat,
  hasValidQuote
}) =>
  userInfo.ime !== '' &&
  userInfo.prezime !== '' &&
  userInfo.telefon !== '' &&
  files.length !== 0 &&
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
    userInfo.email
  ) &&
  Boolean(selectedFormat) &&
  hasValidQuote;
