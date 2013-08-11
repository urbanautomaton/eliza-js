var Eliza = require('../../lib/eliza/eliza');

describe("Eliza", function() { with(this) {
  var script = {
    "initial":  "hello there",
    "final":    "Fine, go.",
    "quit":     ["quit"],
    "pre":      { "dont": "don't" },
    "post":     { "your": "my" },
    "synon":    { "desire": ["want", "need"] },
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
      {
        "word": "name",
        "weight": 2,
        "decomp": { "*": [ "I don't like names" ] }
      }
    ]
  };

  beforeEach(function() {
    this.eliza = new Eliza(script);
  })

  describe("start()", function() { with(this) {
    it("replies with the initial greeting", function() { with(this) {
      expect(eliza.start()).toEqual("hello there");
    }})
  }})

  describe("say()", function() { with(this) {
  }})

}})
