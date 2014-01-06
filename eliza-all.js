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
var Key = function(word, decomps) {
  this._word    = word;
  this._regex   = new RegExp("\\b"+word+"\\b", "i");
  this._decomps = decomps;
};

Key.prototype.match = function(phrase, responder) {
  if (this._keywordMatch(phrase)) {
    this.blindMatch(phrase, responder);
  }
};

Key.prototype.blindMatch = function(phrase, responder) {
  this._decomps.first.match(phrase, responder);
};

Key.prototype._keywordMatch = function(phrase) {
  return !!this._regex.exec(phrase);
}

module.exports = Key;
function LinkedList() {
  this.length = 0;
  this.first  = null;
  this.last   = null;
};

LinkedList.prototype.prepend = function(node) {
  if (this.first === null) {
    this.first = node;
    this.last  = node;
  } else {
    this.first.previous = node;
    node.next           = this.first;
    this.first          = node;
  }
  this.length++;
};

LinkedList.prototype.append = function(node) {
  if (this.first === null) {
    this.first = node;
    this.last  = node;
  } else {
    this.last.next = node;
    node.previous  = this.last;
    this.last      = node;
  }
  this.length++;
};

module.exports = LinkedList;
var OrderedHash = function() {
  this.keys  = [];
  this._vals = {};
}

OrderedHash.prototype.push = function(k,v) {
  if(!this._vals[k]) {
    this.keys.push(k);
  }
  this._vals[k] = v;
};

OrderedHash.prototype.val = function(k) {
  return this._vals[k];
};

OrderedHash.prototype.size = function() {
  return this.keys.length;
}

module.exports = OrderedHash;
var Responder         = function(pre, keys, defaults) {
  this._pre           = pre;
  this._key_hash      = keys;
  this._defaults      = defaults;
  this._default_count = 0;
  this._stored        = [];
};

