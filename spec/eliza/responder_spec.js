var Responder = require('../../lib/eliza/responder');

describe("Responder", function() { with(this) {

  beforeEach(function() {
    this.pre  = { };
    this.post = { };

    this.responder = new Responder(this.pre, this.post);

    this.key1 = { match: function(p,r) {} };
    this.key2 = { match: function(p,r) { r.respondWith("hello"); } };
    this.key3 = { match: function(p,r) {} };

    spyOn(this.key1, "match").andCallThrough();
    spyOn(this.key2, "match").andCallThrough();
    spyOn(this.key3, "match").andCallThrough();

    this.responder.addKey(this.key1);
    this.responder.addKey(this.key2);
    this.responder.addKey(this.key3);
  })

  describe(".respond()", function() { with(this) {
    it("calls match() on each key until one matches", function() { with(this) {
      responder.respondTo("dont do that")

      expect(key1.match).toHaveBeenCalledWith("dont do that", responder);
      expect(key2.match).toHaveBeenCalledWith("dont do that", responder);
      expect(key3.match).not.toHaveBeenCalled();
    }})

    it("returns the value it is told to respond with", function() { with(this) {
      expect(responder.respondTo("dont do that")).toEqual("hello");
    }})

    it("returns 'Welp' if it cannot find a response", function() { with(this) {
      key2.match = function(p,r) {};

      expect(responder.respondTo("dont do that")).toEqual("Welp");
    }})

    it("performs pre-substitutions on the input phrase", function() { with(this) {
      pre["dont"] = "don't";

      responder.respondTo("dont do that");

      expect(key1.match).toHaveBeenCalledWith("don't do that", responder);
    }})

    it("performs post-substitutions on the received response", function() { with(this) {
      post["hello"] = "goodbye";

      expect(responder.respondTo("dont do that")).toEqual("goodbye");
    }})
  }})

}})
