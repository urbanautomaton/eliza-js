var Decomp = require('../../lib/eliza/decomp');

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

    it("returns false if no match is found", function() { with(this) {
      expect(decomp.match("this doesn't match", responder)).toEqual(false);
    }})

    it("returns true if a match is found", function() { with(this) {
      expect(decomp.match("hello i'm simon", responder)).toEqual(true);
    }})

    it("calls respondWith() if a match is found", function() { with(this) {
      decomp.match("hello i'm simon", responder);

      expect(responder.respondWith).toHaveBeenCalledWith("hello simon");
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
