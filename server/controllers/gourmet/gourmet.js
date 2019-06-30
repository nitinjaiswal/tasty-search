const utilities = require('utilities');
  gourmetUtilities = utilities.data.gourmet.gourmet;
const functions = require('functions'),
  utils= functions.utils;
const config = require('config');
var Promise = require('bluebird');
var _ = require('lodash');
const foodReviews = require(config.app.dataDir.foodReviews);
const charIndex = require(config.app.dataDir.charIndex);

const layer = 2;
module.exports = {
  tastySearchController : function(req, res, next){
    const logLevel = 1;
    var display = 'Something Went Wrong'
    try{
      if(! req.controller.args){
        throw new Error('Problem in getting Bank List')
      }
      var attributes = req.controller.args
      var k = 20
      var query = attributes.query.split(',').map(function(i){ return i.trim()})

      var mainArr =[]
      var obj = {}
      query.forEach(function(item){
        if (!_.isUndefined(charIndex[item])){
          charIndex[item].forEach(function(i){
            if (_.isUndefined(obj[i])){
              obj[i] = {
                score : 1,
                reviewScore : foodReviews[i]['review/score'],
                docID : i
              }
            }
            else {
              obj[i].score += 1
            }
          })
        }
        
      })
      Object.keys(obj).forEach(function(key){
        mainArr.push(obj[key])
      })
      var actualData = _.orderBy(mainArr,['score', 'mainArr','docID'],['desc','desc','asc'])
      var result = []
      actualData.slice(0,20).forEach(function(item){
        result.push(foodReviews[item.docID])
      })
      req.data = result
      next();
      return ;

      // return customUtilities.customQuery(query)
      // .then(function(data){
      //   if (_.isEmpty(data)){
      //     throw new Error('no data found')
      //   }
      //   req.data = data[0]
      //   next();
      //   return;

      //   return a;
      // })
      // .catch(function(error){
      //   display = 'Problem in getting List';
      //   req.error = error;
      //   utils.errorFunctionNew(layer, logLevel, error, display, req, res);
      // })

    }catch(error){
      console.log('--Error--',error.message)
      display = 'Problem in getting List';
      req.error = error;
      utils.errorFunctionNew(layer, logLevel, error, display, req, res);
    }
  }
}
