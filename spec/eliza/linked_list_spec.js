var LinkedList = require('../../lib/eliza/linked_list');

describe("LinkedList", function() { with(this) {

  beforeEach(function() {
    this.node1 = {};
    this.node2 = {};
    this.node3 = {};

    this.list = new LinkedList();
  })

  describe("prepend()", function() { with(this) {
    it("sets the first and last element if it is currently empty", function() { with(this) {
      list.prepend(node1);

      expect(list.first).toEqual(node1);
      expect(list.last).toEqual(node1);
      expect(list.length).toEqual(1);
    }})

    it("adds the new element to the front of the list", function() { with(this) {
      list.prepend(node1);
      list.prepend(node2);

      expect(list.first).toEqual(node2);
      expect(list.last).toEqual(node1);
      expect(node2.next).toEqual(node1);
      expect(node1.previous).toEqual(node2);
      expect(list.length).toEqual(2);
    }})
  }})

  describe("append()", function() { with(this) {
    it("sets the first and last element if it is currently empty", function() { with(this) {
      list.append(node1);

      expect(list.first).toEqual(node1);
      expect(list.last).toEqual(node1);
      expect(list.length).toEqual(1);
    }})

    it("adds the new element to the end of the list", function() { with(this) {
      list.append(node1);
      list.append(node2);

      expect(list.first).toEqual(node1);
      expect(list.last).toEqual(node2);
      expect(node1.next).toEqual(node2);
      expect(node2.previous).toEqual(node1);
      expect(list.length).toEqual(2);
    }})
  }})

  describe("insertBefore()", function() { with(this) {
  }})

  describe("insertAfter()", function() { with(this) {
  }})

  describe("remove()", function() { with(this) {
  }})

}})

