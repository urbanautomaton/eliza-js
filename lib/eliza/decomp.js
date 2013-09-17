var Decomp = function(regex, phrases, post) {
  this._phrases      = phrases;
  this._phrase_count = phrases.length;
  this._count        = 0;
  this._regex        = regex;
  this._post         = post;
};

Decomp.prototype._nextPhrase = function(captures) {
  var phrase = this._phrases[this._count % this._phrase_count];
  this._count += 1;
  for (var i=0; i < captures.length; i++) {
    sub_regex = new RegExp("\\(" + (i+1) + "\\)");
    replacement = this._post(captures[i]).replace(/^\s+|\s+$/g, "");
    phrase = phrase.replace(sub_regex, replacement);
  }
  return phrase;
};

Decomp.prototype.match = function(phrase, responder) {
  var m = this._regex.exec(phrase);
  if (m) {
    m.shift(1);
    this._respond(this._nextPhrase(m), responder);
  } else {
    if (this.next) {
      this.next.match(phrase, responder);
    }
  }
};

Decomp.prototype._respond = function(phrase, responder) {
  var tokens = phrase.split(/\s+/);
  if (this._isGotoPhrase(tokens)) {
    responder.gotoKey(tokens[1]);
  } else {
    responder.respondWith(phrase);
  }
};

Decomp.prototype._isGotoPhrase = function(tokens) {
  return (tokens[0] === "goto" && tokens.length === 2);
};

var StoredDecomp = function(regex, phrases, post) {
  Decomp.call(this, regex, phrases, post);
}
StoredDecomp.prototype = Object.create(Decomp.prototype);
StoredDecomp.prototype.constructor = StoredDecomp;

StoredDecomp.prototype._respond = function(phrase, responder) {
  responder.storeResponse(phrase);
};

module.exports = {
  Decomp:        Decomp,
  StoredDecomp:  StoredDecomp
};
