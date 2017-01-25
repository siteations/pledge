describe('Chapter 4: Promise Chaining and Transformation', function(){
/*=======================================================


                            d8888
                           d8P888
                          d8P 888
                         d8P  888
                        d88   888
                        8888888888
                              888
                              888


Chapter 4: Promises Can Return Values and Chain Together
---------------------------------------------------------
A crucial aspect of promises is that `.then` always
returns a new promise. When values are returned from
promise A's handler, they are exported and represented by
the return promise B. This leads to remarkably versatile
behavior: choosing when to catch errors, chaining promises
together, easily passing around promised values and acting
on them where convenient… even returning new values.
This chapter may be challenging.
========================================================*/

/* global Deferral defer */
/* eslint no-throw-literal: 0 */

describe('For a given promiseA (pA)', function(){

  var deferralA, promiseA;
  beforeEach(function(){
    deferralA = defer();
    promiseA = deferralA.$promise;
  });
  function thisReturnsHi () { return 'hi'; }
  function thisThrowsShade () { throw 'shade'; }

  xit('`.then` adds a new deferral to its handler group', function(){
    promiseA.then();
    var groups = promiseA._handlerGroups;
    expect( groups[0].downstream ).to.be.an.instanceof( Deferral );
    // each handler group has its own `downstream`
    promiseA.then();
    expect( groups[1].downstream ).to.be.an.instanceof( Deferral );
    expect( groups[1].downstream ).not.to.equal( groups[0].downstream );
  });

  // Passing this may break your `.catch` from chapter 3. If that happens,
  // you will have to go back and fix `.catch`, taking this spec into account.
  xit('`.then` returns the promise from that deferral', function(){
    var promiseB = promiseA.then();
    expect( promiseB ).to.equal( promiseA._handlerGroups[0].downstream.$promise );
  });

  describe('that returns promiseB (pB) via `.then`:', function(){

    // Setting a fast timeout since Pledge doesn't force handlers to be async.
    this.timeout(1);

    // Fulfillment bubbles down to the first available success handler.
    xit("if pA is fulfilled but has no success handler, pB is fulfilled with pA's value", function(){
      var promiseB = promiseA.then();
      deferralA.resolve( 9001 );
      // Do not set state manually; `resolve` should be called somewhere,
      expect( promiseB._state ).to.equal( 'fulfilled' );
      expect( promiseB._value ).to.equal( 9001 );
      // The above is a hint; from now on we'll use the chai-as-promised
      // matcher shown here. "Eventually equal" really means "fulfill with."
      return expect( promiseB ).to.eventually.equal( 9001 );
    });

    // Rejection bubbles down to the first available error handler.
    xit("if pA is rejected but has no error handler, pB is rejected with pA's reason", function(){
      var promiseB = promiseA.then();
      deferralA.reject( 'darn' );
      // Do not set state manually; `reject` should be called somewhere.
      expect( promiseB._state ).to.equal( 'rejected' );
      expect( promiseB._value ).to.equal( 'darn' );
      // The above is a hint; from now on we'll use this custom matcher:
      return expect( promiseB ).to.be.rejectedWith( 'darn' );
    });

    // This is for normal (synchronous / non-promise) return values
    xit("if pA's success handler returns a value `x`, pB is fulfilled with `x`", function(){
      var promiseB = promiseA.then( thisReturnsHi );
      deferralA.resolve();
      return expect( promiseB ).to.eventually.equal( 'hi' );
    });

    // This is for normal (synchronous / non-promise) return values
    xit("if pA's error handler returns a value `x`, pB is fulfilled with `x`", function(){
      /* Why fulfilled? This is similar to try-catch. If promiseA is
      rejected (equivalent to `try` failure), we pass the reason to
      promiseA's error handler (equivalent to `catch`). We have now
      successfully handled the error, so promiseB should represent
      the error handler returning something useful, not a new error.
      promiseB would only reject if the error handler itself failed
      somehow (which we already addressed in a previous test).*/
      var promiseB = promiseA.catch( thisReturnsHi );
      deferralA.reject();
      return expect( promiseB ).to.eventually.equal( 'hi' );
    });

    // Exceptions cause the returned promise to be rejected with the error.
    // Hint: you will need to use `try` & `catch` to make this work.
    xit("if pA's success handler throws a reason `e`, pB is rejected with `e`", function(){
      var promiseB = promiseA.then( thisThrowsShade );
      deferralA.resolve();
      return expect( promiseB ).to.be.rejectedWith( 'shade' );
    });

    xit("if pA's error handler throws a reason `e`, pB is rejected with `e`", function(){
      var promiseB = promiseA.catch( thisThrowsShade );
      deferralA.reject();
      return expect( promiseB ).to.be.rejectedWith( 'shade' );
    });

    /* What if promiseA returns a promiseZ? You could handle pZ like a
    normal value, but then you have to start writing `.then` inside `.then`.
    Instead, we want to make promiseB to "become" pZ by copying
    pZ's behavior — aka assimilation. These four tests are brain-benders. */
    xit("if pA's success handler returns promiseZ which fulfills, pB mimics pZ", function(){
      var deferralZ = defer();
      var promiseZ = deferralZ.$promise;
      var promiseB = promiseA.then(function(){
        return promiseZ;
      });
      deferralA.resolve();
      deferralZ.resolve( 'testing' );
      return expect( promiseB ).to.eventually.equal( 'testing' );
    });

    xit("if pA's error handler returns promiseZ which fulfills, pB mimics pZ", function(){
      var deferralZ = defer();
      var promiseZ = deferralZ.$promise;
      var promiseB = promiseA.catch(function(){
        return promiseZ;
      });
      deferralA.reject();
      deferralZ.resolve( 'testing' );
      return expect( promiseB ).to.eventually.equal( 'testing' );
    });

    xit("if pA's success handler returns promiseZ which rejects, pB mimics pZ", function(){
      var deferralZ = defer();
      var promiseZ = deferralZ.$promise;
      var promiseB = promiseA.then(function(){
        return promiseZ;
      });
      deferralA.resolve();
      deferralZ.reject( 'testing' );
      return expect( promiseB ).to.be.rejectedWith( 'testing' );
    });

    xit("if pA's error handler returns promiseZ which rejects, pB mimics pZ", function(){
      var deferralZ = defer();
      var promiseZ = deferralZ.$promise;
      var promiseB = promiseA.catch(function(){
        return promiseZ;
      });
      deferralA.reject();
      deferralZ.reject( 'testing' );
      return expect( promiseB ).to.be.rejectedWith( 'testing' );
    });

    // To really test assimilation properly would require many more specs.
    // But we won't be that strict.

  });

  // Another demonstration. This should work if the previous specs passed.
  xit('`.then` can be chained many times', function(){
    var add1 = function (num) { return ++num; };
    var test = 0;
    promiseA
    .then(add1)
    .then(add1)
    .then()
    .then(function (data) {
      test = data;
    });
    deferralA.resolve( 0 );
    expect( test ).to.equal( 2 );
  });

});

/*
Wow! If you got this far, congratulations. We omitted certain
details (e.g. handlers must always be called in a true async
wrapper), but you have built a promise library with most of
the standard behavior. In the next (optional, but recommended)
chapter, we'll be adding in some common library methods that
make working with promises easier and cleaner.
*/
});
