const Order = require('./../models/orderModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const archiver = require('archiver');
const path = require('path');
const r2 = require('./../utils/r2');
const uploadController = require('./uploadController');
const Email = require('./../utils/email');

const getOrderWithSignedPhotoUrls = async order => {
  const orderData = order.toObject();
  orderData.photos = await Promise.all(
    (orderData.photos || []).map(async (photo, index) => ({
      ...photo,
      url:
        index < 4 && photo.r2Key && !order.obrisano
          ? await r2.createReadUrl(photo.r2Key)
          : null
    }))
  );

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
  const ordersWithSignedPhotoUrls = await Promise.all(
    orders.map(getOrderWithSignedPhotoUrls)
  );

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
      order: await getOrderWithSignedPhotoUrls(order)
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
  let photos;
  if (Array.isArray(req.body.photos)) {
    photos = req.body.photos;
  } else {
    try {
      photos = JSON.parse(req.body.photos);
    } catch (error) {
      return next(new AppError('Invalid photo metadata', 400));
    }
  }

  if (
    !uploadController.isValidUploadId(req.body.uploadId) ||
    !Array.isArray(photos) ||
    photos.length === 0 ||
    photos.length > 3000
  ) {
    return next(new AppError('Invalid uploaded photos', 400));
  }

  const uploadPrefix = `orders/${req.body.uploadId}/`;
  const seenKeys = new Set();
  for (const photo of photos) {
    if (
      !photo ||
      !uploadController.isValidObjectKey(photo.r2Key) ||
      !photo.r2Key.startsWith(uploadPrefix) ||
      seenKeys.has(photo.r2Key) ||
      typeof photo.fileName !== 'string' ||
      photo.fileName.trim().length === 0 ||
      photo.fileName.length > 255 ||
      !uploadController.isAllowedImageType(photo.contentType) ||
      !Number.isInteger(photo.size) ||
      photo.size < 1 ||
      photo.size > uploadController.MAX_FILE_SIZE ||
      !Number.isInteger(photo.brojKomada) ||
      photo.brojKomada < 1 ||
      photo.brojKomada > 10000
    ) {
      return next(new AppError('Invalid uploaded photo metadata', 400));
    }
    seenKeys.add(photo.r2Key);
  }

  for (let index = 0; index < photos.length; index += 10) {
    const photoBatch = photos.slice(index, index + 10);
    let uploadedObjects;
    try {
      uploadedObjects = await Promise.all(
        photoBatch.map(photo => r2.headObject(photo.r2Key))
      );
    } catch (error) {
      if (error.$metadata && error.$metadata.httpStatusCode === 404) {
        return next(new AppError('One or more uploaded photos are missing', 400));
      }
      throw error;
    }
    const hasInvalidObject = uploadedObjects.some(
      (object, objectIndex) =>
        object.ContentLength !== photoBatch[objectIndex].size ||
        object.ContentType !== photoBatch[objectIndex].contentType
    );
    if (hasInvalidObject) {
      return next(new AppError('Uploaded photo verification failed', 400));
    }
  }

  const newOrder = await Order.create({
    ime: req.body.ime,
    prezime: req.body.prezime,
    email: req.body.email,
    telefon: req.body.telefon,
    adresa: req.body.adresa,
    format: req.body.format,
    preuzimanje: req.body.preuzimanje,
    photos: photos.map(photo => ({
      public_id: photo.r2Key,
      r2Key: photo.r2Key,
      fileName: photo.fileName,
      contentType: photo.contentType,
      size: photo.size,
      brojKomada: photo.brojKomada
    }))
  });

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

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  await r2.deleteObjects(
    order.photos.map(photo => photo.r2Key).filter(Boolean)
  );
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

const getArchiveFileName = (fileName, usedNames) => {
  let safeName = path.basename(fileName.replace(/\\/g, '/')).replace(
    /[\u0000-\u001f\u007f]/g,
    '_'
  );
  if (!safeName || safeName === '.' || safeName === '..') safeName = 'photo';

  let candidate = safeName;
  let suffix = 1;
  while (usedNames.has(candidate.toLowerCase())) {
    const extension = path.extname(safeName);
    const baseName = safeName.slice(0, safeName.length - extension.length);
    candidate = `${baseName} (${suffix++})${extension}`;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
};

const getSafeFilenamePart = value =>
  String(value || '')
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '_')
    .replace(/[. ]+$/g, '')
    .trim() || 'order';

const getOrderArchiveFileName = order => {
  const createdAt = new Date(order.createdAt);
  const date = Number.isNaN(createdAt.getTime())
    ? 'unknown-date'
    : createdAt.toISOString().slice(0, 10);
  const parts = [date, order.ime, order.prezime, order.format].map(
    getSafeFilenamePart
  );
  return `${parts.join('_')}.zip`;
};

exports.download = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  if (order.obrisano) {
    return next(new AppError('Order photos have been deleted', 410));
  }

  if (!order.photos || order.photos.length === 0) {
    return next(new AppError('No photos are available for this order', 404));
  }

  if (order.photos.some(photo => !photo.r2Key)) {
    return next(
      new AppError('This order uses legacy photo storage and cannot be downloaded', 410)
    );
  }

  for (let index = 0; index < order.photos.length; index += 10) {
    try {
      await Promise.all(
        order.photos
          .slice(index, index + 10)
          .map(photo => r2.headObject(photo.r2Key))
      );
    } catch (error) {
      if (error.$metadata && error.$metadata.httpStatusCode === 404) {
        return next(new AppError('One or more order photos are unavailable', 410));
      }
      throw error;
    }
  }

  const archive = archiver('zip', { zlib: { level: 0 } });
  const handleArchiveError = error => {
    if (res.headersSent) {
      res.destroy(error);
    } else {
      next(error);
    }
  };
  archive.on('warning', handleArchiveError);
  archive.on('error', handleArchiveError);
  res.on('close', () => {
    if (!res.writableEnded) archive.abort();
  });

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${getOrderArchiveFileName(
      order
    )}"`,
    'X-Content-Type-Options': 'nosniff'
  });
  archive.pipe(res);

  try {
    const usedNamesByQuantity = new Map();
    for (const photo of order.photos) {
      const object = await r2.getObject(photo.r2Key);
      const quantityFolder = `x${photo.brojKomada}`;
      if (!usedNamesByQuantity.has(quantityFolder)) {
        usedNamesByQuantity.set(quantityFolder, new Set());
      }
      const fileName = getArchiveFileName(
        photo.fileName || 'photo',
        usedNamesByQuantity.get(quantityFolder)
      );
      archive.append(object.Body, {
        name: `${quantityFolder}/${fileName}`
      });
    }
    await archive.finalize();
  } catch (error) {
    archive.abort();
    if (res.headersSent) {
      res.destroy(error);
    } else {
      next(error);
    }
  }
});
