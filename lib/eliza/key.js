var Key = function(word, decomps) {
  this._word    = word;
  this._regex   = new RegExp("\\b"+word+"\\b", "i");
  this._decomps = decomps;
};

Key.prototype.match = function(phrase, responder) {
  if (this._keywordMatch(phrase)) {
    for (var i=0; i<this._decomps.length; i++) {
      if (this._decomps[i].match(phrase, responder)) {
        return;
      }
    }
  }
};

Key.prototype._keywordMatch = function(phrase) {
  if (this._regex.exec(phrase)) {
    return true;
  } else {
    return false;
  }
}

module.exports = Key;
