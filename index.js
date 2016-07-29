'use strict';

var Iterator = require('./Iterator');

function ListItem(content){
  this.link = null;
  this.content = content;
  this.iterator = null;
}

ListItem.prototype.destroy = function(){
  if (this.iterator && this.link) {
    //console.log('passing my iterator to my link');
    this.iterator.setTargetItem(this.link);
  }
  this.iterator = null;
  this.content = null;
  this.link = null;
};

ListItem.prototype.linkTo = function(item){
  if(item){
    if(item.link){
      this.link = item.link;
    }
    item.link = this;
  }
};

ListItem.prototype.empty = function(){
  return 'undefined' === typeof this.content;
};

ListItem.prototype.apply = function(func){
  if('undefined' !== typeof this.content){
    try {
      return func(this.content,this);
    }catch (e) {
      console.log(e);
      console.error(e.stack);
    }
  }
};

function List(sortfunction){
  //TODO check if it is reasonable to throw in constructor
  /*
  if (!!sortfunction){
    if ('function' !== typeof sortfunction){
      throw new Error('First parameter is not a function.');
    }
  }
  */
  this.head = new ListItem();
  this.sorter = sortfunction || null;
  this.length = 0;
}

List.prototype.destroy = function(){
  this.purge();
  this.length = null;
  this.sorter = null;
  this.head = null;
};

List.prototype.purge = function(){
  var item = this.head, ditem;
  while(item){
    ditem = item;
    item = item.link;
    ditem.destroy();
  }
  this.head.content = void 0;
  this.length=0;
};

List.prototype.empty = function(){
  return !this.head.content;
};

List.prototype.add = function(content,afteritem){
  if(this.head.empty()){
    this.head.content = content;
    this.length = 1;
    return this.head;
  }
  var newitem = new ListItem(content);
  var item = afteritem || this.itemAfterWhichToInsert(content);
  if(!item){
    this.head.linkTo(newitem);
    this.head = newitem;
  }else{
    newitem.linkTo(item);
  }
  this.length++;
  return newitem;
};

List.prototype.removeOne = function(listitem){
  var item = this.head, previtem;
  if (listitem === null || 'object' !== typeof listitem || !(listitem instanceof ListItem)){
    throw new Error('Item is not instance of ListItem');
  }
  while(item){
    if(item===listitem){
      if(item===this.head){
        if(item.link){
          this.head = item.link;
          item.destroy();
        }else{
          this.head.content = void 0;
        }
      }else{
        previtem.link = item.link;
        item.destroy();
      }
      this.length--;
      return;
    }
    previtem = item;
    item = item.link;
  }
  //console.trace();
  throw new Error('Item not found to destroy');
};

List.prototype.findOne = function(criterionfunction){
  var item = this.firstItemToSatisfy(criterionfunction);
  if(item){
    return item.content;
  }
};

List.prototype.firstItemToSatisfy = function(func){
  var check=false, item = this.head;
  if ('function' !== typeof func){
    throw new Error('First parameter is not a function.');
  }
  while(!check && item){
    check = item.apply(func);
    if('boolean' !== typeof check){
      throw new Error('func needs to return a boolean value');
    }
    if(check){
      return item;
    }else{
      item = item.link;
    }
  }
  return item;
};

List.prototype.lastItemToSatisfy = function(func){
  var check, item = this.head, ret;
  if ('function' !== typeof func){
    throw new Error('First parameter is not a function.');
  }
  while(item){
    check = item.apply(func);
    if('boolean' !== typeof check){
      throw new Error('func needs to return a boolean value');
    }
    if(!check){
      return ret;
    }else{
      ret = item;
      item = item.link;
    }
  }
  return ret;
};

List.prototype.itemAfterWhichToInsert = function(content){
  if(!this.sorter){
    return null;
  }
  var check, item = this.head, ret;
  while(item){
    if(typeof item.content === 'undefined'){
      return item;
    }
    check = this.sorter(content,item.content);
    if('boolean' !== typeof check){
      throw new Error('func needs to return a boolean value');
    }
    if(!check){
      return ret;
    }else{
      ret = item;
      item = item.link;
    }
  }
  return ret;
};

List.prototype.traverse = function(func){
  //TODO integrate checks
  if ('function' !== typeof func){
    throw new Error('First parameter is not a function.');
  }
  var it = new Iterator(func);
  it.setTargetItem(this.head);
  while(it.cb) {
    it.run();
    if(it.finished()) {
      break;
    }
    if (it.needsNext()) {
      it.setTargetItem(it.targetitem.link);
    }
  }
};

List.prototype.traverseConditionally = function(func){
  if ('function' !== typeof func){
    throw new Error('First parameter is not a function.');
  }
  var it = new Iterator(func), result;
  it.setTargetItem(this.head);
  while(it.cb) {
    result = it.run();
    if('undefined' !== typeof result){
      it.destroy();
      return result;
    }
    if(it.finished()) {
      break;
    }
    if (it.needsNext()) {
      it.setTargetItem(it.targetitem.link);
    }
  }
};

List.prototype.dumpToConsole = function(){
  this.traverse(console.log.bind(console));
};

function drainer(arry,countobj,content){
  arry[countobj.count] = content;
  countobj.count++;
}

List.prototype.drain = function(){
  var ret = new Array(this.length),countobj={count:0};
  this.traverse(drainer.bind(null,ret,countobj));
  this.purge();
  return ret;
};


module.exports = List;
