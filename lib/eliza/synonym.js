var Synonym = function(key, values) {
  this._key         = key;
  this._values      = [key].concat(values);
  this._value_count = values.length + 1;
  this._count       = 0;
};

Synonym.prototype.next = function() { with(this) {
  var syn = _values[_count % _value_count];
  _count++;
  return syn;
}};

module.exports = Synonym;