Responder.prototype.respondTo = function(phrase, client) {
  var stripped_phrase = phrase.toLowerCase().replace(/[^\w\ ']/g,"");
  this._filtered_phrase = this._pre(stripped_phrase)
  this._matched = false;
  for (var i=0; i<this._key_hash.size(); i++) {
    var key = this._key_hash.val(this._key_hash.keys[i]);
    key.match(this._filtered_phrase, this);
    if (this._matched) {
      client.say(this._response);
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

module.exports = Responder;
var eliza_script = {
  "initial": "How do you do.  Please tell me your problem.",
  "final": "Goodbye.  Thank you for talking to me.",
  "quit": [
    "bye",
    "goodbye",
    "quit"
  ],
  "defaults":[
    "I'm not sure I understand you fully.",
    "Please go on.",
    "What does that suggest to you?",
    "Do you feel strongly about discussing such things?"
  ],
  "pre": {
    "dont":       "don't",
    "cant":       "can't",
    "wont":       "won't",
    "recollect":  "remember",
    "dreamt":     "dreamed",
    "dreams":     "dream",
    "maybe":      "perhaps",
    "how":        "what",
    "when":       "what",
    "certainly":  "yes",
    "machine":    "computer",
    "computers":  "computer",
    "were":       "was",
    "you're":     "you are",
    "i'm":        "i am",
    "same":       "alike"
  },
  "post": {
    "am":        "are",
    "your":      "my",
    "me":        "you",
    "myself":    "yourself",
    "yourself":  "myself",
    "i":         "you",
    "you":       "I",
    "my":        "your",
    "i'm":       "you are"
  },
  "synon": {
    "belief": [
      "feel",
      "think",
      "believe",
      "wish"
    ],
    "family": [
      "mother",
      "mom",
      "father",
      "dad",
      "sister",
      "brother",
      "wife",
      "children",
      "child"
    ],
    "desire": [
      "want",
      "need"
    ],
    "sad": [
      "unhappy",
      "depressed",
      "sick"
    ],
    "happy": [
      "elated",
      "glad",
      "better"
    ],
    "cannot": [
      "can't"
    ],
    "everyone": [
      "everybody",
      "nobody",
      "noone"
    ],
    "be": [
      "am",
      "is",
      "are",
      "was"
    ]
  },
  "keys": [
    {
      "word": "sorry",
      "weight": 1,
      "decomp": {
        "*": [
          "Please don't apologise.",
          "Apologies are not necessary.",
          "I've told you that apologies are not required."
        ]
      }
    },
    {
      "word": "apologise",
      "weight": 1,
      "decomp": {
        "*": [
          "goto sorry"
        ]
      }
    },
    {
      "word": "remember",
      "weight": "5",
      "decomp": {
        "* i remember *": [
          "Do you often think of (2)?",
          "Does thinking of (2) bring anything else to mind?",
          "What else do you recollect?",
          "Why do you recollect (2) just now?",
          "What in the present situation reminds you of (2)?",
          "What is the connection between me and (2)?"
        ],
        "* do you remember *": [
          "Did you think I would forget (2)?",
          "Why do you think I should recall (2) now?",
          "What about (2)?",
          "goto what",
          "You mentioned (2)?"
        ]
      }
    },
    {
      "word": "if",
      "weight": "3",
      "decomp": {
        "* if *": [
          "Do you think its likely that (2)?",
          "Do you wish that (2)?",
          "What do you know about (2)?",
          "Really, if (2)?"
        ]
      }
    },
    {
      "word": "dreamed",
      "weight": "4",
      "decomp": {
        "* i dreamed *": [
          "Really, (2)?",
          "Have you ever fantasized (2) while you were awake?",
          "Have you ever dreamed (2) before?",
          "goto dream"
        ]
      }
    },
    {
      "word": "dream",
      "weight": "3",
      "decomp": {
        "*": [
          "What does that dream suggest to you?",
          "Do you dream often?",
          "What persons appear in your dreams?",
          "Do you believe that dreams have something to do with your problems?"
        ]
      }
    },
    {
      "word": "perhaps",
      "weight": 1,
      "decomp": {
        "*": [
          "You don't seem quite certain.",
          "Why the uncertain tone?",
          "Can't you be more positive?",
          "You aren't sure?",
          "Don't you know?"
        ]
      }
    },
    {
      "word": "name",
      "weight": "15",
      "decomp": {
        "*": [
          "I am not interested in names.",
          "I've told you before, I don't care about names -- please continue."
        ]
      }
    },
    {
      "word": "deutsch",
      "weight": 1,
      "decomp": {
        "*": [
          "goto xforeign",
          "I told you before, I don't understand German."
        ]
      }
    },
    {
      "word": "francais",
      "weight": 1,
      "decomp": {
        "*": [
          "goto xforeign",
          "I told you before, I don't understand French."
        ]
      }
    },
    {
      "word": "italiano",
      "weight": 1,
      "decomp": {
        "*": [
          "goto xforeign",
          "I told you before, I don't understand Italian."
        ]
      }
    },
    {
      "word": "espanol",
      "weight": 1,
      "decomp": {
        "*": [
          "goto xforeign",
          "I told you before, I don't understand Spanish."
        ]
      }
    },
    {
      "word": "xforeign",
      "weight": 1,
      "decomp": {
        "*": [
          "I speak only English."
        ]
      }
    },
    {
      "word": "hello",
      "weight": 1,
      "decomp": {
        "*": [
          "How do you do.  Please state your problem.",
          "Hi.  What seems to be your problem?"
        ]
      }
    },
    {
      "word": "computer",
      "weight": "50",
      "decomp": {
        "*": [
          "Do computers worry you?",
          "Why do you mention computers?",
          "What do you think machines have to do with your problem?",
          "Don't you think computers can help people?",
          "What about machines worrys you?",
          "What do you think about machines?"
        ]
      }
    },
    {
      "word": "am",
      "weight": 0.5,
      "decomp": {
        "* am i *": [
          "Do you believe you are (2)?",
          "Would you want to be (2)?",
          "Do you wish I would tell you you are (2)?",
          "What would it mean if you were (2)?",
          "goto what"
        ],
        "*": [
          "Why do you say 'am'?",
          "I don't understand that."
        ]
      }
    },
    {
      "word": "are",
      "weight": 1,
      "decomp": {
        "* are you *": [
          "Why are you interested in whether I am (2) or not?",
          "Would you prefer if I weren't (2)?",
          "Perhaps I am (2) in your fantasies.",
          "Do you sometimes think I am (2)?",
          "goto what"
        ],
        "* are *": [
          "Did you think they might not be (2)?",
          "Would you like it if they were not (2)?",
          "What if they were not (2)?",
          "Possibly they are (2)."
        ]
      }
    },
    {
      "word": "your",
      "weight": 1,
      "decomp": {
        "* your *": [
          "Why are you concerned over my (2)?",
          "What about your own (2)?",
          "Are you worried about someone else's (2)?",
          "Really, my (2)?"
        ]
      }
    },
    {
      "word": "was",
      "weight": "2",
      "decomp": {
        "* was i *": [
          "What if you were (2)?",
          "Do you think you were (2)?",
          "Were you (2)?",
          "What would it mean if you were (2)?",
          "What does (2) suggest to you?",
          "goto what"
        ],
        "* i was *": [
          "Were you really?",
          "Why do you tell me you were (2) now?",
          "Perhaps I already know you were (2)."
        ],
        "* was you *": [
          "Would you like to believe I was (2)?",
          "What suggests that I was (2)?",
          "What do you think?",
          "Perhaps I was (2).",
          "What if I had been (2)?"
        ]
      }
    },
    {
      "word": "i",
      "weight": 1,
      "decomp": {
        "* i @desire *": [
          "What would it mean to you if you got (3)?",
          "Why do you want (3)?",
          "Suppose you got (3) soon?",
          "What if you never got (3)?",
          "What would getting (3) mean to you?",
          "What does wanting (3) have to do with this discussion?"
        ],
        "* i am * @sad *": [
          "I am sorry to hear that you are (3).",
          "Do you think that coming here will help you not to be (3)?",
          "I'm sure it's not pleasant to be (3).",
          "Can you explain what made you (3)?"
        ],
        "* i am * @happy *": [
          "How have I helped you to be (3)?",
          "Has your treatment made you (3)?",
          "What makes you (3) just now?",
          "Can you explan why you are suddenly (3)?"
        ],
        "* i was *": [
          "goto was"
        ],
        "* i @belief * i *": [
          "Do you really think so?",
          "But you are not sure you (3).",
          "Do you really doubt you (3)?"
        ],
        "* i * @belief * you *": [
          "goto you"
        ],
        "* i am *": [
          "Is it because you are (2) that you came to me?",
          "How long have you been (2)?",
          "Do you believe it is normal to be (2)?",
          "Do you enjoy being (2)?"
        ],
        "* i @cannot *": [
          "How do you think that you can't (3)?",
          "Have you tried?",
          "Perhaps you could (3) now.",
          "Do you really want to be able to (3)?"
        ],
        "* i don't *": [
          "Don't you really (2)?",
          "Why don't you (2)?",
          "Do you wish to be able to (2)?",
          "Does that trouble you?"
        ],
        "* do i feel *": [
          "Tell me more about such feelings.",
          "Do you often feel (2)?",
          "Do you enjoy feeling (2)?",
          "Of what does feeling (2) remind you?"
        ],
        "* i * you *": [
          "Perhaps in your fantasies we (2) each other.",
          "Do you wish to (2) me?",
          "You seem to need to (2) me.",
          "Do you (2) anyone else?"
        ],
        "*": [
          "You say (1)?",
          "Can you elaborate on that?",
          "Do you say (1) for some special reason?",
          "That's quite interesting."
        ]
      }
    },
    {
      "word": "you",
      "weight": 1,
      "decomp": {
        "* you remind me of *": [
          "goto alike"
        ],
        "* you are *": [
          "What makes you think I am (2)?",
          "Does it please you to believe I am (2)?",
          "Do you sometimes wish you were (2)?",
          "Perhaps you would like to be (2)."
        ],
        "* you * me *": [
          "Why do you think I (2) you?",
          "You like to think I (2) you -- don't you?",
          "What makes you think I (2) you?",
          "Really, I (2) you?",
          "Do you wish to believe I (2) you?",
          "Suppose I did (2) you -- what would that mean?",
          "Does someone else believe I (2) you?"
        ],
        "* you *": [
          "We were discussing you -- not me.",
          "Oh, I (2)?",
          "You're not really talking about me -- are you?",
          "What are your feelings now?"
        ]
      }
    },
    {
      "word": "yes",
      "weight": 1,
      "decomp": {
        "*": [
          "You seem to be quite positive.",
          "You are sure.",
          "I see.",
          "I understand."
        ]
      }
    },
    {
      "word": "no",
      "weight": 1,
      "decomp": {
        "*": [
          "Are you saying no just to be negative?",
          "You are being a bit negative.",
          "Why not?",
          "Why 'no'?"
        ]
      }
    },
    {
      "word": "my",
      "weight": "2",
      "decomp": {
        "$ * my *": [
          "Lets discuss further why your (2).",
          "Earlier you said your (2).",
          "But your (2).",
          "Does that have anything to do with the fact that your (2)?"
        ],
        "* my * @family *": [
          "Tell me more about your family.",
          "Who else in your family (4)?",
          "Your (3)?",
          "What else comes to mind when you think of your (3)?"
        ],
        "* my *": [
          "Your (2)?",
          "Why do you say your (2)?",
          "Does that suggest anything else which belongs to you?",
          "Is it important that your (2)?"
        ]
      }
    },
    {
      "word": "can",
      "weight": 1,
      "decomp": {
        "* can you *": [
          "You believe I can (2) don't you?",
          "goto what",
          "You want me to be able to (2).",
          "Perhaps you would like to be able to (2) yourself."
        ],
        "* can i *": [
          "Whether or not you can (2) depends on you more than me.",
          "Do you want to be able to (2)?",
          "Perhaps you don't want to (2).",
          "goto what"
        ]
      }
    },
    {
      "word": "what",
      "weight": 1,
      "decomp": {
        "*": [
          "Why do you ask?",
          "Does that question interest you?",
          "What is it you really wanted to know?",
          "Are such questions much on your mind?",
          "What answer would please you most?",
          "What do you think?",
          "What comes to mind when you ask that?",
          "Have you asked such questions before?",
          "Have you asked anyone else?"
        ]
      }
    },
    {
      "word": "because",
      "weight": 1,
      "decomp": {
        "*": [
          "Is that the real reason?",
          "Don't any other reasons come to mind?",
          "Does that reason seem to explain anything else?",
          "What other reasons might there be?"
        ]
      }
    },
    {
      "word": "why",
      "weight": 1,
      "decomp": {
        "* why don't you *": [
          "Do you believe I don't (2)?",
          "Perhaps I will (2) in good time.",
          "Should you (2) yourself?",
          "You want me to (2)?",
          "goto what"
        ],
        "* why can't i *": [
          "Do you think you should be able to (2)?",
          "Do you want to be able to (2)?",
          "Do you believe this will help you to (2)?",
          "Have you any idea why you can't (2)?",
          "goto what"
        ],
        "*": [
          "goto what"
        ]
      }
    },
    {
      "word": "everyone",
      "weight": "2",
      "decomp": {
        "* @everyone *": [
          "Realy, (2)?",
          "Surely not (2).",
          "Can you think of anyone in particular?",
          "Who, for example?",
          "Are you thinking of a very special person?",
          "Who, may I ask?",
          "Someone special perhaps?",
          "You have a particular person in mind, don't you?",
          "Who do you think you're talking about?"
        ]
      }
    },
    {
      "word": "everybody",
      "weight": "2",
      "decomp": {
        "*": [
          "goto everyone"
        ]
      }
    },
    {
      "word": "nobody",
      "weight": "2",
      "decomp": {
        "*": [
          "goto everyone"
        ]
      }
    },
    {
      "word": "noone",
      "weight": "2",
      "decomp": {
        "*": [
          "goto everyone"
        ]
      }
    },
    {
      "word": "always",
      "weight": "1",
      "decomp": {
        "*": [
          "Can you think of a specific example?",
          "When?",
          "What incident are you thinking of?",
          "Really, always?"
        ]
      }
    },
    {
      "word": "alike",
      "weight": "10",
      "decomp": {
        "*": [
          "In what way?",
          "What resemblence do you see?",
          "What does that similarity suggest to you?",
          "What other connections do you see?",
          "What do you suppose that resemblance means?",
          "What is the connection, do you suppose?",
          "Could here really be some connection?",
          "How?"
        ]
      }
    },
    {
      "word": "like",
      "weight": "10",
      "decomp": {
        "* @be * like *": [
          "goto alike"
        ]
      }
    }
  ]
}

module.exports = script;
