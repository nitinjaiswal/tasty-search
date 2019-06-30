const request = require("request");
var _ = require('lodash'),
  app = module.exports = require('express')(),
  flagerr = false,
  functions = require('./functions'),
  exceptions = functions.exception,
  utils = functions.utils,
  mongo = functions.mongo,
  routeErrorMessage = 'sorry our chefs are busy cooking some desert!';

app.use(function (req, res, next) {
  req.log = {};
  req.log.id = utils.generateUUID();
  req.log.ip = req.ip
  req.log.baseUrl = req.baseUrl;
  req.log.originalUrl = req.originalUrl;
  req.log.domain = req.domain;
  req.log.url = req.url;
  req.log.method = req.method;
  req.log.reqStart = Date.now();
  req.displayError = "FOR STARTERS";
  
  next()
}); 

app.get('/', function(req,res,next){
  try {
    if (! _.isEmpty(req.query) && req.query.token.length > 0) {
      if (_.isUndefined(req.query.token)){
        throw new Error('something not right')
      }
      else {
        req.query.token = req.query.token.toLowerCase()
      }
      var options = { method: 'GET',
        url: 'http://localhost:3000/v1/gourmet/gourmet/tastySearch',
        qs: { query: req.query.token },
      };
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let data2 = JSON.parse(body).data

        res.render('index',{data: data2, query: req.query.token, error: false})
      });
       
    } 
    else {
      res.render('index',{data: [], query: false, error: false})
    }
  }
  catch(error){
    res.render('index',{data: [], query: false, error: error})
  }
  
})


require(__dirname + '/routes/').forEach(function (a) {
  app.use(a.prefix, a.app);
});

if (!flagerr) {
  console.log('routes mounted');
} else {
  app.use(function (req, res) {
    exceptions.customException(req, res, routeErrorMessage, 500);
  })
  console.log('mar gaye re!!!');
}
