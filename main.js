require('engine').setup(function (app) {
  const config = require('./config');
  const passport = require('passport');
  if (process.env.NODE_SERVE_STATIC === '1') {
    var publicDir = config.app.publicDir;
    app.use(require('serve-static')(publicDir));
  }


  if (config.constants.production) {
    var log = require('metalogger')();
    // catch-all error handler for production
    app.use(function catchAllErrorHandler(err, req, res, next) {

      console.log('myerr', err);
      log.emergency(err.stack);
      res.sendStatus(500).send({msg: 'All Handled Error'});

    });
    process.on('uncaughtException', function (err) {
      console.log((new Date).toUTCString() + ' uncaughtException:', err.message);
      log.emergency(err.stack);
    });

    process.on('unhandledRejection', function (err) {
      console.log((new Date).toUTCString() + ' uncaughtException:', err.message);
      log.emergency(err.stack);
    });
  } else {
    console.log('app level error not handled, debug them by yourself, app will crash if your code crashes');
  }
  app.use(require('routes'));

});