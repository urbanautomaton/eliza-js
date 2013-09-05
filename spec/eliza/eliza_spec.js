var Eliza = require('../../lib/eliza/eliza');
var script = require('../fixtures/script');

describe("Eliza", function() { with(this) {
  beforeEach(function() {
    this.client = {
      say: function(phrase) { },
      quit: function() { }
    };
    spyOn(this.client, 'say');
    spyOn(this.client, 'quit');

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

      expect(client.say).toHaveBeenCalledWith("Why do you not like ham?");

      eliza.say("I don't like trout");

      expect(client.say).toHaveBeenCalledWith("You are so negative about trout");
    }})

    it("recognises synonyms", function() { with(this) {
      eliza.say("I need a loaf of bread");

      expect(client.say).toHaveBeenCalledWith("What makes you want a loaf of bread?");
    }})

    it("substitutes synonyms as match blocks", function() { with(this) {
      eliza.say("I need a loaf of bread");
      eliza.say("I desire a bushel of lolcats");

      expect(client.say).toHaveBeenCalledWith("Do you really desire a bushel of lolcats?");
    }})

    it("Stores responses from $ decomps for later", function() { with(this) {
      eliza.say("Do you know my name?");

      expect(client.say).toHaveBeenCalledWith("I don't like names");

      eliza.say("this contains no keywords");

      expect(client.say).toHaveBeenCalledWith("Earlier you mentioned your name?");
    }})

    it("follows goto phrases", function() { with(this) {
      eliza.say("why is that?");

      expect(client.say).toHaveBeenCalledWith("Does that question interest you?");
    }})

    it("Uses a default phrase if no matches are found", function() { with(this) {
      eliza.say("this contains no keywords");

      expect(client.say).toHaveBeenCalledWith("Please go on");
    }})

    it("says goodbye if a quit phrase is detected", function() { with(this) {
      eliza.say("quit");

      expect(client.say).toHaveBeenCalledWith("Fine, go.");
      expect(client.quit).toHaveBeenCalled();
    }})
  }})

}})
