function LinkedList() {
  this.length = 0;
  this.first  = null;
  this.last   = null;
};

LinkedList.prototype.prepend = function(node) {
  if (this.first === null) {
    this.first = node;
    this.last  = node;
  } else {
    this.first.previous = node;
    node.next           = this.first;
    this.first          = node;
  }
  this.length++;
};

LinkedList.prototype.append = function(node) {
  if (this.first === null) {
    this.first = node;
    this.last  = node;
  } else {
    this.last.next = node;
    node.previous  = this.last;
    this.last      = node;
  }
  this.length++;
};

module.exports = LinkedList;
