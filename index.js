const axios = require('axios');
const cheerio = require('cheerio');

const listURL = 'https://www.bestbuy.com/site/nintendo-switch/nintendo-switch-consoles/pcmcat1484077694025.c?id=pcmcat1484077694025'
// const url = 'https://www.bestbuy.com/site/nintendo-switch-32gb-console-gray-joy-con/6364253.p?skuId=6364253';

axios.get(listURL)
  .then(response => {
    parseForLinks(response.data);
  })
  .catch(error => {
    console.log(error);
  })

parseForLinks = html => {
  let list = [];
  var $ = cheerio.load(html, {xmlMode: true});

  $("div[class='sku-title']").each((idx, elem) => {

    list.push('https://www.bestbuy.com' + elem.children[0].children[0].attribs.href);
  })

  for (el of list) {
    getPages(el);
  }
}

function getPages(url) {
  axios.get(url)
    .then(response => {
      getIndividualPageData(response.data);
    })
    .catch(error => {
      console.log(error);
    })

  // Get the page data for Nintendo Switch
  let getIndividualPageData = html => {
    var $ = cheerio.load(html, {xmlMode: true});

    $('script').filter('[type]:not([src])').each((idx, elem) => {
      try {
        var obj = JSON.parse(elem.children[0].data);
        if( typeof obj.offers !== 'undefined') {

          data = {
            name: obj.name,
            img: obj.image,
            url: obj.url,
            objColor: obj.color,
            price: obj.offers.price,
            availability: obj.offers.availability, // may sometimes be undefined - take into account when posting to db
            description: obj.offers.description
          };

          console.log(data);
          console.log("---------- END OF ITEM ----------");
        }
      }
      catch(e) {
        // don't do anything, just catch it
      }
    });
  }
}
