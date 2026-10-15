const cloudinary = require('cloudinary').v2;
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.createUploadSignature = catchAsync(async (req, res, next) => {
  const { folder, tags } = req.body || {};
  const folderPattern = /^orders\/\d{2}\.\d{2}\.(?:\d{2}|\d{4})\/\d{13}$/;

  if (
    typeof folder !== 'string' ||
    typeof tags !== 'string' ||
    !folderPattern.test(folder) ||
    !tags.startsWith(`${folder}_`) ||
    !/^[1-9]\d*$/.test(tags.slice(folder.length + 1))
  ) {
    return next(new AppError('Invalid upload parameters', 400));
  }

  const cloud_name = process.env.CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    return next(new AppError('Cloudinary uploads are not configured', 500));
  }

  const timestamp = cloudinary.utils.timestamp();
  const type = 'authenticated';
  const headers = 'X-Robots-Tag: noindex';
  const paramsToSign = { folder, tags, timestamp, type, headers };

  res.status(200).json({
    status: 'success',
    data: {
      cloud_name,
      api_key,
      folder,
      tags,
      timestamp,
      type,
      headers,
      signature: cloudinary.utils.api_sign_request(paramsToSign, api_secret)
    }
  });
});
