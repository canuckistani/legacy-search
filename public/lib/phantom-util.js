var _phantom_port = {
  emit: function(type, payload) {
    if (typeof window.callPhantom === 'function') {
      window.callPhantom({
        type: type,
        payload: payload
      });
    }
  },
  on: function(type, callback) {
  }
};


function __emit (type, payload) {
  if (typeof window.callPhantom === 'function') {
    window.callPhantom({
      type: type,
      payload: payload
    });
  }
}

