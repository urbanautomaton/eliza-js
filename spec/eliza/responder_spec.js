var Responder   = require('../../lib/eliza/responder');
var OrderedHash = require('../../lib/eliza/ordered_hash');

describe("Responder", function() { with(this) {
  var defaults = ["Welp"];

  beforeEach(function() {
    this.client = { say: function() {} };
    spyOn(this.client, 'say');

    this.pre  = function(p) { return p };

    this.key1 = { match: function(p,r) {} };
    this.key2 = { match: function(p,r) { r.respondWith("hello"); } };
    this.key3 = { match: function(p,r) {} };

    spyOn(this.key1, "match").andCallThrough();
    spyOn(this.key2, "match").andCallThrough();
    spyOn(this.key3, "match").andCallThrough();

    this.key_hash = new OrderedHash();
    this.key_hash.push("a", this.key1);
    this.key_hash.push("b", this.key2);
    this.key_hash.push("c", this.key3);

    this.responder = new Responder(this.pre, this.key_hash, defaults);
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

    describe("when a response cannot be found", function() { with(this) {
      it("returns a stored response if one exists", function() { with(this) {
        responder.storeResponse("you were saying?");
        key2.match = function(p,r) {};

        responder.respondTo("dont do that", client);

        expect(client.say).toHaveBeenCalledWith("you were saying?");
      }})

      it("returns 'Welp' otherwise", function() { with(this) {
        key2.match = function(p,r) {};

        responder.respondTo("dont do that", client);

        expect(client.say).toHaveBeenCalledWith("Welp");
      }})
    }})

    describe(".gotoKey()", function() { with(this) {
      it("directly attempts to match using the specified key", function() { with(this) {
        key1.match = function(p, r) { r.gotoKey("c") };
        key3.blindMatch = function(p, r) { r.respondWith("aaaargh"); };
        spyOn(key3, 'blindMatch').andCallThrough();

        responder.respondTo("dont do that", client);

        expect(key2.match).not.toHaveBeenCalled();
        expect(key3.blindMatch).toHaveBeenCalledWith("dont do that", responder);
        expect(client.say).toHaveBeenCalledWith("aaaargh");
      }})
    }})

    it("performs pre-substitutions on the input phrase", function() { with(this) {
      pre = function(p) { return p.replace("dont", "don't"); };
      pre_responder = new Responder(this.pre, this.key_hash, defaults);

      pre_responder.respondTo("dont do that", client);

      expect(key1.match).toHaveBeenCalledWith("don't do that", pre_responder);
    }})

  }})

}})
