var config = {
  app: {
    port: 3000,
    publicDir: __dirname + '/../public',
    dataDir: {
      foodReviews : __dirname+ '/../server/data/foodReviews.json',
      charIndex: __dirname+ '/../server/data/charIndex.json'
    },
  },
  http: {
    defaultApi: 'http://localhost:3000/',
    basePath: 'http://localhost:3000'
  }
  constants: {
    production: false
  },
  layers: {
    RESOURCES : 1,
    CONTROLLER : 2
  }
}


module.exports = config;