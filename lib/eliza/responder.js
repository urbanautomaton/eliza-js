var Responder = function(pre, post, keys, defaults) {
  this._pre = pre;
  this._post = post;
  this._keys = keys;
  this._defaults = defaults;
  this._default_count = 0;
};

Responder.prototype.respondTo = function(phrase) {
  var filtered_phrase = this._preSub(phrase);
  this._matched = false;
  for (var i=0; i<this._keys.length; i++) {
    var key = this._keys[i];
    key.match(filtered_phrase, this);
    if (this._matched) {
      return this._postSub(this._response);
    }
  }
  return this._defaultResponse();
};

Responder.prototype.respondWith = function(response) {
  this._matched = true;
  this._response = response;
};

Responder.prototype._defaultResponse = function() {
  return this._defaults[this._default_count++ % this._defaults.length];
};

Responder.prototype._preSub = function(phrase) {
  return this._substitute(phrase, this._pre);
};

Responder.prototype._postSub = function(phrase) {
  return this._substitute(phrase, this._post);
};

Responder.prototype._substitute = function(phrase, subs) {
  var output = [];
  var terms  = phrase.split(/\s+/);
  for (var i=0; i<terms.length; i++) {
    output.push(subs[terms[i].toLowerCase()] || terms[i]);
  }
  return output.join(" ");
};

module.exports = Responder;
