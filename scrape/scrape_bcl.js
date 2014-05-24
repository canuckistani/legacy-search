/*
1. get a list of all beers
2. for each beer get stock level at the Alberni & Bute Store
 */
phantom.injectJs('./lib/jquery.js');
phantom.injectJs('./lib/underscore-min.js');

var pp = function(o) { return JSON.stringify(o,null,'  '); };

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

var collected = [];

var current = 0, limit = false;

// test
limit = 20;

page.onUrlChanged = function(targetUrl) {
    // console.log('New URL: ' + targetUrl);
};

page.onLoadFinished = function(status) {
  if (status === 'success') {
    if (!limit) {
      limit = page.evaluate(function() {
        // console.log("page loaded: "+document.location.href);
        return $('.solrsearch-paginator-static a:last-child').attr('href').split('&').pop().split('=').pop();
      });
      // console.log("limit set to "+limit);
    }

    var location = page.evaluate(function() {
      return document.location.href;
    });

    var beers = page.evaluate(function() {
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

      return ret;
    });

    // console.log(JSON.stringify(beers, null, '  '));

    collected = collected.concat(beers);

    if (current < limit) {
      current +=10;
      page.evaluate(function() {
        // solrsearch-paginator-static
        var pager = jQuery('div.solrsearch-paginator-static');
        var links = jQuery(pager).find('a');
        var _uri = false;
        if (links.length === 4) {
          // first page or last?
          if(links.get(0).textContent === 'Next') {
            // first page
            _uri = links.get(0).href;
          }
          else {
            // last page
            // dunno?
          }
        }
        else {
          // somewhere in the middle
          _uri = links.get(2).href;
        }
        // console.log("next is "+_uri);
        document.location = _uri;
      });
    }
    else {
      console.log(JSON.stringify(collected));

      phantom.exit();
    }
  }
};

var tpl = 'http://www.bcliquorstores.com/product-catalogue?type=beer&start=';

page.open(tpl+current);
