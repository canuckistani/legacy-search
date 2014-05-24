#!/usr/bin/env node

var util = require('util'),
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  request = require('request');

var L = console.log,
    D = function(o) { L(util.inspect(o)); },
    F = function(s) { return util.format.apply(null, arguments); },
    K = function(o) { return Object.keys(o); },
    A = function(args) { return [].slice.call(args); };

function fetchMeta(url, callback) {
  request.get(url, function(err, result) {
    // console.log(result);
    if (err) throw err;
    var match = /nid\=([\d]+)/.exec(result.body);
    callback(null, match[1]);
  });
}

function getMapping(beers, callback) {
  var limit = beers.length, i = 0;
  var collected = [];
  var tpl = 'http://www.bcliquorstores.com/product/';
  _.each(beers, function(beer) {
    var _url = tpl + beer.id;
    fetchMeta(_url, function(err, result) {
      i++;
      if (err) throw err;
      // console.log(result);
      collected.push([beer.id, result]);
      if (i === limit) {
        // console.log(JSON.stringify(collected));
        callback(collected);
      }
    });
  });
}



function getBeerStock(mapping, callback) {
  var tpl = 'http://www.bcliquorstores.com/product/inventory?nid=';
  var limit = mapping.length, i = 0;
  _.each(mapping, function(map) {
    var _url = tpl+map[1];
    request.get(_url, function(e, r) {
      i++;
      // if (e) throw e;
      var s = r.body;
      var m = /store\=129[\S\s]+?\<td\>([\d]+)\<\/td\>/.exec(s);
      callback(null, m);
    });
  });
}



function getAllBeers() {
  var tpl = 'http://www.bcliquorstores.com/product-catalogue?type=beer&start=';


  request.get(tpl+'0', function(e, r) {
    if (e) throw e;
    var raw = r.body;

    
  });
}

exports.getBeerStock = getBeerStock;
exports.getMapping = getMapping;
