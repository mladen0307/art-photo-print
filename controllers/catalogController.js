const Catalog = require('./../models/catalogModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const isValidQuantityTiers = require('./../utils/isValidQuantityTiers');

const getCatalog = async () => {
  const catalog = await Catalog.findOne({ key: 'default' });
  if (!catalog) {
    throw new AppError('Catalog settings are unavailable', 503);
  }
  return catalog;
};

exports.getCatalog = catchAsync(async (req, res) => {
  const catalog = await getCatalog();

  res.status(200).json({
    status: 'success',
    data: {
      catalog: {
        formats: catalog.formats
      }
    }
  });
});

exports.updateCatalog = catchAsync(async (req, res, next) => {
  if (
    !req.body ||
    Object.keys(req.body).length !== 1 ||
    !Array.isArray(req.body.formats)
  ) {
    return next(new AppError('Provide the complete catalog formats list', 400));
  }

  const formats = req.body.formats;
  const submittedNames = new Set();
  const hasInvalidFormat = formats.some(format => {
    const normalizedName =
      format && typeof format.name === 'string'
        ? format.name.trim().toLocaleLowerCase()
        : '';
    if (
      !format ||
      typeof format !== 'object' ||
      Array.isArray(format) ||
      Object.keys(format).sort().join(',') !==
        'enabled,name,quantityTiers' ||
      typeof format.name !== 'string' ||
      format.name !== format.name.trim() ||
      format.name.length === 0 ||
      format.name.length > 40 ||
      /[\u0000-\u001f\u007f]/.test(format.name) ||
      submittedNames.has(normalizedName) ||
      typeof format.enabled !== 'boolean' ||
      !Array.isArray(format.quantityTiers) ||
      format.quantityTiers.some(
        tier =>
          !tier ||
          typeof tier !== 'object' ||
          Array.isArray(tier) ||
          Object.keys(tier).sort().join(',') !==
            'maxPhotos,minPhotos,price'
      ) ||
      !isValidQuantityTiers(format.quantityTiers)
    ) {
      return true;
    }

    submittedNames.add(normalizedName);
    return false;
  });

  if (
    hasInvalidFormat ||
    formats.length === 0 ||
    submittedNames.size !== formats.length ||
    !formats.some(format => format.enabled)
  ) {
    return next(
      new AppError(
        'Catalog must include every known format once, with valid quantity tiers and at least one enabled format',
        400
      )
    );
  }

  const catalog = await getCatalog();
  catalog.formats = formats;
  await catalog.save();

  res.status(200).json({
    status: 'success',
    data: {
      catalog: {
        formats: catalog.formats
      }
    }
  });
});
