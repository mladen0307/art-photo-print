const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = new mongoose.Schema(
  {
    ime: {
      type: String,
      required: [true, 'Polje ime mora biti popunjeno'],
      trim: true,
      maxlength: [40, 'Najveca duzina polja ime je 40 karaktera'],
      minlength: [1, 'Polje ime sadzi manje od 1 karaktera']
    },
    email: {
      type: String,
      required: [true, 'Polje email mora biti popunjeno'],
      validate: [validator.isEmail, 'Polje email mora biti ispravno popunjeno']
    },
    prezime: {
      type: String,
      required: [true, 'Polje prezime mora biti popunjeno'],
      trim: true,
      maxlength: [40, 'Najveca duzina polja prezime je 40 karaktera'],
      minlength: [1, 'Polje prezime sadzi manje od 1 karaktera']
    },
    telefon: {
      type: String,
      required: [true, 'Polje telefon mora biti popunjeno'],
      maxlength: [40, 'Najveca duzina polja telefon je 20 karaktera'],
      minlength: [1, 'Polje telefon sadzi manje od 1 karaktera']
    },
    adresa: {
      type: String,
      required: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    photos: [
      new mongoose.Schema({
        public_id: { type: String, unique: true },
        r2Key: String,
        fileName: String,
        contentType: String,
        size: Number,
        brojKomada: Number
      })
    ],
    format: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    cenaPoFotografiji: {
      type: Number,
      min: 0,
      validate: Number.isSafeInteger
    },
    racunSnapshot: {
      type: Number,
      min: 0,
      validate: Number.isSafeInteger
    },
    preuzimanje: {
      type: String,
      enum: ['kurirska sluzba', 'radnja centar', 'radnja trosarina']
    },
    poslatEmail: {
      type: Boolean,
      default: false
    },
    izdato: {
      type: Boolean,
      default: false
    },
    obrisano: {
      type: Boolean,
      default: false
    },
    brojKesice: {
      type: String,
      maxlength: [4],
      minlength: [4]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.virtual('racun').get(function() {
  return this.racunSnapshot;
});

orderSchema.virtual('ukupnoFotografija').get(function() {
  let count = 0;

  this.photos.forEach(photo => {
    count += photo.brojKomada;
  });

  return count;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
