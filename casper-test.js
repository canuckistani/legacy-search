var utils = require('utils');
var casper = require('casper').create({
    clientScripts:  [
        'lib/underscore-min.js'   // DOM on every request
    ],
    pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    },
    logLevel: "info",              // Only "info" level messages will be logged
    verbose: true                  // log messages will be printed out to the console
});

var tpl = 'https://legacyliquorstore.com/beer/all?sort_by=title&sort_order=ASC&page=';
var _u = tpl+'0';

var pp = function(o) { return JSON.stringify(o,null,'  '); };

function parseUrl(path, origin) {
  var out = {};
  var chunks = path.split('?');
  out.path = chunks[0];
  out.query = chunks[1];
  out.argHash = {};
  out.origin = origin;
  var _parsed = _.each(chunks[1].split('&'), function(item) {
    var _tmp = item.split('=');
    var _key = _tmp[0];
    out.argHash[_key] = _tmp[1];
  });
  return out;
}

// creates new url path based on on argHash
function stringifyUrl(parsedUrl) {
    var s = parsedUrl.origin + parsedUrl.path + '?';
    var _tmp = [];
    for (var i in parsedUrl.argHash) {
        _tmp.push([i, parsedUrl.argHash[i]].join('='));
    }
    var _out = s+_tmp.join('&');
    return _out;
}

function getLink() {
    return JSON.stringify({
        path: jQuery('li.pager-last a').attr('href'),
        origin: document.location.origin
    });
}

var limit;

casper.start(_u, function() {
    // this.echo(typeof jQuery);
    var _l = JSON.parse(this.evaluate(getLink));
    // console.log(pp(_l));

    console.log(_l.path, _l.origin);

    // var o = parseUrl(_l.path);

    // var _parsed = parseUrl(_l.path, _l.origin);

    // this.echo(pp(_parsed));

    // this.echo(JSON.stringify(_parsed));
});



// casper.thenOpen('http://phantomjs.org', function() {
//     this.echo(this.getTitle());
// });



casper.run();