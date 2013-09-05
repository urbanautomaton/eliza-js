var OrderedHash = function() {
  this.keys  = [];
  this._vals = {};
}

OrderedHash.prototype.push = function(k,v) {
  if(!this._vals[k]) {
    this.keys.push(k);
  }
  this._vals[k] = v;
};

OrderedHash.prototype.val = function(k) {
  return this._vals[k];
};

OrderedHash.prototype.size = function() {
  return this.keys.length;
}

module.exports = OrderedHash;
