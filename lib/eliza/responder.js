var Responder         = function(pre, keys, defaults) {
  this._pre           = pre;
  this._key_hash      = keys;
  this._defaults      = defaults;
  this._default_count = 0;
  this._stored        = [];
};

Responder.prototype.respondTo = function(phrase, client) {
  var stripped_phrase = phrase.toLowerCase().replace(/[^\w\ ']/g,"");
  this._filtered_phrase = this._pre(stripped_phrase)
  this._matched = false;
  for (var i=0; i<this._key_hash.size(); i++) {
    var key = this._key_hash.val(this._key_hash.keys[i]);
    key.match(this._filtered_phrase, this);
    if (this._matched) {
      client.say(this._response);
      return;
    }
  }
  client.say(this._defaultResponse());
};

Responder.prototype.respondWith = function(response) {
  this._matched = true;
  this._response = response;
};

Responder.prototype.storeResponse = function(response) {
  this._stored.push(response);
};

Responder.prototype.gotoKey = function(word) {
  this._key_hash.val(word).blindMatch(this._filtered_phrase, this);
}

Responder.prototype._defaultResponse = function() {
  if (this._stored.length > 0) {
    return this._stored.shift();
  } else {
    return this._defaults[this._default_count++ % this._defaults.length];
  }
};

module.exports = Responder;
