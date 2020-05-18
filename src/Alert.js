const SlackWebhook = require('slack-webhook');

let Alert = {};

Alert.slack = function(webhook_url, item_name, item_url, item_img, item_price, item_color, item_avail, item_use, notifType) {

  let curHook = new SlackWebhook(webhook_url);

  webhook.send({
    attachments: [
      {
        "fallback": item_name,
        "title": item_name,
        "title_link": item_url,
        "color": item_color,
        "fields": [
          {
            "title": "Notification Type",
            "value": notifType,
            "short": "false"
          },
          {
            "title": "Price",
            "value": item_price,
            "short": "false"
          }
        ],
        "thumb_url": item_img
      }
    ]
  })

}

module.exports = Alert;
