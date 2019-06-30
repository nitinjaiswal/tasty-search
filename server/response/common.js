
const functions = require('functions');
const _ = require('lodash');
const utils = functions.utils;


module.exports = {
  genericResponseV3: function (req, res, next) {
    if (!req.dummy) {
      utils.responseGeneratorV4(req, null).then(function (data) {
        res.send(data);
        res.end()
      })
    } else {
      req.data = [{
        dummy: "dummy Response Object"
      }]
      utils.responseGeneratorV4(req, null).then(function (data) {
        res.send(data);
        res.end()
      })
    }
  },
  
}