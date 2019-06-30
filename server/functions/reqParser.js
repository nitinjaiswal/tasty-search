/*
 Author: Deepak Sharma
 github: https://github.com/deepaksharma2491
 */
'use strict'

var _ = require('lodash')
var exception = require('./exception')
var paginationMisingMessage = ' pagination params kaun bhejega BC!!';
var paramterMissingMessage = ' parameter missing/empty in ';
var defaultErrorMessage = ' does not exists in default parameter list';
var typeFailMessage = ' is not of right datatype';
var keyMissingMessage = '$path is missing $listOfKeys key/s';
var extraKeyMessage = '$path has these $listOfKeys unexpected keys';
var fileCheckFailMessage = ' is not of desired format';
var wrongAadharMessage = ' should be of 12 digits';
var wrongMobileMessage = ' should be of 10 digits and numeric only';
var unAuthorizedMessage = ' unAuthorized Access';

module.exports = {
  //check paging and offset
  paginationCheck: function (req, res, params) {
    var message = null;
    if (_.has(req.query, 'paging')) {
      try {
        var paging = JSON.parse(req.query.paging);

        paging.limit = _.isUndefined(paging.limit) ? Number(params.defaultLimit) : Number(paging.limit);
        paging.offset = _.isUndefined(paging.offset) ? Number(params.defaultOffset) : Number(paging.offset);
        if (!_.isNumber(paging.limit) || !_.isNumber(paging.offset)) {
          message = "pagingation parameter" + typeFailMessage;
        }
        req.query.paging = {
          limit: paging.limit,
          offset: paging.offset
        };
      } catch (ex) {
        exception.customException(req, res, ex, 500);
        return false;
      }
    } else {
      message = paginationMisingMessage
    }
    if (message === null) {
      return true;
    } else {
      exception.customException(req, res, message, 400)
      return false;
    }
  },
  keyCheckJSON: function (req, res, location, path, defaultList, nonMendateList) {
    var message = null,
      flag = false,
      flagExtra = false,
      flagMissing = false,
      missingKeys = [],
      extraKeys = [];

    nonMendateList = _.isUndefined(nonMendateList) ? defaultList : _.concat(defaultList, nonMendateList);
    try {
      if (_.isArray(req[location][path])) {
        if(defaultList.length > 0 && _.isEmpty(req[location][path])) {
            defaultList.forEach(function (item) {
            var internalFlag = (_.indexOf(keyList, item) >= 0) ? false : true;

            if (internalFlag) missingKeys.push(item);
            flagMissing = (!flagMissing && !internalFlag) ? false : true;
          })
        } else {
          req[location][path].forEach(function (pathObject) {
            var keyList = Object.keys(pathObject);
            defaultList.forEach(function (item) {
              var internalFlag = (_.indexOf(keyList, item) >= 0) ? false : true;

              if (internalFlag) missingKeys.push(item);

              flagMissing = (!flagMissing && !internalFlag) ? false : true;
            });
            keyList.forEach(function (item) {
              var internalFlag = (_.indexOf(nonMendateList, item) >= 0) ? false : true;

              if (internalFlag) extraKeys.push(item);
              flagExtra = (!flagExtra && !internalFlag) ? false : true;
            })
          })
        }        
      } else if (_.isObject(req[location][path])) {
        var keyList = Object.keys(req[location][path]);
        defaultList.forEach(function (item) {
          var internalFlag = (_.indexOf(keyList, item) >= 0) ? false : true;

          if (internalFlag) missingKeys.push(item);
          flagMissing = (!flagMissing && !internalFlag) ? false : true;
        })
        keyList.forEach(function (item) {
          var internalFlag = (_.indexOf(nonMendateList, item) >= 0) ? false : true;

          if (internalFlag) extraKeys.push(item);
          flagExtra = (!flagExtra && !internalFlag) ? false : true;
        })
      } else if(_.isUndefined( req[location][path]) && req[location]){
        var keyList = Object.keys(req[location]);
        defaultList.forEach(function(item){
          var internalFlag = (_.indexOf(keyList, item) >= 0) ? false : true;

          if (internalFlag) missingKeys.push(item);
          flagMissing = (!flagMissing && !internalFlag) ? false : true;
        })
        keyList.forEach(function (item) {
          var internalFlag = (_.indexOf(nonMendateList, item) >= 0) ? false : true;
          if (internalFlag) extraKeys.push(item);
          flagExtra = (!flagExtra && !internalFlag) ? false : true;
        })
        path = location;
      }
      else {
        flag = true;
      }

      if (!flag && !flagMissing && !flagExtra) {
        return true;
      } else if (flagExtra) {
        message = extraKeyMessage.replace('$path', path).replace('$listOfKeys', _.join(extraKeys, ', '));
      } else if (flagMissing) {
        message = keyMissingMessage.replace('$path', path).replace('$listOfKeys', _.join(missingKeys, ', '));
      } else {
        message = path + typeFailMessage;
      }

      if (message === null) {
        return true;
      } else {
        exception.customException(req, res, message, 400);
        return false;
      }
    } catch (ex) {
      exception.customException(req, res, ex, 500)
    }
  },
  defaultCheck: function (req, res, location, path, default_list, defaultValue) {
    var message = null;
    var exists = false;
    if (_.has(req[location], path)) {
      exists = _.indexOf(default_list, req[location][path]) >= 0 ? true : false;
    } else {
      if (!_.isUndefined(defaultValue)) {
        req[location][path] = defaultValue;
        exists = true;
      } else {
        message = path + paramterMissingMessage + location;
      }
    }
    if (!exists) {
      message = path + defaultErrorMessage;
    }

    if (message === null) {
      return true;
    } else {
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  fileCheck: function (req, res, location, path, media, mimeType) {
    var message = null;
    var flag = false;

    if (_.has(req[location], path)) {
      if (_.has(req[location][path], 'mimetype') && _.has(req[location][path], 'extension')) {
        var mediaType = req[location][path].mimetype.split('/')[0];
        flag = (mimeType.indexOf(req[location][path].extension) >= 0 && media == mediaType) ? true : false;
      }
    }

    if (!flag) {
      message = path + fileCheckFailMessage;
    }

    if (message !== null) {
      exception.customException(req, res, message, 400);
      return false;
    } else {
      return true;
    }
  },
  typeCheck: function (req, res, location, path, type, mandatory, defaultValue) {
    var message = null;
    var flag = false
    if (_.has(req[location], path)) {
      switch (type) {
        case ('String'):
          try {
            flag = !_.isNull(req[location][path]);
            req[location][path] = String(req[location][path]);
            flag = flag && _.isString(req[location][path]);
          } catch (ex) {
            flag = true;
          }
          break;
        case ('Number'):
          try {
            req[location][path] = Number(req[location][path]);
            flag = _.isNumber(req[location][path])
            flag = !_.isNaN(req[location][path])
          } catch (ex) {
            flag = true;
          }
          break;
        case ('Digits'):
          try {
            var digitsRegex = new RegExp("^[0-9]*$")
            flag = digitsRegex.test(req[location][path]);
          } catch (ex) {
            flag = true;
          }
          break;
        case ('AlphaNumeric'):
          try {
            var alphaNumericRegex = new RegExp("^[0-9a-zA-Z]*$")
            flag = alphaNumericRegex.test(req[location][path]);
          } catch (ex) {
            flag = true;
          }
          break;
        case ('boolean'):
          flag = _.isBoolean(req[location][path]);
          break;
        case ('Date'):
          var dateParam = new Date(req[location][path]);
          req[location][path] = dateParam;
          flag = !_.isNaN(dateParam.valueOf())
          break;
        case ('Array'):
          try {
            var queryJSON = [];
            if (_.isObject(req[location][path])) {
              flag = true;
            } else {
              queryJSON = JSON.parse(req[location][path]);
              req[location][path] = queryJSON;
              flag = _.isArray(queryJSON);
            }
          } catch (ex) {
            exception.customException(req, res, ex, 500);
            return false;
          }
          break;
        case ('Json'):
          try {
            var queryJSON = {};
            if (_.isObject(req[location][path])) {
              flag = true;
            } else {
              queryJSON = JSON.parse(req[location][path]);
              req[location][path] = queryJSON;
              flag = _.isObject(queryJSON);
            }
          } catch (ex) {
            exception.customException(req, res, ex, 500);
            return false;
          }
          break;
        default:
          flag = false;
      }

      if (!flag) {
        message = path + typeFailMessage;
      }
    } else {
      message = path + paramterMissingMessage + location;
    }
    if (message !== null && mandatory) {
      exception.customException(req, res, message, 400);
      return false;
    } else if (!mandatory && message !== null) {
      req[location][path] = (_.isUndefined(defaultValue)) ? null : defaultValue
      return true;
    } else {
      return true;
    }
  },
  parameterMissingCheck: function (req, res, location, path, defaultValue) {
    var message = null;
    // console.log(_.has(req.query, path), req.query, path, defaultValue, !_.isUndefined(defaultValue) && !_.isNull(defaultValue))
    if (_.has(req[location], path)) {
    } else if (!_.isUndefined(defaultValue) && !_.isNull(defaultValue)) {
      req[location][path] = defaultValue;
    } else {
      message = path + paramterMissingMessage + location;
    }

    if (message === null) {
      return true;
    } else {
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  queryParser: function (req, res, location, path) {
    var message = null,
      $or = {},
      $and = {};
    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    } else {
      try {
        var pathData = JSON.parse(req[location][path])
        if (!_.isArray(pathData)) {
          pathData = [pathData]
        }
        pathData.forEach(function (item) {
          if (item.conditionOperator === 'or') {
            var operator = '$' + item.operator;

            $or[item.key] = {};
            $or[item.key] = item.value;
          } else if (item.conditionOperator === 'and') {
            var operator = '$' + item.operator;
            $and[item.key] = {}
            if (operator === '$eq') {
              $and[item.key] = item.value;
            } else if (operator === '$between') {
              if (typeof(item.value) == 'object') {
                $and[item.key][operator] = item.value;
              } else if (typeof(item.value) == 'string') {
                $and[item.key][operator] = JSON.parse(item.value)
              }
            }else{
              $and[item.key] = item.value;
            }
          }
        })

      } catch (ex) {
        exception.customException(req, res, ex, 400);
        return false;
      }

      if (message === null) {
        if (!_.isEmpty($and) && !_.isEmpty($or)) {
          req[location][path] = {
            where: [{
              $or: $or
            }, {
              $and: $and
            }]
          }
        } else if (!_.isEmpty($and)) {
          req[location][path] = {
            where: {
              $and: $and
            }
          }
        } else if (!_.isEmpty($or)) {
          req[location][path] = {
            where: {
              $or: $or
            }
          }
        } else {
          req[location][path] = {}
        }
        return true;
      } else {
        exception.customException(req, res, message, 400);
        return false;
      }

    }
    return true;
  },
  orderParser: function (req, res, location, path) {
    var message = null,
      orderJSON = {};

    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    } else {
      try {
        orderJSON = JSON.parse(req[location][path]);
        req[location][path] = orderJSON;
      } catch (ex) {
        exception.customException(req, res, ex, 500);
        return false;
      }
    }
    if (!(message === null)) {
      exception.customException(req, res, message, 400);
      return false;
    }

    return true;
  },
  querySelectorBuilder: function (req, res, location, path) {
    var message = null;
    var queryJSON = {},
      selectorJSON = {$or: {}, $and: {}}
    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    } else {
      try {
        queryJSON = JSON.parse(req[location][path]);
      } catch (ex) {
        exception.customException(req, res, ex, 500);
        return false;
      }

      if (_.isObject(queryJSON)) {
        Object.keys(queryJSON).forEach(function (keyQuery) {
          if (!_.has(selectorJSON, '$' + keyQuery)) selectorJSON['$' + keyQuery] = queryJSON[keyQuery]
          if (_.isArray(queryJSON[keyQuery])) {
            queryJSON[keyQuery].forEach(function (data) {
              Object.keys(data).forEach(function (keyData) {
                if (_.isArray(data[keyData])) {
                  var keyDataObject = {};

                  keyDataObject[keyData] = []
                  selectorJSON['$' + keyQuery] = {}
                  data[keyData].forEach(function (operator) {
                    var newOperator = {};
                    newOperator['$' + operator] = data[keyData][operator];
                    keyDataObject[keyData].push(newOperator)
                  })
                  selectorJSON['$' + keyQuery][keyData] = keyDataObject[keyData]
                } else {
                  selectorJSON['$' + keyQuery][keyData] = []
                  Object.keys(data[keyData]).forEach(function (operator) {
                    var newOperator = {};

                    newOperator['$' + operator] = data[keyData][operator];
                    selectorJSON['$' + keyQuery][keyData].push(newOperator)
                  })
                }
              })
            })
          } else {
            var data = queryJSON[keyQuery];
            Object.keys(data).forEach(function (keyData) {
              if (_.isArray(data[keyData])) {
                var keyDataObject = {};

                selectorJSON['$' + keyQuery] = {}
                keyDataObject[keyData] = []
                data[keyData].forEach(function (keyDataValue) {
                  Object.keys(keyDataValue).forEach(function (operator) {
                    var newOperator = {};

                    newOperator['$' + operator] = keyDataValue[operator];
                    keyDataObject[keyData].push(newOperator)
                  })
                })
                selectorJSON['$' + keyQuery][keyData] = keyDataObject[keyData]
              } else {
                selectorJSON['$' + keyQuery][keyData] = {}
                Object.keys(data[keyData]).forEach(function (operator) {
                  var newOperator = {};

                  newOperator['$' + operator] = data[keyData][operator];
                  selectorJSON['$' + keyQuery][keyData] = (newOperator)
                })
              }
            })
          }
        })
      } else {
        message = path + typeFailMessage;
      }
    }

    if (message === null) {
      if (_.isEmpty(selectorJSON.$or)) {
        delete selectorJSON.$or;
      } else if (_.isEmpty(selectorJSON.$and)) {
        delete selectorJSON.$and;
      }
      req[location][path] = {where: selectorJSON}
      return true;
    } else {
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  filterParameters: function (req, res, attributes) {
    try {
      for (var key in attributes) {
        var value = attributes[key];
        if (value == undefined) {
          delete attributes[key];
        } else if (value == null) {
          delete attributes[key]
        }
      }
      return true;
    } catch (ex) {
      var message = "unable to iterate through attributes";
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  enumCheck: function (req, res, location, path, allowed) {
    try {
      for (var item in Object.keys(allowed)) {
        if (_.get(req[location], path) === allowed[item]) {
          return true;
        }
      }
      var message = _.get(req[location], path) + " not valid";
      exception.customException(req, res, message, 400);
      return false;
    } catch (ex) {
      var message = _.get(req[location], path) + " not valid";
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  emptyParameterCheck: function (req, res, attributes) {
    try {
      for (var key in attributes) {
        if(attributes[key] == undefined) {
          console.log(attributes[key], '02--000')
          delete attributes[key];
        } else if (attributes[key].length == 0) {
          delete attributes[key];
        } else if (attributes[key] == null) {
          console.log(attributes[key], '02--444444')
          delete attributes[key];
        }
      }
      return attributes;
    } catch (ex) {
      exception.customException(req, res, 400, 'Bad Request')
      return false;
    }
  },
  queryParserV3: function (req, res, location, path) {
    var message = null,
      $or = {},
      $and = {};
    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    } else {
      try {
        var pathData = JSON.parse(req[location][path])
        if (!_.isArray(pathData)) {
          pathData = [pathData]
        }
        pathData.forEach(function (item) {
          if (item.conditionOperator === 'or') {
            var operator = '$' + item.operator;

            $or[item.key] = {};
            $or[item.key] = item.value;
          } else if (item.conditionOperator === 'and') {
            var operator = '$' + item.operator;
            $and[item.key] = {}
            if (operator === '$eq') {
              $and[item.key][operator] = item.value;
            } else if (operator === '$between') {
              if (typeof(item.value) == 'object') {
                $and[item.key][operator] = item.value;
              } else if (typeof(item.value) == 'string') {
                $and[item.key][operator] = JSON.parse(item.value)
              }
            }
            else if(operator === '$ne'){
              $and[item.key][operator] = item.value;
            }
            else{
              $and[item.key] = item.value;
            }
          }
        })

      } catch (ex) {
        throw ex
      }

      if (message === null) {
        if (!_.isEmpty($and) && !_.isEmpty($or)) {
          req[location][path] = {
            where: [{
              $or: $or
            }, {
              $and: $and
            }]
          }
        } else if (!_.isEmpty($and)) {
          req[location][path] = {
            where: {
              $and: $and
            }
          }
        } else if (!_.isEmpty($or)) {
          req[location][path] = {
            where: {
              $or: $or
            }
          }
        } else {
          req[location][path] = {}
        }
        return true;
      } else {
        return message
      }

    }
    return true;
  },
  typeCheckArray: function (req, res, location, path,type, mandatory, defaultValue) {
    var message = null;
    var flag = false
    if (_.has(location, path)) {
      switch (type) {
        case ('Array'):
          try {
            var queryJSON = [];
            if (_.isObject(location[path])) {
              flag = true;
            } else {
              queryJSON = JSON.parse(location[path]);
              location[path] = queryJSON;
              flag = _.isArray(queryJSON);
            }
          } catch (ex) {
            exception.customException(req, res, ex, 500);
            return false;
          }
          break;
        default:
          flag = false;
      }

      if (!flag) {
        message = path + typeFailMessage;
      }
    } else {
      message = path + paramterMissingMessage + location;
    }
    if (message !== null && mandatory) {
      exception.customException(req, res, message, 400);
      return false;
    } else if (!mandatory && message !== null) {
      location[path] = (_.isUndefined(defaultValue)) ? null : defaultValue
      return true;
    } else {
      return true;
    }
  },
  queryParserV4: function (req, res, location, path) {
    var message = null,
      $or = {},
      $and = {};
    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    } else {
      try {
        var pathData = JSON.parse(req[location][path])
        if (!_.isArray(pathData)) {
          pathData = [pathData]
        }
        pathData.forEach(function (item) {
          if (item.conditionOperator === 'or') {
            var operator = '$' + item.operator;

            $or[item.key] = {};
            $or[item.key] = item.value;
          } else if (item.conditionOperator === 'and') {
            var operator = '$' + item.operator;
            $and[item.key] = {}
            if (operator === '$eq') {
              $and[item.key][operator] = item.value;
            } else if (operator === '$between') {
              if (typeof(item.value) == 'object') {
                $and[item.key][operator] = item.value;
              } else if (typeof(item.value) == 'string') {
                $and[item.key][operator] = JSON.parse(item.value)
              }
            }
            else if(operator === '$ne'){
              $and[item.key][operator] = item.value;
            }
            else{
              $and[item.key] = item.value;
            }
          }
        })

      } catch (ex) {
        exception.customException(req, res, ex, 400);
        return false;
      }

      if (message === null) {
        if (!_.isEmpty($and) && !_.isEmpty($or)) {
          req[location][path] = {
            where: [{
              $or: $or
            }, {
              $and: $and
            }]
          }
        } else if (!_.isEmpty($and)) {
          req[location][path] = {
            where: {
              $and: $and
            }
          }
        } else if (!_.isEmpty($or)) {
          req[location][path] = {
            where: {
              $or: $or
            }
          }
        } else {
          req[location][path] = {}
        }
        return true;
      } else {
        exception.customException(req, res, message, 400);
        return false;
      }
    }
    return true;
  },
  aadharCheck(req, res, location, path){
    var message = null;
    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    }else{
      var adharString = req[location][path].toString();
      if(adharString.length === 12){
        return true;
      }else{
        message = path+ wrongAadharMessage;
      }
    }
    if(message){
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  mobileCheck(req, res, location, path){
    var message = null;
    if (!_.has(req[location], path)) {
      message = path + paramterMissingMessage + location;
    }else{
      var mobile = Number(req[location][path]);
      if(mobile === 'NaN'){
        message = path+ wrongMobileMessage;
      }else{
        var firstDigit = mobile/1000000000;
        firstDigit = Math.floor(firstDigit)
        if(firstDigit === 6 || firstDigit === 7 || firstDigit === 8 || firstDigit === 9){
          return true;
        }else{
          message = path+ wrongMobileMessage;
        }  
      }
      
    }
    if(message){
      exception.customException(req, res, message, 400);
      return false;
    }
  },
  isAccessAllowed: function(req, res, allowedRoles, headerRoles){
    var message = null;
    if(headerRoles instanceof Array && allowedRoles instanceof Array){
      var isAllowed = false;
      headerRoles.forEach( function( headerItem, index){
        if( allowedRoles.indexOf(headerItem.roleName) >= 0) {
          isAllowed = true;
        }
      })
      if(isAllowed === false){
        message = unAuthorizedMessage
      }
      if( message){
        exception.customException( req, res, message, 403);
      }
    }else{
      throw new Error('allowedRoles and headerRoles should be Array')
    }

  }
}