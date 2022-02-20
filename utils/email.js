const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(destination) {
    this.to = destination;
    this.from = `Foto Art <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {

    //FIXME: Sendgrid ne radi
    // if (process.env.NODE_ENV === 'production') {
    //   // Sendgrid
    //   return nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //       user: process.env.SENDGRID_USERNAME,
    //       pass: process.env.SENDGRID_PASSWORD
    //     }
    //   });
    // }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject, data) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      data
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
};
