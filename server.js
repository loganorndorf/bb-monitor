require('console-stamp')(console, {
  colors: {
    stamp: 'yellow',
    label: 'cyan',
    label: true,
    metadata: 'green'
  }
});

// Express js reqs
const express = require('express');
const http = require('http');
const nunjucks = require('nunjucks');
const moment = require('moment');

// My Modules
// const AppRouter = require('./src/AppRouter');
const Queries = require('./src/Queries.js');
const AppRouter = require('./src/AppRouter.js');
const Task = require('./Task.js');

// Create Express Server
const app = express();
app.server = http.createServer(app);

global.task = null;
global.status = 'Stopped';
global.config = require('./config');

const URL = 'https://www.bestbuy.com/site/nintendo-switch/nintendo-switch-consoles/pcmcat1484077694025.c?id=pcmcat1484077694025';
const PORT = global.config.port;

Queries.db.result('truncate table monitor_data')
  .then(function (res) {
    console.log('All Nintendo Switch items in the Database have been removed.');
  })
  .catch(function (err) {
    console.log(err);
  })

nunjucks.configure('views', {
			autoescape: true,
			watch: true,
			express: app
		});

app.set('view engine', 'html');

new AppRouter(app);

app.server.listen(process.env.PORT || PORT, () => {
  console.log(`Server running at: http://localhost:${app.server.address().port}/`);
});

global.startTask = function() {
  global.task = new Task(URL);
  global.task.start();
  global.status = 'Active';
  global.startTime = moment().format('x');
  global.stoppedTime = null;

}

global.stopTask = function() {
  global.task.stop();
  global.status = 'Stopped';
  global.stoppedTime = moment().format('x');

}

// if(app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.code || 500)
//       .json({
//         status: 'error',
//         message: err
//       });
//   });
// }
//
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500)
//     .json({
//       status: 'error',
//       message: err.message
//     });
// });
