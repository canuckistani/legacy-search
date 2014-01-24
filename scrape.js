phantom.injectJs('./lib/underscore-min.js');

var pp = function(o) { return JSON.stringify(o,null,'  '); };

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

var collected = [];

var current = 0, limit = false;

// test
// limit = 4;

page.onLoadFinished = function(status) {
  if (status === 'success') {
    if (!limit) {
      limit = page.evaluate(function() {
        return parseInt(jQuery('li.pager-last a')
                        .attr('href')
                        .replace(/[\(\)]/, '')
                        .split('=')
                        .pop(), 10);
      });
    }
    var location = page.evaluate(function() {
      return document.location.href;
    });

    // console.log(location);
    // console.log(current+'/'+limit);

    var beers = page.evaluate(function() {
      var ret = [];

      jQuery('div.beer').each(function() {
          var stock = parseInt(jQuery(this)
             .find('.field-name-commerce-stock .even')
             .html(), 10);

          if (stock > 0) {
            var url = document.location.origin+jQuery(this).find('h2 > a').attr('href');
            var origin = jQuery(this).find('.field-name-field-country .even a').html();
            var name = jQuery(this).find('h2 > a').text().toLowerCase();
            var price = jQuery(this).find('.field-name-commerce-price .even').html();
            ret.push([name, origin, price, stock, url]);
          }
      });

      return ret;
    });

    collected = collected.concat(beers);

    if (current < limit) {
      // console.log('incrementing current...');
      current++;
      page.evaluate(function() {
        document.location = jQuery('li.pager-next a').attr('href');
      });
    }
    else {
     console.log(JSON.stringify(collected));
     // console.log(pp(collected));
      phantom.exit();
    }
  }
};

var tpl = 'https://legacyliquorstore.com/beer/all?sort_by=title&sort_order=ASC&page=';

page.open(tpl+current);
