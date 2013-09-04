var Parser = require('../../lib/eliza/parser');

describe("Parser", function() { with(this) {
  var script = {
    "initial":  "hello there",
    "final":    "Fine, go.",
    "quit":     ["quit"],
    "pre":      { "dont": "don't" },
    "post":     { "your": "my" },
    "synon":    { "sad": ["sad", "unhappy", "depressed", "sick"] },
    "keys":     [
      {
        "word": "xnone",
        "weight": 1,
        "decomp": { "*": [ "Please go on" ] }
      },
      {
        "word": "sorry",
        "weight": 1,
        "decomp": { "*": [ "Don't apologise" ] }
      },
    ]
  };

  beforeEach(function() {
    this.parser = new Parser();
  })

  describe("parse()", function() { with(this) {
    describe("

  }})

}})
