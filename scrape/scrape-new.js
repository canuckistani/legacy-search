var phantom = require('phantom'),
    fs = require('fs'),
    async = require('async');

var pageUrl = 'http://www.bcliquorstores.com/product-catalogue?type=beer&start=0';

/* 

1. get the limit and create an array like 
  [0, 10, 20, 30 => limit]

2. create an array of bound functions:
  var ph;
  functions = _.map(pages, function() {
    ph.createPage({})
  })

3. run bound functions in async.parallelLimit => all meta data

4. when each bound function triggers it's callback, that callback 
   fetches the stock data for each beer at Alberni & Bute

# Frequency: 
 - beer list, once/week
 - stock list, once/day
 - reports?
*/


function getAllBeers(ph, startUrl, cb) {
  var beers = [];
  ph.createPage(function (page) {

    page.set('onLoadFinished', function(success) {
      console.log("Loading: "+success);
      page.evaluate(function() {
        var limit = jQuery('.solrsearch-paginator-static a:last-child')
          .attr('href')
          .split('&')
          .pop()
          .split('=')
          .pop();
        // get the beer data
        var ret = [];
        jQuery('.productlistdetail').each(function() {
            var link = $(this).find('h3 > a');
            var _tmp = link.html().split(' - ');

            var beer = {};
            beer.volume = $(this).find('li.Volume').text();
            if (_tmp.length === 2) {
              beer.brewer = _tmp[0];
              beer.name =  _tmp[1];
            }
            else {
              beer.name = _tmp[0];
            }

            beer.id = link.attr('href').split('/').pop();
            ret.push(beer);
        });

        var pager = jQuery('div.solrsearch-paginator-static');
        var links = jQuery(pager).find('a');
        var _uri = false;
        if (links.length === 4) {
          // first page or last?
          if(links.get(0).textContent === 'Next') {
            // first page
            _uri = links.get(0).href;
          }
          // else {
          //   // last page
          //   // dunno?
          // }
        }
        else {
          // somewhere in the middle
          _uri = links.get(2).href;
        }
        return {
          limit: limit,
          next: _uri,
          data: ret
        };
      },
      function(result) {
        if (result.next) {
          beers.push(result.data);
          page.open(result.next);
        }
        else {
          page.close();
          cb(beers);
        }
      });
    });

    page.injectJs('./lib/phantom-util.js');
    page.open(pageUrl, function (status) {
      console.log("page opened: "+status);
    });
  });
}

phantom.create(function (ph) {
  functions = [getAllBeers];
  async.waterfall([
      function(callback) {
        getAllBeers(ph, pageUrl, callback);
      }
    ], function(result) {
    console.log(result);
  });
});
