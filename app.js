function fetchData(callback) {
  $.getJSON('./mock/beers.json', function(json) {
    initTable(json);
  });
}

function getAllItems(callback) {
  var _i = 0, collected = [];
  localforage.length().then(function(length) {
    _.each(_.range(length), function(item, i) {
      localforage.key(i).then(function(key) {
        localforage.getItem(key).then(function(data) {
          _i++;
          collected.push(data);
          if (_i === length) {
            callback(collected);
          }
        });
      });
    });
  });
}

function initStorage(cb) {
  getAllItems(function(results) {
    _.each(results, function(item, index) {
      displayItem(item._id, item);
    });
    cb(results);
  });
}

var beersHashMap = {};

function initTable(json) {
  var data = _.map(json, function(a) {
      var _id = a[0].toLowerCase().replace(/\ /g, '-');
      a.push(_id);
      beersHashMap[_id] = {
        name: a[0],
        origin: a[1],
        price: a[2],
        quantity: a[3],
        link: a[4],
      };
      return a;
  });
  
  $('#beer-table').dataTable({
    "iDisplayLength": 60,
    "aaData": data,
    "aoColumns": [
      { "sTitle": "Name", "sWidth": "47%" },
      { "sTitle": "Origin" },
      { "sTitle": "Price" },
      { "sTitle": "Stock" },
      {
        "sTitle": "Link",
        "fnRender": function(o) {
            return '<a class="page-link" href="'+o.aData[4]+'" target="_blank">Link</a>';
        }
      },
      {
        "sTitle": "Add",
        "fnRender": function(o) {
            return '<a href="#" class="add-link" id="'+o.aData[5]+'" target="_blank">Add</a>';
        }
      }
    ]
  });
}

function displayItem(id, selected) {
  if (!selected.order_quantity) {
    selected.order_quantity = 1;
  }
  $('ul#sel-beer-list').append('<li id="'+id+'">'+
    '<a href="#">[X]</a> (<span class="item-quantity">'+selected.order_quantity+'</span>) '+
    [selected.name, selected.price, selected.link].join(' ')+
    '</li>');
}

function incrementItem(id) {
  localforage.getItem(id, function(item) {
    item.order_quantity++;
    localforage.setItem(id, item, function() {
      $('li#'+id+' span.item-quantity').html(item.order_quantity);
    });
  });
}

function exportOrder() {
  var output = '';
  getAllItems(function(order) {
    _.each(order, function(beer) {
      output += beer.order_quantity + 'x "' + beer.name + '" ( '+ beer.link +' ) '+ "\n";
    });
    console.log(output);
  });
}

// event bindings
$('#beer-table').click(function(ev) {
  if (_.contains(ev.target.classList, 'add-link')) {
    ev.preventDefault();
    var selected = beersHashMap[ev.target.id];
    selected._id = ev.target.id;

    localforage.getItem(ev.target.id, function(item) {
      if (!item) {
        selected.order_quantity = 1;
        localforage.setItem(ev.target.id, selected, function() {
          console.log([].slice.call(arguments));
          console.log('item '+ ev.target.id+' stored!');
          // display the item
          displayItem(ev.target.id, selected);
        });
      }
      else {
        incrementItem(ev.target.id);
      }
    });
  }
});

$('#clear-selected').click(function() {
  localforage.clear(function() {
    $('ul#sel-beer-list').html('');
  });
});

$('ul#sel-beer-list').click(function(ev) {
  ev.preventDefault();
  console.log(ev.target.parentElement.id);
  localforage.removeItem(ev.target.parentElement.id, function() {
    $(ev.target).parent().remove();
  });
});

// Initialization
$(function() {
  initStorage(function(data) {
    console.log('storage initialized...');
    console.log(data);
  });
  fetchData(initTable);
});
