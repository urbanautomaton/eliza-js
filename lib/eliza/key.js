var Key = function(word, decomps) {
  this._word    = word;
  this._decomps = decomps;
};

Key.prototype.match = function(phrase, responder) {
  for (var i=0; i<this._decomps.length; i++) {
    if (this._decomps[i].match(phrase, responder)) {
      return;
    }
  }
};

module.exports = Key;
