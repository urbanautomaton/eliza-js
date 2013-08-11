var Responder = require('../../lib/eliza/responder');

var Eliza = function(script) {
  this._script    = script;
  this._finished  = false;
  this._responder = new Responder(script);
};

Eliza.prototype._pipe = function(terms, funs) {
  var output = terms;
  for (var i=0; i<funs.length; i++) {
    output = funs[i].call(this, output);
  }
  return output;
}

Eliza.prototype._preSub = function(terms) {
  return this._substitute(terms, 'pre');
};

Eliza.prototype._postSub = function(terms) {
  return this._substitute(terms, 'post');
};

Eliza.prototype._substitute = function(terms, sub) {
  output = [];
  for (var i=0; i<terms.length; i++) {
    output.push(this._script[sub][terms[i].toLowerCase()] || terms[i]);
  }
  return output;
};

Eliza.prototype._isQuitMessage = function(input) {
  return (this._script['quit'].indexOf(input) >= 0);
};

Eliza.prototype._responseFor = function(input) {
  var in_terms = input.split(" ");
  var out_terms = this._pipe(in_terms, [this.preSub, this.postSub]);
  return out_terms.join(" ");
};

Eliza.prototype.start = function() {
  return this._script['initial'];
};

Eliza.prototype.respondTo = function(input) {
  if (this._isQuitMessage(input)) {
    return this.quit();
  } else {
    return this._responseFor(input);
  }
};

Eliza.prototype.quit = function() {
  this._finished = true;
  return this._script['final'];
};

module.exports = Eliza;
