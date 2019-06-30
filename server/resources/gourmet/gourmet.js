const functions = require('functions'),
  utils= functions.utils,
  validation = functions.validation;
const config = require('config')
const layer = 1;
const logLevel = config.logLevel.RESOURCES
var _ = require('lodash');
module.exports = {
  tastySearchResource: function(req, res, next){
    try{      
      
      var display = '';
      const logLevel = 1;
      var schema = {
        forbidden: [],
        query: {
          type: 'string',
          isRequired: true
        }
      }

      var validationObj = validation.validate(req.query,schema)
      if(validationObj.severity){
        req.error = new Error(validationObj.message)
        utils.errorFunctionNew(layer, logLevel, validationObj, validationObj.message, req, res);
      }
      req.controller = {}
      req.controller.args = req.query
      next();
    }
    catch(error){
      var display = 'something went wrong';
      req.error = error
      utils.errorFunctionNew(layer, logLevel, error, display,req, res)
    }
  }
}

