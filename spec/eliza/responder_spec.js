var Responder = require('../../lib/eliza/responder');

describe("Responder", function() { with(this) {
  var defaults = ["Welp"];

  beforeEach(function() {
    this.client = { say: function() {} };
    spyOn(this.client, 'say');

    this.pre  = { };
    this.post = { };

    this.key1 = { match: function(p,r) {} };
    this.key2 = { match: function(p,r) { r.respondWith("hello"); } };
    this.key3 = { match: function(p,r) {} };

    var keys = [this.key1, this.key2, this.key3];

    this.responder = new Responder(this.pre, this.post, keys, defaults);

    spyOn(this.key1, "match").andCallThrough();
    spyOn(this.key2, "match").andCallThrough();
    spyOn(this.key3, "match").andCallThrough();
  })

  describe(".respond()", function() { with(this) {
    it("calls match() on each key until one matches", function() { with(this) {
      responder.respondTo("dont do that", client)

      expect(key1.match).toHaveBeenCalledWith("dont do that", responder);
      expect(key2.match).toHaveBeenCalledWith("dont do that", responder);
      expect(key3.match).not.toHaveBeenCalled();
    }})

    it("says the response to the client", function() { with(this) {
      responder.respondTo("dont do that", client);
      expect(client.say).toHaveBeenCalledWith("hello");
    }})

    it("returns 'Welp' if it cannot find a response", function() { with(this) {
      key2.match = function(p,r) {};

      responder.respondTo("dont do that", client);

      expect(client.say).toHaveBeenCalledWith("Welp");
    }})

    it("performs pre-substitutions on the input phrase", function() { with(this) {
      pre["dont"] = "don't";

      responder.respondTo("dont do that", client);

      expect(key1.match).toHaveBeenCalledWith("don't do that", responder);
    }})

    it("performs post-substitutions on the received response", function() { with(this) {
      post["hello"] = "goodbye";

      responder.respondTo("dont do that", client);

      expect(client.say).toHaveBeenCalledWith("goodbye");
    }})
  }})

}})
