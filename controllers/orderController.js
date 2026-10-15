const Order = require('./../models/orderModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const fs = require('fs');
const { ensureDir } = require('fs-extra');
const del = require('del');
const cloudinary = require('cloudinary').v2;
const Email = require('./../utils/email');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getOrderWithSignedPhotoUrls = order => {
  const orderData = order.toObject();
  delete orderData.downloadLinks;
  orderData.photos = (orderData.photos || []).map(photo => {
    const storedUrl = photo.secure_url || photo.url;
    const urlDetails = storedUrl
      ? /\/image\/(upload|authenticated)\/(?:s--[^/]+--\/)?v(\d+)\/.+\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(
          storedUrl
        )
      : null;
    const version = photo.version || (urlDetails && Number(urlDetails[2]));
    const format = photo.format || (urlDetails && urlDetails[3]);

    const isLegacyPublicDelivery =
      urlDetails && urlDetails[1] === 'upload' && !photo.version && !photo.format;
    if (isLegacyPublicDelivery) {
      return photo;
    }

    if (!photo.public_id || !version || !format) {
      throw new AppError('Photo is missing Cloudinary delivery metadata', 500);
    }

    const signedUrl = cloudinary.url(photo.public_id, {
      resource_type: 'image',
      type: 'authenticated',
      version,
      format,
      secure: true,
      sign_url: true
    });

    return {
      ...photo,
      url: signedUrl,
      secure_url: signedUrl
    };
  });

  return orderData;
};

exports.getOrderWithSignedPhotoUrls = getOrderWithSignedPhotoUrls;

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orders = await features.query;
  const ordersWithSignedPhotoUrls = orders.map(getOrderWithSignedPhotoUrls);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: ordersWithSignedPhotoUrls.length,
    data: {
      orders: ordersWithSignedPhotoUrls
    }
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  // Order.findOne({ _id: req.params.id })

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: getOrderWithSignedPhotoUrls(order)
    }
  });
});

