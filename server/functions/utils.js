const _ = require('lodash')
const Promise = require('bluebird')
const nodeUUIDV4 = require('uuid/v4');
  
const config = require('config')
const exception = require('./exception');

var utils = {
  
  responseGenerator: function (data, error) {
    return new Promise(function (resolve, reject) {
      var response = _.cloneDeep(config.response);
      if (_.isUndefined(data)) {
        response.status = true;
        response.data = [];
        response.error = "";
      }else if(!_.isNull(data)){
        response.status = true;
        response.data = data;
        response.error = error;
      } else {
        response.status = false;
        response.data = "";
        response.error = error;
      }

      resolve(response);
    })
  },
  responseGeneratorV2: function (req, error) {
    return new Promise(function (resolve, reject) {
      var response = _.cloneDeep(config.response);
      if (req.data.length != 0 && !_.isNull(req.data)) {
        response.status = true;
        response.data = req.data;
        response.error = "";

        // logging part for request
        req.log.reqEnd = Date.now();
        req.log.requestTime = req.log.reqStart - req.log.reqEnd;
      } else {
        response.status = false;
        response.data = "";
        response.error = error;
      }
      resolve(response);
    })
  },
  responseGeneratorV3: function (req) {

    return new Promise(function (resolve, reject) {
      var response = _.cloneDeep(config.response);
      //console.log(req.data, "____________",!_.isNull(req.data), !_.isUndefined(req.data), _.isEmpty(req.error))
      if (!_.isNull(req.data) && !_.isUndefined(req.data) && _.isEmpty(req.error)) {
        response.status = true;
        response.data = req.data;
        response.error = "";

        // logging part for request
        req.log.reqEnd = Date.now();
        req.log.requestTime = req.log.reqEnd - req.log.reqStart;
      } else {
        req.log.reqEnd = Date.now();
        req.log.requestTime = req.log.reqEnd - req.log.reqStart;
        req.log.error = req.error;
        response.status = false;
        response.data = "";
        response.error = req.error;
      }
      resolve(response);
    })
  },
  responseGeneratorV4: function (req) {
    return new Promise(function (resolve, reject) {
      let response = {};
      //console.log(req.data, "came here____________",!_.isNull(req.data), !_.isUndefined(req.data), _.isEmpty(req.error))
      if (!_.isNull(req.data) && !_.isUndefined(req.data) && _.isEmpty(req.error)) {
        response.status = true;
        response.data = req.data;
        response.error = "";

        // logging part for request
        req.log.reqEnd = Date.now();
        req.log.requestTime = req.log.reqEnd - req.log.reqStart;
      } else {
        req.log.reqEnd = Date.now();
        req.log.requestTime = req.log.reqEnd - req.log.reqStart;
        req.log.error = req.error;
        response.status = false;
        response.data = "";
        response.error = req.displayError;
      }
      resolve(response);
    })
  },
  generateUUID: function () {
    return nodeUUIDV4();
  },
  errorFunctionNew: function (layer, logLevel, error, display, req, res) {
    if (layer > logLevel) {
      req.displayError = display;
    } else {
      req.displayError = req.error.message;
    }

    var obj = {
      statusMessage: "n",
      statusCode: "400",
      status: false,
      error: req.error.message
    }
    exception.customException(req, res, error, 200);
  }
}
module.exports = utils;