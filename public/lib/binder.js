/**  
 * Binder is a tiny piece of middleware that allows you to write to a pouchdb database
 * and have custom event listeners for changes
 * Dependencies: 
   - EventEmitter.js from creationix:
    https://raw2.github.com/creationix/eventemitter-browser/master/EventEmitter.js
   - utils.inherit implementation from here:
    http://stackoverflow.com/questions/13201775/looking-for-a-javascript-implementation-of-nodes-util-inherits

  Both are available here as a gist: 
 */
var Binder = function(opts) {
  this.pouch = new PouchDB(opts.dbname);

  // alias
  this._upsert = function(id, data, callback) {
    data._id = id;
    this.pouch.put(data, callback);
  };
};

Binder.prototype = {
  add: function(data) {
    this.pouch.post(data, function(err, response) {
      if (err) throw err;
      this.emit('add', response);
    });
  },
  update: function(id, data) {
    this._upsert(id, data, function(err, response) {
      if (err) throw err;
      this.emit('update', response);
    });
  },
  remove: function(id) {
    var self = this;
    self.pouch.get({_id: id}, function(err, response) {
      self.pouch.remove(response);
      self.emit('remove', id);
    });
  },
  clear: function(callback) {
    var self = this;
    self.allDocs(function(e, r) {
      if (e) throw e;
      var docs = r.rows, length = docs.length, i = 0, errors = [];

      docs.forEach(function(doc) {
        self.pouch.remove(doc, function(err, resp) {

        });
        if (i <= length) {
          this.emit('clear');
        }
      });
    });
  },
  get: function(id, callback) {
    this.pouch.get(id, callback);
  },
  getAll: function(callback) {
    this.pouch.allDocs(callback);
  }
};

inherits(Binder, EventEmitter);

var b = new Binder({
  dbname: 'test'
});

