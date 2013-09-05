var Decomp     = require('../../lib/eliza/decomp');
var Key        = require('../../lib/eliza/key');
var Responder  = require('../../lib/eliza/responder');
var LinkedList = require('../../lib/eliza/linked_list');

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
    this._client.quit();
  } else {
    this._client.say(this._responder.respondTo(phrase));
  }
};

Eliza.prototype._isQuitMessage = function(input) {
  return (this._script['quit'].indexOf(input) >= 0);
};

Eliza.prototype.isFinished = function() {
  return this._finished;
}

Eliza.prototype._createResponder = function(script) {
  script.keys.sort(function(a, b) { return b.weight - a.weight });

  var keys = [];

  for (i=0; i<script.keys.length; i++) {
    var key     = script.keys[i];
    var decomps = new LinkedList();

    for (var match_string in key.decomp) {
      if (key.decomp.hasOwnProperty(match_string)) {
        var decomp = this._createDecomp(match_string, key.decomp[match_string]);
        decomps.append(decomp);
      }
    }

    keys.push(new Key(key.word, decomps));
  }

  return new Responder(script.pre, script.post, keys, script.defaults);
};

Eliza.prototype._createDecomp = function(match_string, phrases) {
  var synonyms = this._script.synon;
  var regex_string = match_string.replace(/\*/, "(.*)");
  for (var synon in synonyms) {
    if (synonyms.hasOwnProperty(synon)) {
      var match_block = "@" + synon;
      var replacement = "(" + [synon].concat(synonyms[synon]).join("|") + ")";
      regex_string = regex_string.replace(match_block, replacement);
    }
  }
  var regex = new RegExp(regex_string, "i");
  return new Decomp(regex, phrases);
}

module.exports = Eliza;
