// My Router Handler

// const Notify = require('./Notify');

class AppRouter {

  constructor(app) {
    this.app = app;
    this.setupRouters();
  }

  setupRouters() {
    const app = this.app;

    app.get('/', (req, res, next) => {
      // get products from database
      return res.render('home', {
        status: global.status
      });
    });

    app.get('/start', (req, res, next) => {
      global.startTask();
      return res.redirect('/');
    });

    app.get('/stop', (req, res, next) => {
      global.stopTask();
      return res.redirect('/');
    })
  }

}

module.exports = AppRouter;
