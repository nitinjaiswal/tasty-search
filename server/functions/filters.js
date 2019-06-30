
var _ = require('lodash'),
  config = require('config');

var exceptions = require('./exception');
var tokenMissingMessage = 'unauthorised request';


module.exports = {
  unAuthFilter: function (req, res, next) {
    if (_.has(req.headers, 'token')) {
      // if (req.headers.token != '1234'){
      //   req.error = new Error(tokenMissingMessage);
      //   exceptions.customException(req, res, tokenMissingMessage, 403);
      // }
        next()
    } else {
      // req.error =  new Error(tokenMissingMessage);
      // exceptions.customException(req, res, tokenMissingMessage, 403);
      next()
    }
  },
}