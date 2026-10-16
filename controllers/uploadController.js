const crypto = require('crypto');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const r2 = require('./../utils/r2');

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const uploadIdPattern = /^[a-f0-9]{32}$/;
const objectKeyPattern = /^orders\/[a-f0-9]{32}\/[a-f0-9]{32}$/;

const isAllowedImageType = contentType =>
  /^image\/[a-z0-9.+-]+$/i.test(contentType) &&
  contentType.toLowerCase() !== 'image/svg+xml';

exports.createUploadSession = catchAsync(async (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {
      uploadId: crypto.randomBytes(16).toString('hex')
    }
  });
});

exports.createUploadSignature = catchAsync(async (req, res, next) => {
  const { uploadId, fileName, contentType, size } = req.body || {};

  if (
    typeof uploadId !== 'string' ||
    !uploadIdPattern.test(uploadId) ||
    typeof fileName !== 'string' ||
    fileName.trim().length === 0 ||
    fileName.length > 255 ||
    typeof contentType !== 'string' ||
    !isAllowedImageType(contentType) ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > MAX_FILE_SIZE
  ) {
    return next(new AppError('Invalid upload parameters', 400));
  }

  const key = `orders/${uploadId}/${crypto.randomBytes(16).toString('hex')}`;
  const url = await r2.createUploadUrl(key, contentType);

  res.status(200).json({
    status: 'success',
    data: {
      key,
      url
    }
  });
});

exports.isValidUploadId = value =>
  typeof value === 'string' && uploadIdPattern.test(value);
exports.isValidObjectKey = value =>
  typeof value === 'string' && objectKeyPattern.test(value);
exports.MAX_FILE_SIZE = MAX_FILE_SIZE;
exports.isAllowedImageType = isAllowedImageType;
