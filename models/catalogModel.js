const mongoose = require('mongoose');
const isValidQuantityTiers = require('./../utils/isValidQuantityTiers');

const quantityTierSchema = new mongoose.Schema(
  {
    minPhotos: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: 'Quantity tier minimums must be whole numbers'
      }
    },
    maxPhotos: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: value =>
          value === null ||
          (Number.isSafeInteger(value) && value >= 0),
        message: 'Quantity tier maximums must be whole numbers or null'
      }
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: 'Prices must be non-negative whole numbers'
      }
    }
  },
  { _id: false }
);

const formatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 40,
      match: /^[^\u0000-\u001f\u007f]+$/
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true
    },
    quantityTiers: {
      type: [quantityTierSchema],
      required: true,
      validate: {
        validator: isValidQuantityTiers,
        message:
          'Each format must have contiguous quantity tiers starting at zero and ending with an open-ended tier'
      }
    }
  },
  { _id: false }
);

const catalogSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'default'
  },
  formats: {
    type: [formatSchema],
    required: true,
    validate: {
      validator: formats =>
        formats.length > 0 &&
        new Set(
          formats.map(format => format.name.trim().toLocaleLowerCase())
        ).size === formats.length,
      message: 'The catalog must contain formats with unique names'
    }
  }
});

module.exports = mongoose.model('Catalog', catalogSchema);
