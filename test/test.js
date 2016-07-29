var expect = require('chai').expect,
  List = require('..');

describe('Testing \'Signle linked list\' lib', function(){
  it('Length tests', function(){
    var list = new List();
    expect(list.length).to.be.equal(0);
    for (var i=0; i<100; i++){
      list.add(i);
    }
    expect(list.length).to.be.equal(100);
    list.purge();
    expect(list.length).to.be.equal(0);
    for (var i=0; i<50; i++){
      list.add(i);
    }
    expect(list.length).to.be.equal(50);
    list.destroy();
    expect(list.length).to.be.null;
  });

  it('Structure tests (Chaining)', function(){
    var list = new List();
    //Adding to the front if no 2nd param!
    var third = list.add(3); 
    var second = list.add(2); 
    var first = list.add(1); 
    expect(first.link).to.be.equal(second);
    expect(second.link).to.be.equal(third);
    expect(third.link).to.be.null;

    list.purge();

    var first = list.add(1); 
    var second = list.add(2,first); 
    var third = list.add(3,second); 
    expect(first.link).to.be.equal(second);
    expect(second.link).to.be.equal(third);
    expect(third.link).to.be.null;

    list.removeOne(second);
    expect(first.link).to.be.equal(third);

    list.purge();

    var first = list.add(1); 
    var second = list.add(2,first); 
    var third = list.add(3,second); 
    var fourth = list.add(4,third); 

    expect(first.link).to.be.equal(second);
    expect(second.link).to.be.equal(third);
    expect(third.link).to.be.equal(fourth);
    expect(fourth.link).to.be.null;

    list.removeOne(second);
    expect(first.link).to.be.equal(third);

    list.removeOne(third);
    expect(first.link).to.be.equal(fourth);

    list.removeOne(fourth);
    expect(first.link).to.be.null;

  });

  it('List with sortfunction (>=)', function(){
    //Sort function example
    var sortfunction = function(a,b){
      return a >= b;
    }
    var list = new List(sortfunction);

    var third = list.add(9); 
    var second = list.add(5); 
    var first = list.add(1); 

    expect(first.link).to.be.equal(second);
    expect(second.link).to.be.equal(third);
    expect(third.link).to.be.null;

    var newElem = list.add(7)

    expect(second.link).to.be.equal(newElem);
    expect(newElem.link).to.be.equal(third);

    var newElem2 = list.add(7)

    expect(newElem.link).to.be.equal(newElem2);
    expect(newElem2.link).to.be.equal(third);

  });

  it('List with sortfunction (>)', function(){
    //Sort function example
    var sortfunction = function(a,b){
      return a > b;
    }
    var list = new List(sortfunction);

    var third = list.add(9); 
    var second = list.add(5); 
    var first = list.add(1); 

    expect(first.link).to.be.equal(second);
    expect(second.link).to.be.equal(third);
    expect(third.link).to.be.null;

    var newElem = list.add(7)

    expect(second.link).to.be.equal(newElem);
    expect(newElem.link).to.be.equal(third);

    var newElem2 = list.add(7)

    expect(second.link).to.be.equal(newElem2);
    expect(newElem2.link).to.be.equal(newElem);

  });

  it('removeOne', function(){
    var list = new List();

    var third = list.add(3); 
    var second = list.add(2); 
    var first = list.add(1); 
    var obj = {};

    expect(list.removeOne.bind(list,null)).to.throw(Error,/Item is not instance of/);
    expect(list.removeOne.bind(list)).to.throw(Error,/Item is not instance of/);
    expect(list.removeOne.bind(list,obj)).to.throw(Error,/Item is not instance of/);
    expect(list.removeOne.bind(list,[])).to.throw(Error,/Item is not instance of/);
    expect(list.removeOne(first)).to.be.undefined;
    expect(list.removeOne.bind(list,first)).to.throw(Error,/Item not found/);

  });

  it('firstItemToSatisfy', function(){
    var list = new List();

    var third = list.add(3); 
    var second = list.add(2); 
    var first = list.add(1); 

    expect(list.firstItemToSatisfy.bind(list,null)).to.throw(Error,/not a function/);
    expect(list.firstItemToSatisfy.bind(list)).to.throw(Error,/not a function/);

    var func = function(){
      return 3;
    };
    expect(list.firstItemToSatisfy.bind(list,func)).to.throw(Error,/needs to return a boolean/);

    func = function(){
      return true;
    };
    expect(list.firstItemToSatisfy(func)).to.be.equal(first);

    func = function(content,item){
      return content === 2;
    };
    expect(list.firstItemToSatisfy(func)).to.be.equal(second);

    func = function(content,item){
      return content === 4;
    };
    expect(list.firstItemToSatisfy(func)).to.be.null;
  });

  it('traverse', function(){
    var list = new List();

    var third = list.add(3); 
    var second = list.add(2); 
    var first = list.add(1); 
    
    var exp = function(content,item){
      item.content *= item.content;
    };

    list.traverse(exp);

    expect(first.content).to.be.equal(1);
    expect(second.content).to.be.equal(4);
    expect(third.content).to.be.equal(9);
    
    expect(list.traverse.bind(list,false)).to.throw(Error,/is not a function/);

  });

  it('traverseConditionally', function(){
    var list = new List();

    var third = list.add(5); 
    var second = list.add(3); 
    var first = list.add(1); 

    var bingo = function(content,item){
      if (content > 3) return 'Bingo' + content;
    };

    expect(list.traverseConditionally(bingo)).to.be.equal('Bingo5');
    
    expect(list.traverseConditionally.bind(list,false)).to.throw(Error,/is not a function/);

  });

});
