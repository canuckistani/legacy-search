phantom.injectJs('./lib/underscore-min.js');

var pp = function(o) { return JSON.stringify(o,null,'  '); };

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

var collected = [];

var current = 0, limit = false;

page.onLoadFinished = function(status) {
  if (status === 'success') {

    if (!limit) {
      limit = page.evaluate(function() {
        return parseInt(jQuery('li.pager-last a').attr('href').split('=').pop(), 10);
      });
    }
    var location = page.evaluate(function() {
      return document.location.href;
    });

    console.log(location);
    console.log(current+'/'+limit);

    var beers = page.evaluate(function() {
      var ret = [];
      jQuery('.beer > h2 > a').each(function() {
        ret.push([this.textContent.toLowerCase(), this.href]);
      });
      return ret;
    });
    // console.log(pp(beers));

    

    if (current < limit) {
      console.log('incrementing current...');
      current++;
      page.evaluate(function() {
        document.location = jQuery('li.pager-next a').attr('href');
      });
    }
    else {
      console.log(JSON.stringify(collected));
      phantom.exit();
    }
  }
};

var tpl = 'https://legacyliquorstore.com/beer/all?sort_by=title&sort_order=ASC&page=';

page.open(tpl+current);
