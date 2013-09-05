var Decomp = function(regex, phrases) {
  this._phrases      = phrases;
  this._phrase_count = phrases.length;
  this._count        = 0;
  this._regex        = regex;
};

Decomp.prototype._nextPhrase = function(captures) {
  var phrase = this._phrases[this._count % this._phrase_count];
  this._count += 1;
  for (var i=0; i < captures.length; i++) {
    sub_regex = new RegExp("\\(" + (i+1) + "\\)");
    phrase = phrase.replace(sub_regex, captures[i]);
  }
  return phrase;
};

Decomp.prototype.setNext = function(next_decomp) {
  this._next = next_decomp;
}

Decomp.prototype.match = function(phrase, responder) {
  var m = this._regex.exec(phrase);
  if (m) {
    m.shift(1);
    responder.respondWith(this._nextPhrase(m));
  } else {
    if (this._next) {
      this._next.match(phrase, responder);
    }
  }
};

module.exports = Decomp;
