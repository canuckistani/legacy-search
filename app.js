function fetchData(callback) {
    $.getJSON('/mock/beers.json', function(json) {
        initTable(json);
    }
}

function initTable(json) {
      var data = _.map(json, function(a) {
        console.log(a);
        a.push(a[0].toLowerCase().replace(/\ /g, '-'));
        return a;
      });
    
      $('#beer-table').dataTable({
        "iDisplayLength": 60,
        "aaData": data,
        "aoColumns": [
          { "sTitle": "Name", "sWidth": "60%" },
          { "sTitle": "Stock" },
          { 
            "sTitle": "Link",
            "fnRender": function(o) {
              return '<a class="" href="'+o+'" target="_blank">Link</a>';
            }
          },
          {
            "sTitle": "Add",
            "fnRender": function(o) {
              return '<a href="#" class="add-link" id="'+o+'" target="_blank">Add</a>';
            }
          }
        ]
      });
      
    }); 
}


$(function() {
    fetchData(initTable);
});

$('#beer-table').click(function(ev) {
    ev.preventDefault();
    console.log(ev.target.classList[0]);
});