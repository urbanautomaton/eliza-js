var Key = require('../../lib/eliza/key');

describe("Key", function() { with(this) {

  beforeEach(function() {
    this.responder = { }
    this.decomp    = { match: function(p,r) {}, }
    this.decomps   = { first: this.decomp, last: this.decomp, length: 1 }

    spyOn(this.decomp, 'match')

    this.key = new Key("word", this.decomps);
  })

  describe("match()", function() { with(this) {
    it("does nothing if its word does not match the phrase", function() { with(this) {
      key.match("hello", responder);

      expect(decomp.match).not.toHaveBeenCalled();
    }})

    it("calls match() on the first decomp if the keyword matches", function() { with(this) {
      key.match("word blah", responder);

      expect(decomp.match).toHaveBeenCalledWith("word blah", responder);
    }})
  }})

}})

