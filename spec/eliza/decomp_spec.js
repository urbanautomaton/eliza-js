var imports      = require('../../lib/eliza/decomp');
var Decomp       = imports.Decomp;
var StoredDecomp = imports.StoredDecomp;

describe("Decomp", function() { with(this) {
  var regex   = /hello i'm (.*)/,
      phrases = ["hello (1)", "go away (1)"];

  beforeEach(function() {
    this.responder = {
      respondWith:    function(phrase) { },
      gotoKey:        function(key)    { },
      storeResponse:  function(phrase) { }
    };

    spyOn(this.responder, 'respondWith');
    spyOn(this.responder, 'gotoKey');
    spyOn(this.responder, 'storeResponse');

    this.decomp = new Decomp(regex, phrases);
  })

  describe("match()", function() { with(this) {
    describe("when no match is found", function() { with(this) {
      it("delegates to the next decomp if one is present", function() { with(this) {
        var next_decomp = { match: function(p,r) { } };
        spyOn(next_decomp, 'match');
        decomp.next = next_decomp;

        decomp.match("this doesn't match", responder);

        expect(next_decomp.match).toHaveBeenCalledWith("this doesn't match", responder);
      }})
    }})

    describe("when a match is found", function() { with(this) {
      it("calls respondWith()", function() { with(this) {
        decomp.match("hello i'm simon", responder);

        expect(responder.respondWith).toHaveBeenCalledWith("hello simon");
      }})

      it("calls gotoKey() if the response is a goto", function() { with(this) {
        var regex       = /hello/;
        var phrases     = ["goto greet"];
        var goto_decomp = new Decomp(regex, phrases);

        goto_decomp.match("hello", responder);

        expect(responder.gotoKey).toHaveBeenCalledWith("greet");
      }})

      it("calls storeResponse() if the decomp is a StoredDecomp", function() { with(this) {
        var stored_decomp = new StoredDecomp(regex, phrases);

        stored_decomp.match("hello i'm simon", responder);

        expect(responder.storeResponse).toHaveBeenCalledWith("hello simon");
      }})

      it("does not delegate to the next decomp", function() { with(this) {
        var next_decomp = { match: function(p,r) { } };
        spyOn(next_decomp, 'match');
        decomp.next = next_decomp;

        decomp.match("hello i'm simon", responder);

        expect(next_decomp.match).not.toHaveBeenCalled();
       }})
    }})

    it("cycles through its phrases", function() { with(this) {
      decomp.match("hello i'm simon", responder);
      decomp.match("hello i'm edgar", responder);
      decomp.match("hello i'm james", responder);

      expect(responder.respondWith).toHaveBeenCalledWith("hello simon");
      expect(responder.respondWith).toHaveBeenCalledWith("go away edgar");
      expect(responder.respondWith).toHaveBeenCalledWith("hello james");
    }})

  }})

}})
