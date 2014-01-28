function fetchData(callback) {
    $.getJSON('/mock/beers.json', function(json) {
        initTable(json);
    });
}

// --

// Model for selected beers, using localStorage

// --

var beersHashMap = {};
var beerOrder = new EventEmitter();

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

// event bindings
$('#beer-table').click(function(ev) {
    if (_.contains(ev.target.classList, 'add-link')) {
        ev.preventDefault();
        // console.log('got add-link, id is: '+ev.target.id);
        var selected = beersHashMap[ev.target.id];
        $('ul#sel-beer-list').append('<li id="'+ev.target.id+'">'+
          '<a href="#">[X]</a> '+
          [selected.name, selected.price, selected.link].join(' ')+
          '</li>');
        selected['_id'] = ev.target.id;
        beerOrder.put(selected);
    }
});

$('#clear-selected').click(function() {
  $('ul#sel-beer-list').html('');
});

$('ul#sel-beer-list').click(function(ev) {
  ev.preventDefault();
  $(ev.target).parent().remove();

});

$(function() {
  // beerOrder = new PouchDB('beerOrder');
  fetchData(initTable);
});
