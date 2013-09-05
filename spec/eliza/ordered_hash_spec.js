var OrderedHash = require('../../lib/eliza/ordered_hash');

describe("OrderedHash", function() { with(this) {
  beforeEach(function() {
    this.hash = new OrderedHash();
  })

  it("stores and retrieves elements by key", function() { with(this) {
    hash.push("a", 1);

    expect(hash.val("a")).toEqual(1);
    expect(hash.size()).toEqual(1);
  }})

  describe(".keys()", function() { with(this) {
    it("returns the keys in insertion order", function() { with(this) {
      hash.push("a", 1);
      hash.push("b", 2);

      expect(hash.keys).toEqual(["a", "b"]);
    }})
  }})
}})
