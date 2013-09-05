var Key = function(word, decomps) {
  this._word    = word;
  this._regex   = new RegExp("\\b"+word+"\\b", "i");
  this._decomps = decomps;
};

Key.prototype.match = function(phrase, responder) {
  if (this._keywordMatch(phrase)) {
    this._decomps.first.match(phrase, responder);
  }
};

Key.prototype.blindMatch = function(phrase, responder) {
  this._decomps.first.match(phrase, responder);
};

Key.prototype._keywordMatch = function(phrase) {
  return !!this._regex.exec(phrase);
}

module.exports = Key;
