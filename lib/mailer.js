const cfg = require('../config/email.json');
const logger = require('./logger').email;
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(cfg.server.smtp);

var to = cfg.receiverList.join(',');

function sendMail(options, callback) {
  if (!options.to) {
    return;
  }

  options.from = cfg.server.sender;

  transporter.sendMail(options, function(error, info) {
    if (error) {
      logger.info(error);
    }
    callback && callback();
    logger.info('Message %s sent: %s', info.messageId, info.response);
  });
}

function sendMailToReceiverList(options, callback) {
  options.to = to;
  sendMail(options, callback);
}


module.exports = {
  sendMail: sendMail,
  sendMailToReceiverList: sendMailToReceiverList
};