/*
 Author: Deepak Sharma
 github: https://github.com/deepaksharma2491
*/
'use strict'

var _ = require("lodash");

// severity: "error/ warning/ correct"
// ip based failed requests locking


// Schema Format

// var schema = {
//   forbidden: [list of keys],
//   key1: {
//     type: ["string", "integer", "boolean", "object", "array", "date", "file"],
//     default: value in case no value is passed,
//     min: minimumLength "string, array"/min date for date datatype/integer min limit/min key in object/min size of file,
//     max: maximumLength "string, array"/max date for date datatype/interger max limit/max key in object/max size of file,
//     allow: [possible options of values, array of values]
//     isRequired: true/false,
//     items: [allowed data types for array, sepecfic schema of object],
//     timestamp: true/false,
//     positive: true/false,
//     negative: true/false,
//     nestedObj: {
//       extends: parentKey,
//       key2: {
//         same logic
//       }
//     },
//     length: number of values in array/number of allowed keys in object,
//     caseSensitive: true/false,
//     regex: pattern to match,
//     isDecimal: integer specific,
//     isFloat: integer specific,
//   }
// }



var Number = {
  isFloat: function (number) {
    return (number%1 == 0) ? false: true;
  },
  positive: function (number) {
    return (number > 0)
  },
  negative: function (number) {
    return (number < 0)
  },
  validateNumber: function (object, schema, key) {
    var flag = true;
    var type = schema.type;
    var error = {};

    function errorMessage(message) {
      error.message = _.isUndefined(message) ? "malformed request, expected typeof " + key +  " is " + type : message;
      error.severity = "error";
    }


    if (flag && !_.isNumber(object)) {
      _.isEmpty(error) ? errorMessage() : error;
      flag = false;
    }

    if (flag && _.has(schema, "max") && object > schema.max) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key +  " should be less than " + schema.max) : error;
    }

    if (flag && _.has(schema, "min") && object < schema.min) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key + " should be greater than " + schema.min) : error;
    }

    if (flag && _.has(schema, "postive") && !this.positive(object)) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key + " should positive " + schema.max) : error;
    }

    if (flag && _.has(schema, "postive") && !this.negative(object)) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key + " should negative " + schema.max) : error;
    }

    if (flag && _.has(schema, "allow") && schema.allow.indexOf(object) == -1) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key + " should be in " + _.join(schema.allow, ",")) : error;
    }


    return error;
  }
}

var String = {
  validateString: function (object, schema, key) {
    var type = schema.type;
    var flag = true;
    var error = {};

    function errorMessage(message) {
      error.message = _.isUndefined(message) ? "malformed request, expected typeof " + key +  " is " + type : message;
      error.severity = "error";
      flag = false;
    }

    if (flag && !_.isString(object)) {
      _.isEmpty(error) ? errorMessage() : error;
      flag = false;
    }
    if (flag && _.has(schema, "max") && object.length > schema.max) {
      _.isEmpty(error) ? errorMessage("malformed request, expected length of " + key +  " should be less than " + schema.max) : error;
    }

    if (flag && _.has(schema, "min") && object.length < schema.min) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key + " should be greater than " + schema.min) : error;
    }

    if (flag && _.has(schema, "regex") && _.isRegExp(schema.regex) && !schema.regex.test(object)) {
      _.isEmpty(error) ? errorMessage("malformed request, expected value of " + key + " should match the regular expression pattern.") : error;
    }

    return error;
  }
}

var Boolean = {
  validateBoolean: function (object, schema, key) {
    var type = schema.type;
    var flag = true;
    var error = {};

    function errorMessage(message) {
      error.message = _.isUndefined(message) ? "malformed request, expected typeof " + key +  " is " + type : message;
      error.severity = "error";
      flag = false;
    }

    if (flag && !_.isBoolean(object)) {
      _.isEmpty(error) ? errorMessage() : error;
      flag = false;
    }

    return error;
  }
}

var Date = {
  validateDate: function (object, schema, key) {
    var type = schema.type;
    var flag = true;
    var error = {};

    function errorMessage(message) {
      error.message = _.isUndefined(message) ? "malformed request, expected typeof " + key +  " is " + type : message;
      error.severity = "error";
      flag = false;
    }


    if (flag && !schema.timestamp && !_.isDate(object)) {
      _.isEmpty(error) ? errorMessage() : error;
      flag = false;
    }

    if (flag && schema.timestamp && !_.isNumber(object)) {
      _.isEmpty(error) ? errorMessage("malformed request, expected date of " + key +  " should be a timestamp") : error;
    }

    if (flag && _.has(schema, "max") && object > schema.max) {
      _.isEmpty(error) ? errorMessage("malformed request, expected date of " + key +  " should be less than " + schema.max) : error;
    }

    if (flag && _.has(schema, "min") && object < schema.min) {
      _.isEmpty(error) ? errorMessage("malformed request, expected date of " + key +  " should be greater than " + schema.min) : error;
    }

    return error;
  }
}

