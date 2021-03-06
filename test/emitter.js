// Tests borrowed from https://github.com/component/emitter

var Emitter = require('..');

function Custom() {
  Emitter.call(this)
}

Custom.prototype.__proto__ = Emitter.prototype;

describe('Custom', function(){
  describe('with Emitter.call(this)', function(){
    it('should work', function(done){
      var emitter = new Custom;
      emitter.on('foo', done);
      emitter.emit('foo');
    })
  })
})

describe('Emitter', function(){
  describe('.on(event, fn)', function(){
    it('should call listeners', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.on('foo', function(val){
        calls.push('one', val);
      });

      emitter.on('foo', function(val){
        calls.push('two', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('bar', 2);
      emitter.emit('foo', 3);

      calls.should.eql([ 'one', 1, 'two', 1, 'one', 3, 'two', 3]);
    })
  })

  describe('.on(context, event, fn)', function(){
    it('should call listeners with context', function(){
      var emitter = new Emitter;
      var context = {a:2};
      var calls = [];

      emitter.on('foo', function(val){
        calls.push('one', val, this.a);
      });

      emitter.on('foo', function(val){
        calls.push('two', val, this.a);
      });

      emitter.emit(context,'foo', 1);
      emitter.emit(context,'bar', 2);
      context.a = 4;
      emitter.emit(context,'foo', 3);

      calls.should.eql([ 'one', 1, 2, 'two', 1, 2, 'one', 3, 4, 'two', 3, 4]);
    })
  })

  describe('.once(event, fn)', function(){
    it('should add a single-shot listener', function(){
      var emitter = new Emitter;
      var calls = [];

      emitter.once('foo', function(val){
        calls.push('one', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('foo', 2);
      emitter.emit('foo', 3);
      emitter.emit('bar', 1);

      calls.should.eql([ 'one', 1 ]);
    })
  })

  describe('.before and .after handlers', function(){

    it('before',function(){
      var emitter = new Emitter;
      var calls = [];

      function one(){ calls.push('one') }
      emitter.before('foo',one);
      emitter.emit('foo');
      calls.should.eql(['one']);
    })

    it('after',function(){
      var emitter = new Emitter;
      var calls = [];

      function one(){ calls.push('one') }
      emitter.after('foo',one);
      emitter.emit('foo');
      calls.should.eql(['one']);
    })

    it('before handlers first', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', two);
      emitter.before('foo', one);

      emitter.emit('foo');

      calls.should.eql(['one', 'two']);   
    })

    it('after handlers last', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }
      function three() { calls.push('three'); }

      emitter.on('foo', one);
      emitter.after('foo', three);
      emitter.on('foo', two);

      emitter.emit('foo');

      calls.should.eql(['one', 'two', 'three']);   
    })

    it('mixed before/after/on handlers',function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }
      function three() { calls.push('three'); }
      function four() { calls.push('four'); }


      emitter.on('foo', two);
      emitter.before('foo', one);
      emitter.after('foo', four);
      emitter.on('foo', three);

      emitter.emit('foo');

      calls.should.eql(['one', 'two', 'three', 'four']);    
    })
  })

  describe('.off(event, fn)', function(){
    it('should remove a listener', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo', two);

      emitter.emit('foo');

      calls.should.eql([ 'one' ]);
    })

    it('should work with .once()', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }

      emitter.once('foo', one);
      emitter.off('foo', one);

      emitter.emit('foo');

      calls.should.eql([]);
    })

    it('should work when called from an event', function(){
      var emitter = new Emitter
        , called
      function b () {
        called = true;
      }
      emitter.on('tobi', function () {
        emitter.off('tobi', b);
      });
      emitter.on('tobi', b);
      emitter.emit('tobi');
      called.should.be.true;
      called = false;
      emitter.emit('tobi');
      called.should.be.false;
    });
  })

  describe('.off(event)', function(){
    it('should remove all listeners for an event', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo');

      emitter.emit('foo');
      emitter.emit('foo');

      calls.should.eql([]);
    })
  })

  describe('.off()', function(){
    it('should remove all listeners', function(){
      var emitter = new Emitter;
      var calls = [];

      function one() { calls.push('one'); }
      function two() { calls.push('two'); }

      emitter.on('foo', one);
      emitter.on('bar', two);

      emitter.emit('foo');
      emitter.emit('bar');

      emitter.off();

      emitter.emit('foo');
      emitter.emit('bar');

      calls.should.eql(['one', 'two']);
    })
  })

  describe('.listeners(event)', function(){
    describe('when handlers are present', function(){
      it('should return an array of callbacks', function(){
        var emitter = new Emitter;
        function foo(){}
        emitter.on('foo', foo);
        emitter.listeners('foo').should.eql([foo]);
      })
    })

    describe('when no handlers are present', function(){
      it('should return an empty array', function(){
        var emitter = new Emitter;
        emitter.listeners('foo').should.eql([]);
      })
    })
  })

  describe('.hasListeners(event)', function(){
    describe('when handlers are present', function(){
      it('should return true', function(){
        var emitter = new Emitter;
        emitter.on('foo', function(){});
        emitter.hasListeners('foo').should.be.true;
      })
    })

    describe('when no handlers are present', function(){
      it('should return false', function(){
        var emitter = new Emitter;
        emitter.hasListeners('foo').should.be.false;
      })
    })
  })
})

describe('Emitter(obj)', function(){
  it('should mixin', function(done){
    var proto = {};
    Emitter(proto);
    proto.on('something', done);
    proto.emit('something');
  })

})
