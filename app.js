var page = require('webpage').create();

var rootUrl = 'https://legacyliquorstore.com/beer/all';

phantom.injectJs('./lib/async.js');
phantom.injectJs('./lib/underscore-min.js');

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

function pageFetch(url, i) {
  page.open(url, function (status) {
    page.evaluate(function() {
      var ret = [];
      jQuery('.beer > h2 > a').each(function() {
        ret.push({
          stage: 'fetch',
          data: [this.textContent, this.href]
        });
      });
      console.log(JSON.stringify(ret));
    });
  });
}

function handleMessage (raw) {
  var msg = JSON.parse(raw);
  console.log(pp(msg));
  var collected = [];
  var limit = false, count = 0;
  if (msg.stage === 'init') {
    //
    var parsed = parseUrl(msg.href, msg.origin);
    limit = parsed.argHash.page;

    var urls = _.map(_.range(parsed.argHash.page), function(i) {
      var _tmp = parsed;
      _tmp.argHash.page = i;

      var _s = stringifyUrl(_tmp);
      return _s;
    });


    var c = 0;
    urls.forEach(function(url) {
      c++;
      pageFetch(url, c);
    });
    
  }
  else if (msg.stage === 'fetch') {
    console.log('in fetch');
    // count++;
    // if (count === limit) {
    //   phantom.exit();
    // }
  }
}

page.onConsoleMessage = function (msg) {
    // handleMessage(msg);
    console.log(msg);
};

page.open(rootUrl, function (status) {
    var collected = [];
    var urlSpec = page.evaluate(function () {
      return {
        href: jQuery('li.pager-last a').attr('href'),
        origin: document.location.origin
      };
    });
    
    var parsed = parseUrl(urlSpec.href, urlSpec.origin);
    _.each(_.range(parsed.argHash.page), function(i) {
      var _tmp = parsed;
      _tmp.argHash.page = i;
      var _s = stringifyUrl(_tmp);
      // console.log(_s);
      var pageBeers;
    });



    console.log(JSON.stringify(collected));
    phantom.exit();
});