exports.sendEmail = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  // Order.findOne({ _id: req.params.id })

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  if (order.preuzimanje === 'kurirska sluzba') {
    const email = new Email(order.email);
    const emailData = {
      title: 'Vaša porudžbenica je poslata na adresu',
      order: order
    };
    await email.send(
      'email',
      'Foto Art - Vaša porudžbenica je poslata na adresu',
      emailData
    );
  } else {
    const email = new Email(order.email);
    const emailData = {
      title: 'Vašе fotografije možete preuzeti na izabranoj lokaciji',
      order: order
    };
    await email.send(
      'email',
      'Foto Art - Vaša porudžbenica je spremna',
      emailData
    );
  }

  await Order.findByIdAndUpdate(req.params.id, { poslatEmail: true });

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.createOrder = catchAsync(async (req, res, next) => { 
  req.body.photos = JSON.parse(req.body.photos);
  let downloadTags;
  try {
    downloadTags = JSON.parse(req.body.tags);
  } catch (error) {
    return next(new AppError('Invalid download tags', 400));
  }

  if (
    typeof req.body.folder !== 'string' ||
    !Array.isArray(downloadTags) ||
    downloadTags.length === 0 ||
    downloadTags.some(
      tag =>
        typeof tag !== 'string' ||
        !tag.startsWith(`${req.body.folder}_`) ||
        !/^[1-9]\d*$/.test(tag.slice(req.body.folder.length + 1))
    )
  ) {
    return next(new AppError('Invalid download tags', 400));
  }

  req.body.downloadTags = [...new Set(downloadTags)];
  delete req.body.tags;
  delete req.body.downloadLinks;

  const newOrder = await Order.create(req.body);

  //send email to user
  const  email = new Email(newOrder.email);
  const emailData = {
    title: 'Vaša porudžbenica je u obradi',
    order: newOrder
  };
  await email.send(
    'email',
    'Foto Art - Vaša porudžbenica je u obradi',
    emailData
  );

  //send email to admin
  const email2 = new Email('mladen.k1234@gmail.com');
  const emailData2 = {
    title: 'Nova porudžbenica',
    order: newOrder,
    adminOrderUrl: `${(process.env.APP_URL || 'https://fotoartnis.com').replace(
      /\/+$/,
      ''
    )}/overview`
  };
  await email2.send('emailAdmin', `Foto Art - Nova porudžbenica ${newOrder.ime} ${newOrder.prezime}`, emailData2);

  const email3 = new Email('foto.art.nis@hotmail.com');
  const emailData3 = {
    title: 'Nova porudžbenica',
    order: newOrder,
    adminOrderUrl: `${(process.env.APP_URL || 'https://fotoartnis.com').replace(
      /\/+$/,
      ''
    )}/overview`
  };
  await email3.send('emailAdmin', `Foto Art - Nova porudžbenica ${newOrder.ime} ${newOrder.prezime}`, emailData3);

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder
    }
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.deleteOrderOld = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  await del(`${__dirname}/../public/uploads/${order.id}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  let promises = [];
  promises = order.photos.map(photo => {
    cloudinary.uploader.destroy(photo.public_id);
  });

  Promise.all(promises).then(async () => {
    const deletedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { obrisano: true },
      {
        new: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: deletedOrder
    });
  });
});

exports.upload = catchAsync(async (req, res, next) => {
  if (req.files === null) {
    return next(new AppError('No files uploaded', 400));
  }
  const files = Object.values(req.files);
  req.body.photos = files.map(file => file.name);
  let newOrder = null;
  try {
    newOrder = await Order.create(req.body);
  } catch (err) {
    return next(new AppError('Validation failed', 500));
  }

  ensureDir(
    `${__dirname}/../public/uploads/${newOrder.id}/${newOrder.ime +
      '_' +
      newOrder.prezime}/${newOrder.format}`,
    err => {
      if (err) {
        Order.findByIdAndDelete(newOrder.id);
        throw new AppError('Internal server error', 500);
      }
      files.forEach(file => {
        file.mv(
          `${__dirname}/../public/uploads/${newOrder.id}/${newOrder.ime +
            '_' +
            newOrder.prezime}/${newOrder.format}/${file.name}`,
          err => {
            if (err) {
              Order.findByIdAndDelete(newOrder.id);
              throw new AppError('Internal server error', 500);
            }
          }
        );
      });
    }
  );

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder,
      files: files.map(file => {
        return {
          name: file.name,
          path: `/uploads/${newOrder.id}/${newOrder.ime +
            '_' +
            newOrder.prezime}/${newOrder.format}/${file.name}`
        };
      })
    }
  });
});

exports.downloadOld = function(req, res) {
  const id = req.params.id;
  res.zip({
    files: [
      {
        name: id,
        mode: 0o755,
        date: new Date()
      },
      { path: `${__dirname}/../public/uploads/${id}`, name: id }
    ],
    filename: `${id}zip-file-name.zip`
  });
};

exports.download = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  if (order.obrisano) {
    return next(new AppError('Order photos have been deleted', 410));
  }

  let downloadLinks;
  if (order.downloadTags && order.downloadTags.length > 0) {
    const assetTypes = new Set(
      order.photos.map(photo => {
        if (photo.type === 'authenticated' || photo.type === 'upload') {
          return photo.type;
        }
        const storedUrl = photo.secure_url || photo.url || '';
        return /\/image\/authenticated\//.test(storedUrl)
          ? 'authenticated'
          : 'upload';
      })
    );
    if (assetTypes.size !== 1) {
      return next(
        new AppError('Order photos have inconsistent Cloudinary delivery types', 409)
      );
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
    downloadLinks = order.downloadTags.map(tags =>
      cloudinary.utils.download_zip_url({
        tags,
        resource_type: 'image',
        type: assetTypes.values().next().value,
        expires_at: expiresAt
      })
    );
  } else {
    downloadLinks = order.downloadLinks || [];
  }

  if (downloadLinks.length === 0) {
    return next(new AppError('No download links are available for this order', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      downloadLinks
    }
  });
});

exports.uploadCloudinary = catchAsync(async (req, res, next) => {
  if (req.files === null) {
    return next(new AppError('No files uploaded', 400));
  }
  const files = Object.values(req.files);
  req.body.photos = files.map(file => file.name);
  let newOrder = null;
  try {
    newOrder = await Order.create(req.body);
  } catch (err) {
    return next(new AppError('Validation failed', 500));
  }

  files.forEach(file => {
    cloudinary.uploader.upload(
      file.tempFilePath,
      {
        public_id: `${file.name}`,
        folder: `${newOrder.ime}_${newOrder.prezime}_${newOrder.format}_${newOrder.telefon}_${newOrder.preuzimanje}`
      },
      function(error, result) {
        if (error) {
          Order.findByIdAndDelete(newOrder.id);
          throw new AppError('Internal server error', 500);
        }
        //console.log(result);
      }
    );
  });

  res.status(201).json({
    status: 'success',
    data: newOrder
  });
});
