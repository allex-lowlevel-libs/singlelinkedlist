'use strict';

function Iterator(cb, reverse){
  this._needsNext = false;
  this.cb = cb;
  this.targetitem = null;
  this.passes = 0;
  this.reverse = reverse||false;
}

Iterator.prototype.destroy = function () {
  //console.log(this.passes, 'passes');
  this.reverse = null;
  this.passes = null;
  if (this.targetitem && this.targetitem.iterator) {
    console.trace();
    console.error('wut m8?');
    process.exit(0);
  }
  this.targetitem = null;
  this.cb = null;
  this._needsNext = null;
};

Iterator.prototype.finished = function () {
  return !this.cb;
};

Iterator.prototype.needsNext = function () {
  return this._needsNext;
};

Iterator.prototype.setTargetItem = function (item) {
  if (!item) {
    this.destroy();
    return;
  }
  if (item.iterator) {
    console.error('ITERATOR CLASH ON', item);
    process.exit(1);
    return;
  }
  if (this.targetitem) {
    this.targetitem.iterator = null;
  }
  this.targetitem = item;
  item.iterator = this;
};

Iterator.prototype.run = function () {
  if (!this.targetitem) {
    this.destroy();
    return;
  }
  if (!this.cb) {
    this.destroy();
    return;
  }
  var ti = this.targetitem;
  this.targetitem = null;
  var ret = ti.apply(this.cb);
  this.passes++;
  ti.iterator = null;
  if (!this.targetitem) {
    this._needsNext = true;
    this.targetitem = ti;
  } else {
    this._needsNext = false;
  }
  return ret;
};

module.exports = Iterator;