var Array = {
  validateArray: function (object, schema, key) {
    var error = {};

    function errorMessage(message) {
      error.message = _.isUndefined(message) ? "malformed request, expected typeof " + key +  " is " + type : message;
      error.severity = "error";
      flag = false;
    }

    if (_.isArray(object)) {
      //if items are object validate nested items
      object.forEach(function (item, index) {
        var flag = false;
        if (_.isEmpty(error)) {
          schema.items.forEach(function (allowedType) {
            switch (allowedType.type) {
              case ("string"):
                if (_.isString(item)) {
                  error = _.isEmpty(error) ? functions.dataValidation(item, _.cloneDeep(allowedType), index) : error;
                  flag = true;
                  break;
                }
              case ("number"):
                if (_.isNumber(item)) {
                  error = _.isEmpty(error) ? functions.dataValidation(item, _.cloneDeep(allowedType), index) : error;
                  flag = true;
                  break;
                }
              case ("boolean"):
                if (_.isBoolean(item)) {
                  error = _.isEmpty(error) ? functions.dataValidation(item, _.cloneDeep(allowedType), index) : error;
                  flag = true;
                  break;
                }
              case ("object"):
                if (_.isObject(item)) {
                  error = _.isEmpty(error) ? functions.dataValidation(item, _.cloneDeep(allowedType), index) : error;
                  flag = true;
                  break;
                }
              case ("array") :
                if (_.isArray(item)) {
                  error = _.isEmpty(error) ? functions.dataValidation(item, _.cloneDeep(allowedType), index) : error;
                  flag = true;
                  break;
                }
              case ("date") :
                if (_.isDate(item)) {
                  error = _.isEmpty(error) ? functions.dataValidation(item, _.cloneDeep(allowedType), index) : error;
                  flag = true;
                  break;
                }
              default:
                break;
            }
          })
        }

        if (!flag && _.isEmpty(error)) {
          message = "malformed request, expected typeof value at index: " + index + " in key: " + key + " should be of type " + _.join(schema.items.map((item) => {return item.type}), ", ")
          errorMessage(message)
        }
      })
    }
    return error;
  }
}

