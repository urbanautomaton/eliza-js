var Decomp    = require('../../lib/eliza/decomp');
var Key       = require('../../lib/eliza/key');
var Responder = require('../../lib/eliza/responder');

var Eliza = function(client, script) {
  this._client    = client;
  this._script    = script;
  this._finished  = false;
  this._responder = this._createResponder(script);
  this._client.say(this._script['initial']);
};

Eliza.prototype.say = function(phrase) {
  if (this._isQuitMessage(phrase)) {
    this._finished = true;
    this._client.say(this._script['final']);
  } else {
    this._client.say(this._responder.respondTo(phrase));
  }
};

Eliza.prototype.isFinished = function() {
  return this._finished;
};

Eliza.prototype._createResponder = function(script) {
  script.keys.sort(function(a, b) { return b.weight - a.weight });

  var keys = [];

  for (i=0; i<script.keys.length; i++) {
    var key     = script.keys[i];
    var decomps = [];

    for(var match_string in key.decomp) {
      if(key.decomp.hasOwnProperty(match_string)) {
        var regex = new RegExp(match_string.replace(/\*/, "(.*)"));
        var phrases = key.decomp[match_string];
        decomps.push(new Decomp(regex, phrases));
      }
    }

    keys.push(new Key(key.word, decomps));
  }

  return new Responder(script.pre, script.post, keys);
};

Eliza.prototype._pipe = function(terms, funs) {
  var output = terms;
  for (var i=0; i<funs.length; i++) {
    output = funs[i].call(this, output);
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
