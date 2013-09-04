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
        "word": "sorry",
        "weight": 1,
        "decomp": { "*": [ "Don't apologise" ] }
      },
      {
        "word": "like",
        "weight": 2,
        "decomp": { "I don't like *": [
          "Why do you not like (1)?",
          "You are so negative about (1)"
        ]
        }
      },
      {
        "word": "name",
        "weight": 2,
        "decomp": { "*": [ "I don't like names" ] }
      }
    ],
    "defaults": [ "Please go on" ]
  };

  beforeEach(function() {
    this.client = {
      say: function(phrase) { }
    };
    spyOn(this.client, 'say');

    this.eliza = new Eliza(this.client, script);
  })

  describe("start()", function() { with(this) {
    it("replies with the initial greeting", function() { with(this) {
      expect(client.say).toHaveBeenCalledWith("hello there");
    }})
  }})

  describe("say()", function() { with(this) {
    it("matches keywords", function() { with(this) {
      eliza.say("I'm sorry but your a dick");

      expect(client.say).toHaveBeenCalledWith("Don't apologise");
    }})

    it("prioritises higher weight keywords", function() { with(this) {
      eliza.say("sorry, I didn't catch your name");

      expect(client.say).toHaveBeenCalledWith("I don't like names");
    }})

    it("substitutes matched patterns in responses", function() { with(this) {
      eliza.say("I don't like ham");

      expect(client.say).toHaveBeenCalledWith("Why do you not like ham?");
    }})

    it("cycles through matched phrases", function() { with(this) {
      eliza.say("I don't like ham");
      eliza.say("I don't like trout");

      expect(client.say).toHaveBeenCalledWith("Why do you not like ham?");
      expect(client.say).toHaveBeenCalledWith("You are so negative about trout");
    }})

    it("Uses a default phrase if no matches are found", function() { with(this) {
      eliza.say("this contains no keywords");

      expect(client.say).toHaveBeenCalledWith("Please go on");
    }})

    it("says goodbye if a quit phrase is detected", function() { with(this) {
      eliza.say("quit");

      expect(client.say).toHaveBeenCalledWith("Fine, go.");
      expect(eliza.isFinished()).toEqual(true);
    }})
  }})

}})
