var Responder         = function(pre, post, keys, defaults) {
  this._pre           = pre;
  this._post          = post;
  this._key_hash      = keys;
  this._defaults      = defaults;
  this._default_count = 0;
  this._stored        = [];
};

Responder.prototype.respondTo = function(phrase, client) {
  var stripped_phrase = phrase.toLowerCase().replace(/[^\w\ ']/,"");
  this._filtered_phrase = this._preSub(stripped_phrase)
  this._matched = false;
  for (var i=0; i<this._key_hash.size(); i++) {
    var key = this._key_hash.val(this._key_hash.keys[i]);
    key.match(this._filtered_phrase, this);
    if (this._matched) {
      client.say(this._postSub(this._response));
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
