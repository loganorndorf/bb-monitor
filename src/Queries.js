// const proxyUtil = require('../utils/proxy');

const promise = require('bluebird');

const options = {
  //Init options
  promiseLib: promise
};

const pgp = require('pg-promise')(options);
const dbString = `postgresql://postgres:$avageXL7@localhost:5432/bestbuy`;
// const cn = {
//   host: '127.0.0.1',
//   port: 5432,
//   database: 'bestbuy',
//   user: 'postgres',
//   password: '$avageXL7',
//   max: 30
// };
const db = pgp(dbString);

// add query function

function getAllItems(req, res, next) {
  db.any('select * from monitor_data')
    .then(function(data) {
      res.status(200)
      .json({
        status: 'success',
        data: data,
        message: 'Retrieved ALL Items'
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function getSingleItem(req, res, next) {
  var itemName = parseInt(req.params.id);
  db.one('select * from monitor_data where ')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE Item'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function addItem(req, res, next) {
  req.body.item_price = parseFloat(req.body.item_price);
  req.body.item_avail = parseInt(req.body.item_avail);
  db.none('insert into monitor_data(item_name, item_img, item_url, item_color, item_price, item_avail, item_use)' +
  'values(${item_name}, ${item_img}, ${item_url}, ${item_color}, ${item_price}, ${item_avail}, ${item_use})',
  req.body)
  .then(function() {
    res.status(200)
      .json({
        status: 'success',
        message: 'Added new Item'
      });
  })
  .catch( function(err) {
    return next(err);
  });
}

function updateItem(req, res, next) {
  db.none('update monitor_data set item_name=$1, item_img=$2, item_url=$3, item_color=$4, item_price=$5, item_avail=$6, item_use=$7 where id=$8',
    [req.body.item_name, req.body.item_img, req.body.item_url, req.body.item_color, parseFloat(req.body.item_price), parseInt(req.body.item_avail), req.body.item_use, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated Item'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeItem(req, res, next) {
  var itemID = parseInt(req.params.id);
  db.result('delete from monitor_data where id = $1', itemID)
    .then(function (result) {
      console.log("It works");
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} item`
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeAllItems(req, res, next) {
  db.result('truncate table monitor_data')
    .then(function (result) {
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ALL Items`
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// }



module.exports = {
  db: db,
  getAllItems: getAllItems, //
  getSingleItem: getSingleItem, // Product schema- get one product
  addItem: addItem, // NewProduct schema- add a new product
  updateItem: updateItem, //
  removeItem: removeItem,
  removeAllItems: removeAllItems
};
