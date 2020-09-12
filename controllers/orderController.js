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

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orders = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
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
      order
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
      'Foto Art - Vaša porudžbenica je spremna za isporuku',
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

  const newOrder = await Order.create(req.body);

  //send email to user
  const email = new Email(newOrder.email);
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
    order: newOrder
  };
  await email2.send('email', 'Foto Art - Nova porudžbenica', emailData2);

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
        mode: 0755,
        date: new Date()
      },
      { path: `${__dirname}/../public/uploads/${id}`, name: id }
    ],
    filename: `${id}zip-file-name.zip`
  });
};

exports.download = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const folder = `orders/${order.ime}_${order.prezime}_${order.format}_${order.telefon}_${order.preuzimanje}`;
  const downloadLink = cloudinary.utils.download_zip_url({
    //public_ids: order.photos.map(photo => photo.public_id),
    prefixes: folder,
    resource_type: 'image',
    mode: 'download'
  });

  res.status(200).json({
    status: 'success',
    data: {
      downloadLink
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
        console.log(result);
      }
    );
  });

  res.status(201).json({
    status: 'success',
    data: newOrder
  });
});
