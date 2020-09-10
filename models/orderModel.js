const mongoose = require('mongoose');
const validator = require('validator');
const cene = require('./../utils/cene');

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
      default: Date.now()
    },
    photos: [
      {
        secure_url: String,
        public_id: { type: String, unique: true },
        brojKomada: Number
      }
    ],
    downloadLink: String,
    format: {
      type: String,
      enum: [
        '9x13',
        '10x13,5',
        '10x15',
        '11x15',
        '13x18',
        '15x20',
        '20x30',
        '24x30',
        '30x40',
        '30x45'
      ]
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
  let count = 0;
  this.photos.forEach(photo => {
    count += photo.brojKomada;
  });
  let category = 0;
  if (count >= 100) category = 1;
  if (count >= 200) category = 2;
  if (count >= 400) category = 3;

  return count * cene[this.format][category];
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
