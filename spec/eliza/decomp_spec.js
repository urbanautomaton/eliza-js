var Test = require('../../vendor/jstest').Test,
    Decomp = require('../../lib/eliza/decomp');

Test.describe("Decomp", function() { with(this) {
  before(function() {
    var regex   = /hello i'm (.*)/,
        phrases = ["hello (1)", "go away (1)"];
    this.decomp = new Decomp(regex, phrases);
  })

  it("returns false on no match", function() { with(this) {
    assertEqual(decomp.match("this doesn't match"), false);
  }})

  it("substitutes captured blocks", function() { with(this) {
    assertEqual(decomp.match("hello i'm simon"), "hello simon");
  }})

  it("cycles through its phrases", function() { with(this) {
    decomp.match("hello i'm simon");
    assertEqual(decomp.match("hello i'm edgar"), "go away edgar");
  }})
}})
