var Synonym = require('../../lib/eliza/synonym');

describe("Synonym", function() { with(this) {
  var key = "desire",
      values = ["want", "need"];

  beforeEach(function() {
    this.synonym = new Synonym(key, values);
  })

  it("cycles through its values", function() { with(this) {
    expect(synonym.next()).toEqual("desire");
    expect(synonym.next()).toEqual("want");
    expect(synonym.next()).toEqual("need");
    expect(synonym.next()).toEqual("desire");
  }})

}})
