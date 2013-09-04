var Key = require('../../lib/eliza/key');

describe("Key", function() { with(this) {

  beforeEach(function() {
    this.responder = { }

    this.decomp1 = { match: function(p,r) { return false; } };
    this.decomp2 = { match: function(p,r) { return true; } };
    this.decomp3 = { match: function(p,r) { return false; } };

    spyOn(this.decomp1, 'match').andCallThrough();
    spyOn(this.decomp2, 'match').andCallThrough();
    spyOn(this.decomp3, 'match').andCallThrough();

    this.key = new Key("word", [this.decomp1, this.decomp2, this.decomp3]);
  })

  describe("match()", function() { with(this) {
    it("does nothing if its word does not match the phrase", function() { with(this) {
      key.match("hello", responder);

      expect(decomp1.match).not.toHaveBeenCalled();
    }})

    it("calls match() on each decomp until one matches", function() { with(this) {
      key.match("word blah", responder);

      expect(decomp1.match).toHaveBeenCalledWith("word blah", responder);
      expect(decomp2.match).toHaveBeenCalledWith("word blah", responder);
      expect(decomp3.match).not.toHaveBeenCalledWith("word blah", responder);
    }})

    it("returns if no match is found", function() { with(this) {
      decomp2.match = function(p,r) { return false; };
      spyOn(this.decomp2, 'match').andCallThrough();

      key.match("word blah", responder);

      expect(decomp1.match).toHaveBeenCalledWith("word blah", responder);
      expect(decomp2.match).toHaveBeenCalledWith("word blah", responder);
      expect(decomp3.match).toHaveBeenCalledWith("word blah", responder);
    }})
  }})

}})

