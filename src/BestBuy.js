const axios = require('axios');
const cheerio = require('cheerio');
const URL = 'https://www.bestbuy.com/site/nintendo-switch/nintendo-switch-consoles/pcmcat1484077694025.c?id=pcmcat1484077694025';
let BestBuy = {};

// list get request
BestBuy.getItems = async function(url) {
  promises = [];
  pages = [];

  const fin = await axios.get(url)
    .then((response) => {
      let links = [];
      const $ = cheerio.load(response.data);
      $("h4[class='sku-header']").each((idx, elem) => {
        links.push('https://www.bestbuy.com' + elem.children[0].attribs.href);
      });
      return links;
    })
    .then(async function(links) {
      for (const link of links) {
        // console.log(link);
        promises.push(
          axios.get(link).then((res) => {
            const $ = cheerio.load(res.data);
            $('script').filter('[type]:not([src])').each((idx, elem) => {
              try {
                var obj = JSON.parse(elem.children[0].data);
                if( typeof obj.offers !== 'undefined') {
                  let avail;

                  if(obj.offers.availability !== 'http://schema.org/SoldOut') {
                    avail = 1;
                  } else { avail = 0; }

                  data = {
                    item_name: obj.name,
                    item_img: obj.image,
                    item_url: obj.url,
                    item_color: obj.color,
                    item_price: obj.offers.price,
                    item_avail: avail, // may sometimes be undefined - take into account when posting to db
                    item_use: obj.offers.description
                  };

                  // console.log(data);
                  // console.log("---------- END OF ITEM ----------");
                  pages.push(data);
                }
              }
              catch(e) {
                // TODO
                //... for now, the 'packages' on the main URL cannot be JSON.parsed()
                // will address this differently once this works
              }
            });
          })
        )
      }
      const p = await Promise.all(promises).then(() => {
        // console.log(pages);
        return pages;
      })
      .catch((err) => {
        console.log('Issue with .all Promise function: ' + err);
      })
      return p;
    })
    .catch((err) => {
      console.log(err);
    })

  return(fin);
}

// const bb = BestBuy.getItems(URL);
// getSwitchUrls(URL);
module.exports = BestBuy;
