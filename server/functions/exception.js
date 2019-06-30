
var _ = require('lodash');
const fs = require('fs');

var customException = {
  customException: function (req, res, err, statusCode) {

    if (req.files){
      Object.keys(req.files).forEach(function (file) {
        if(req.files[file].path){
          fs.unlink(req.files[file].path);  
        }
      })
    }

    if (!_.has(err, 'message')) {
      var errJSON = {
        status: false,
        data: [],
        error: 'Something went wrong. Please try again'
      };
    } else {
      let stopMessage = ['sequelize','timeout','failed to connect', 'user_level_idx','Cannot insert duplicate key row']
      for(let i = 0; i < stopMessage.length; i++){
        if(err.message.toLowerCase().indexOf(stopMessage[i])>=0 ){
          err.message = 'Something went wrong. Please try again';
          req.displayError = err.message;
          break;
        }  
      }
      var errJSON = {
        status: false,
        data: [],
        error: err.message
      };
    }

    if(req.displayError){
      errJSON.error = req.displayError
    }
    // request logging calculations
    req.log.reqEnd = Date.now();
    req.log.responseTime = req.log.reqEnd - req.log.reqStart; 
    if (!_.isObject(err)) {
      errJSON.error = err;
    } else {
      err.id = req.log.id
    }

    statusCode = (_.isUndefined(statusCode) || !_.isNumber(statusCode)) ? 400 : statusCode;
    res.status(statusCode).send(errJSON)
    res.end()
  },
};

module.exports = customException;
