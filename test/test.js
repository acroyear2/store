
var store = require('store');
var shelf = window.localStorage;

describe('store', function () {
  before(function () {
    shelf.clear();
  });
  describe('set', function () {
    it('should return uniq ids', function (done) {
      store.set('abc').should.eql('s1');
      store.set('abc').should.eql('s2');
      done();
    });
    it('should return given key', function (done) {
      store.set('abc', 'set2').should.eql('set2');
      done();
    });
    it('should persist by given key', function (done) {
      var id = store.set('abc', 'set1', {persist:true});
      shelf.getItem(id).should.eql('abc');
      done();
    });
    it('should persist strings', function (done) {
      var id = store.set('asx', {persist:true});
      shelf.getItem(id).should.eql('asx');
      done();
    });
    it('should persist objects', function (done) {
      var id = store.set([1,2,3], {persist:true});
      JSON.parse(shelf.getItem(id)).should.eql([1,2,3]);
      id = store.set({a:1,b:2,c:3}, {persist:true});
      JSON.parse(shelf.getItem(id)).should.eql({a:1,b:2,c:3});
      done();
    });
    it('should emit set event', function (done) {
      store.once('set', function (key, val, persist) {
        persist.should.eql(false);
        val.should.eql([0]);
        key.should.eql('set3');
        done();
      });
      store.set([0], 'set3');
    });
    it('should emit set:key event', function (done) {
      store.once('set:set4', function (val, persist) {
        persist.should.eql(true);
        val.should.eql([0]);
        done();
      });
      store.set([0], 'set4', {persist:true});
    });
  });
  describe('get', function () {
    it('should get strings', function (done) {
      store.get(store.set('abc')).should.eql('abc');
      store.get(store.set('abc'), {persist:true}).should.eql('abc');
      store.set('abc', 'get1', {persist:true});
      store.get('get1').should.eql('abc');
      done();
    });
    it('should get objects', function (done) {
      store.get(store.set({a:1,b:2})).should.eql({a:1,b:2});
      store.get(store.set({a:1,b:2}, {persist:true})).should.eql({a:1,b:2});
      store.set({a:1,b:2}, 'get2', {persist:true});
      store.get('get2').should.eql({a:1,b:2});
      done();
    });
    it('should copy from shelf if needed', function (done) {
      window.localStorage.setItem('get3', 'abc123');
      store.get('get3').should.eql('abc123');
      window.localStorage.setItem('get3', 'abc1234');
      store.get('get3').should.eql('abc123');
      window.localStorage.setItem('get4', JSON.stringify([4,5,6]));
      store.get('get4').should.eql([4,5,6]);
      window.localStorage.setItem('get4', [1,2]);
      store.get('get4').should.eql([4,5,6]);
      done();
    });
  });
  describe('remove', function () {
    it('should return key', function (done) {
      var id = store.set('qwe');
      store.get(id).should.eql('qwe');
      store.remove(id).should.eql(id);
      done();
    });
    it('should not return key', function (done) {
      (store.remove('rm5')==undefined).should.be.true;
      done();
    });
    it('should nullify', function (done) {
      (store.get(store.remove(store.set('qzx')))==null).should.be.true;
      done();
    });
    it('should keep persisted', function (done) {
      store.remove(store.set([0,1], 'rm1', {persist:true}));
      store.get('rm1').should.eql([0,1]);
      window.localStorage.setItem('rm1', 'qza');
      store.get('rm1').should.eql([0,1]);
      done();
    });
    it('should remove persisted', function (done) {
      (store.get(store.remove(store.set('qzx', {persist:true}), 
        {persist:true}))==null).should.be.true;
      done();
    });
    it('should emit remove event', function (done) {
      store.once('remove', function (key, persist) {
        persist.should.eql(false);
        key.should.eql('rm2');
        done();
      });
      store.set([0], 'rm2');
      store.remove('rm2');
    });
    it('should emit remove:key event', function (done) {
      store.once('remove:rm3', function (persist) {
        persist.should.eql(false);
        store.once('remove:rm4', function (persist) {
          persist.should.eql(true);
          done();
        });
        store.set([0], 'rm4', {persist:true});
        store.remove('rm4', {persist:true});
      });
      store.set([0], 'rm3');
      store.remove('rm3');
    });
  });
  describe('clear', function () {
    it('should clear', function (done) {
      store.get(store.set('axq', 'clear1')).should.eql('axq');
      store.clear();
      (store.get('clear1')==null).should.be.true;
      store.get(store.set('qqq', 'clear2', {persist:true})).should.eql('qqq');
      store.clear();
      store.get('clear2').should.eql('qqq');
      store.clear({persist:true});
      (store.get('clear2')==null).should.be.true;
      done();
    });
    it('should emit clear event', function (done) {
      store.once('clear', function (persist) {
        persist.should.eql(false);
        store.once('clear', function (persist) {
          persist.should.eql(true);
          done();
        });
        store.get(store.set('axq', 'clear4')).should.eql('axq');
        store.clear({persist:true});
      });
      store.get(store.set('axq', 'clear3')).should.eql('axq');
      store.clear();
    });
  });
});