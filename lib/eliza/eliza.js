var decomps      = require('./decomp');
var Decomp       = decomps.Decomp;
var StoredDecomp = decomps.StoredDecomp;
var Key          = require('./key');
var Responder    = require('./responder');
var LinkedList   = require('./linked_list');
var OrderedHash  = require('./ordered_hash');

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
    this._responder.respondTo(phrase, this._client);
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

  var keys = new OrderedHash();

  for (i=0; i<script.keys.length; i++) {
    var key     = script.keys[i];
    var decomps = new LinkedList();

    for (var match_string in key.decomp) {
      if (key.decomp.hasOwnProperty(match_string)) {
        var decomp = this._createDecomp(match_string,
                                        key.decomp[match_string],
                                       this._postFilter(script));
        decomps.append(decomp);
      }
    }

    keys.push(key.word, new Key(key.word, decomps));
  }

  return new Responder(this._preFilter(script), keys, script.defaults);
};

Eliza.prototype._preFilter = function(script) {
  return function(phrase) {
    var tokens = phrase.split(/\s+/);
    for (var i=0; i<tokens.length; i++) {
      var replacement = script.pre[tokens[i]];
      if (typeof(replacement) !== "undefined") {
        tokens[i] = replacement;
      }
    }
    return tokens.join(" ");
  }
};

Eliza.prototype._postFilter = function(script) {
  return function(phrase) {
    var tokens = phrase.split(/\s+/);
    for (var i=0; i<tokens.length; i++) {
      var replacement = script.post[tokens[i]];
      if (typeof(replacement) !== "undefined") {
        tokens[i] = replacement;
      }
    }
    return tokens.join(" ");
  }
};

Eliza.prototype._createDecomp = function(match_string, phrases, post) {
  var synonyms = this._script.synon;
  var regex_string = match_string.replace(/\s*\*\s*/g, "(^(?:\\S+\\s+)*|(?:\\s+\\S+)*$|\\s+(?:\\S+\\s+)*|^(?:\\S+\\s+)*\\S+$)");
  for (var synon in synonyms) {
    if (synonyms.hasOwnProperty(synon)) {
      var match_block = "@" + synon;
      var replacement = "(" + [synon].concat(synonyms[synon]).join("|") + ")";
      replace_regex = new RegExp(match_block, "g");
      regex_string = regex_string.replace(replace_regex, replacement);
    }
  }
  // Detect stored decomps
  match = /^\$(.*)/.exec(regex_string);
  if (match) {
    var regex = new RegExp("^"+match[1]+"$", "i");
    return new StoredDecomp(regex, phrases, post);
  } else {
    var regex = new RegExp("^"+regex_string+"$", "i");
    return new Decomp(regex, phrases, post);
  }
}

module.exports = Eliza;