var functions = {
  validateFile: function (object, schema, key) {
    console.log("function coming soon");
    return {};
  },
  dataValidation: function (object, schema, key) {
    // console.log("dataValidation", object, schema, key)
    var type = schema.type;
    var error = {};
    function errorMessage(message) {
      error.message = _.isUndefined(message) ? "malformed request, expected typeof " + key +  " is " + type : message;
      error.severity = "error";
    }
    if (type == "object" && _.isObject(object)) {
      error = _.isEmpty(error) ? functions.objectValidation(object, schema.nestedObj) : error;
    } else if (type !== "object" && _.isEmpty(error)) {
    switch (type){
      case ("string"):
        error = _.isEmpty(error) ? String.validateString(object, schema, key) : error;
        break;
      case ("number"):
        error = _.isEmpty(error) ? Number.validateNumber(object, schema, key) : error;
        break;
      case ("boolean"):
        error = _.isEmpty(error) ? Boolean.validateBoolean(object, schema, key) : error;
        break;
      case ("array"):
        error = _.isEmpty(error) ? Array.validateArray(object, schema, key) : error;
        break;
      case ("date"):
        error = _.isEmpty(error) ? Date.validateDate(object, schema, key) : error;
        break;
      case ("file"):
        error = _.isEmpty(error) ? functions.validateFile(object, schema, key) : error;
        break;
      default:
        unexpectedType();
      }
    }

    return error;
  },
  objectValidation: function (object, schema) {
    var flag = true;

    // set error origin before returning error.
    var error = {
      severity: "",
      deleted: []
    };

    Object.keys(object).forEach(function (keyObj) {
      if (flag && schema.forbidden.indexOf(keyObj) > -1) {
        if (_.has(schema, "extends")) {
          error.message = schema.extends + "." + keyObj + " is a forbidden entity, please reform your request.";
        } else {
          error.message = keyObj + " is a forbidden entity, please reform your request.";
        }
        error.severity = "error";
        flag = false;
      }
      if (flag && !_.has(schema, keyObj)) {
        error.message = keyObj + " is an extra key in your request, it wont be processed.";
        error.severity = "warning";
      }

      if (!_.has(schema, keyObj)) {
        error.deleted.push({
          key: keyObj,
          data: object[keyObj]
        })
        delete object[keyObj];
      }
    })

    if (flag) {
      Object.keys(schema).forEach(function (keySchema) {
        if (keySchema !== "forbidden" && keySchema !== "extends") {
          let curKeySchema = _.cloneDeep(schema[keySchema]);
          let pass = false;
          if (curKeySchema.isRequired && !_.has(object, keySchema)) {
            error.message = keySchema + " is a required field which is missing in request, please request again.";
            error.severity = "error";
          } else if (_.has(object, keySchema)) {
            pass = true;
          }

          if (pass) {
            var curKeyData = _.cloneDeep(object[keySchema]);
            var leta = (!_.has(error, "message") && error.severity !== "error") ? 1 : 2;

            error = error.severity !== "error" ? _.assign(error, functions.dataValidation(curKeyData, curKeySchema, keySchema)) : error;
          }
        }
      })

      if (_.has(schema, "extends") && error.severity == "error") {
        error.parentKey = (_.isUndefined(error.parentKey) || error.parentKey == "") ? schema.extends : "." + schema.extends;
      }
    }

    return error;
  },
  schemaValidation: function (schema) {
    var error = {};
    var flag = true;
    // forbidden is must,
    if (flag && !(_.has(schema, "forbidden") && _.isArray(schema.forbidden))) {
      error.message = "forbidden key is missing in schema ";
      error.severity = "error";
      flag = false;
    }

    Object.keys(schema).forEach(function (schemaKey) {
      if (flag) {
        // type is must,
        if (schemaKey !== "forbidden" && !_.has(schema, schemaKey + ".type")) {
          error.message = "type key is missing for " + schemaKey + " in schema.";
          error.severity = "error"
          flag = false;
          return;
        }

        // extends, nestedObj is must,
        if (schemaKey !== "forbidden" && schema[schemaKey]["type"] == "object" && (!_.has(schema, schemaKey + ".nestedObj") || !_.has(schema, schemaKey + ".nestedObj.extends"))) {
          error.message = "extends or nestedObj key is missing for " + schemaKey + " in schema.";
          error.severity = "error";
          flag = false;
          return;
        }
        if (schemaKey !== "forbidden" && schema[schemaKey]["type"] == "array" && !_.has(schema, schemaKey + ".items")) {
          error.message = "items key is missing for " + schemaKey + " in schema.";
          error.severity = "error";
          flag = false;
          return;
        }
        // if((_.has(schema, schemaKey + ".nestedObj"))) {
        //   error = functions.schemaValidation(schema[schemaKey]["nestedObj"])
        //   if(!_.isEmpty(error)) {
        //     return;
        //   }
        // }
      }
    })
    return error;
  }
}

module.exports = {
  validate: function (object, schema, callback) {
    var error = {};

    // argument validation
    if (_.isUndefined(arguments[0]) || _.isUndefined(arguments[1])) {
      error = {
        message: "validate function called with wrong arguments",
        severity: "error"
      }
    }
    if (!_.isObject(arguments[0]) || !_.isObject(arguments[0])) {
      error = {
        message: "validate function called with wrong argument data types",
        severity: "error"
      }
    }

    error = _.isEmpty(error) ? _.assign(error, functions.schemaValidation(arguments[1])) : error;

    error = _.isEmpty(error) ? _.assign(error, functions.objectValidation(object, schema)) : error;

    return error;
  }
}

// example for validation

// var schema = {
//   forbidden: [],
//   number: {
//     type: "number",
//     max: 4
//   },
//   string: {
//     type: "string",
//     max: 16,
//     regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//   },
//   object: {
//     type: "object",
//     nestedObj: {
//       extends: "object",
//       forbidden: [],
//       hello: {
//         type: "string",
//         max: 6
//       }
//     }
//   },
//   array: {
//     type: "array",
    // items: [
    //   {
    //     type: "object",
    //     nestedObj: {
    //       extends: "array",
    //       forbidden: [],
    //       hello: {
    //         type: "string",
    //         max: 2
    //       }
    //     }
    //   }
    // ]
//   }
// }

// validate.validate({number:3, string: "hello@gmail.com", "object": {hello: "oh bc!"}, array: [{hello: "asd"}]}, schema);
