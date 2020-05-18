const BestBuy = require('./src/BestBuy');
const Queries = require('./src/Queries');
const Alert = require('./src/Alert');

class Task {

  constructor(url, config) {
    this.url = url;
    this.firstRun = true;
    this.intv = null;
    this.intervalCount = 0;
    this.poll = 30000;
  }

  async start() {

    let f;

    this.intv = setInterval(f = async () => {

      const products = await BestBuy.getItems(this.url);

      // console.log(products);

      if(this.firstRun) {

        for(const item of products) {
          // console.log(item);
          Queries.db.none('INSERT INTO monitor_data(item_name, item_img_url, item_url, item_color, item_price, item_avail, item_use)' +
          'VALUES(${item_name}, ${item_img}, ${item_url}, ${item_color}, ${item_price}, ${item_avail}, ${item_use})', item)
            .then(function(result) {
              console.log('Inserted '+item.item_name+ ' into the Best Buy Database');
            })
            .catch(function (err) {
              console.log(err);
            });
        }
        this.firstRun = false;
        console.log('Initial check Done');

      } else {
        for(const item of products) {
          // see if item exists in db already
          Queries.db.one('SELECT EXISTS(SELECT 1 FROM monitor_data WHERE item_name= $1)', item.item_name)
            .then(function(result) {
              if(result) {
                // get the row for the item in question, and check if there has been any update to the number in stock
                Queries.db.one('SELECT * FROM monitor_data WHERE item_name= $1', item.item_name)
                  .then(function(res) {
                    // console.log('Existing: ' + item.item_name + "; New: " + res.item_name);
                    if((item.item_price !== res.item_price ||
                       item.item_url !== res.item_url ||
                       item.item_name !== res.item_name) && item.item_avail === res.item_avail) {
                      // if the availability is still the same then, don't notify the chat

                      // UPDATE RECORDS
                      console.log("Update but not alert.");

                    }
                    else if( item.item_avail !== res.item_avail && item.item_avail > 0){
                      // if the availability has changed and IS available, notify the slack chat
                      console.log("Slack: Item Added");
                      Alert.slack(global.config.slack.webhook_url, item.item_name, item.item_url, item.item_img_url, item.item_price, item.item_color, item.item_avail, item.item_use, "Item Stock Update.");
                    } else {
                      console.log(res.item_name);
                      console.log("-----------------------");
                    }
                  })
              }
              else if(!result){
                // insert new obj into database, since it doesn't already exist in there
                Queries.db.none('INSERT INTO monitor_data(item_name, item_img_url, item_url, item_color, item_price, item_avail, item_use)' +
                'VALUES(${item_name}, ${item_img}, ${item_url}, ${item_color}, ${item_price}, ${item_avail}, ${item_use})', item)
                  .then(() => {
                    // send notification that an item has been added
                    console.log("Slack: Item Added");
                    Alert.slack(global.config.slack.webhook_url, item.item_name, item.item_url, item.item_img_url, item.item_price, item.item_color, item.item_avail, item.item_use, "New Item added.");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            })


          // first see if this item is already in the Database
          // if not enter it and exit loop to next items

          // if it is,

        }


        console.log('Checked Again.');
      }

    }, this.poll);

    f();
  }
}

module.exports = Task;
