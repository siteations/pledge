describe('Chapter 2: Fulfillment Callback Attachment', function(){
/*======================================================


                         .d8888b.
                        d88P  Y88b
                               888
                             .d88P
                         .od888P"
                        d88P"
                        888"
                        888888888


Chapter 2: Attaching and Calling Promise Event Handlers
--------------------------------------------------------
We are beginning to see how a deferral can manipulate a
promise. But what does a promise actually do? How can one be
used? By completing this chapter, you will learn the
fundamentals of how promises act on eventual information.
========================================================*/

/* global chai defer */

describe("A promise's `.then` method", function(){

  var deferral, promise;
  beforeEach(function(){
    deferral = defer();
    promise  = deferral.$promise;
  });
  /* eslint-disable no-unused-vars */
  function s1 (data)   { /* use data */ }
  function e1 (reason) { /* handle reason */ }
  function s2 (data)   { /* use data */ }
  function e2 (reason) { /* handle reason */ }
  /* eslint-enable no-unused-vars */

  it('adds groups of handlers (callback functions) to the promise', function(){
    promise.then( s1, e1 );
    expect( promise._handlerGroups[0].successCb ).to.equal( s1 );
    expect( promise._handlerGroups[0].errorCb   ).to.equal( e1 );
  });

  it('can be called multiple times to add more handlers', function(){
    promise.then( s1, e1 );
    expect( promise._handlerGroups[0].successCb ).to.equal( s1 );
    expect( promise._handlerGroups[0].errorCb   ).to.equal( e1 );
    promise.then( s2, e2 );
    expect( promise._handlerGroups[1].successCb ).to.equal( s2 );
    expect( promise._handlerGroups[1].errorCb   ).to.equal( e2 );
  });

  it('attaches a falsy value in place of non-function success or error callbacks', function(){
    promise.then( 'a string', {} );
    /* eslint-disable no-unused-expressions */
    expect( promise._handlerGroups[0].successCb ).to.not.be.ok; // aka falsy
    expect( promise._handlerGroups[0].errorCb   ).to.not.be.ok; // aka falsy
    /* eslint-enable no-unused-expressions */
  });

});

// Getting to the main functionality
describe('A promise', function(){

  var numDeferral, promiseForNum, foo, setFoo10, addToFoo;
  beforeEach(function(){
    numDeferral = defer();
    promiseForNum = numDeferral.$promise;
    foo = 0;
    setFoo10 = chai.spy(function () { foo = 10; });
    addToFoo = chai.spy(function (num) { foo += num; });
  });

  describe('that is not yet fulfilled', function(){

    it('does not call any success handlers yet', function(){
      promiseForNum.then( setFoo10 );
      expect( setFoo10 ).not.to.have.been.called();
    });

  });

  describe('that is already fulfilled', function(){

    beforeEach(function(){
      numDeferral.resolve( 25 );
    });

    // Recommended: add a .callHandlers method to your promise prototype.

    it('calls a success handler added by `.then`', function(){
      promiseForNum.then( setFoo10 );
      expect( setFoo10 ).to.have.been.called();
    });

    it("calls a success handler by passing in the promise's value", function(){
      promiseForNum.then( addToFoo );
      expect( addToFoo ).to.have.been.called.with.exactly( 25 );
    });

    it('calls each success handler once per attachment', function(){
      promiseForNum.then( setFoo10 );
      promiseForNum.then( addToFoo );
      promiseForNum.then( addToFoo );
      /* eslint-disable no-unused-expressions */
      expect( setFoo10 ).to.have.been.called.once;
      expect( addToFoo ).to.have.been.called.twice;
      /* eslint-enable no-unused-expressions */
      expect( addToFoo ).to.have.been.called.always.with.exactly( 25 );
    });

    it('calls each success handler when added', function(){
      promiseForNum.then( setFoo10 );
      expect( foo ).to.equal( 10 );
      promiseForNum.then( addToFoo );
      expect( foo ).to.equal( 35 );
    });

  });

  // So we can run callbacks if we already have the value.
  // But what if events occur in opposite order?
  describe('that already has a success handler', function(){

    it('calls that handler when fulfilled', function(){
      promiseForNum.then( setFoo10 );
      numDeferral.resolve();
      expect( setFoo10 ).to.have.been.called();
    });

    xit('calls all its success handlers in order one time when fulfilled', function(){
      promiseForNum.then( setFoo10 );
      promiseForNum.then( addToFoo );
      numDeferral.resolve( 25 );
      expect( foo ).to.equal( 35 );
    });

  });

});

/*
We've just made something nifty. A promise's `.then` can
attach behavior both before & after the promise is actually
fulfilled, and we know that the actions will run when they can.
The `.then` method can also be called multiple times, so you can
attach callbacks to run in different parts of your code, and
they will all run once the promise is fulfilled.
*/
});
