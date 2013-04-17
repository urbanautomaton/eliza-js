var Decomp = require('../../lib/eliza/decomp');

describe("Decomp", function() { with(this) {
  var regex   = /hello i'm (.*)/,
      phrases = ["hello (1)", "go away (1)"],
      decomp;

  beforeEach(function() {
    decomp = new Decomp(regex, phrases);
  })

  it("returns false on no match", function() {
    expect(decomp.match("this doesn't match")).toEqual(false);
  })

  it("substitutes captured blocks", function() {
    expect(decomp.match("hello i'm simon")).toEqual("hello simon");
  })

  it("cycles through its phrases", function() {
    expect(decomp.match("hello i'm simon")).toEqual("hello simon");
    expect(decomp.match("hello i'm edgar")).toEqual("go away edgar");
    expect(decomp.match("hello i'm james")).toEqual("hello james");
  })
}})
