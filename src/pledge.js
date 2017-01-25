'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise(){
  this._state = 'pending'
  this._value = null
  this._handlerGroups = []
  this._waiters=0
}

function Deferral(){
  this.$promise = new $Promise()
}

var defer = function(){
  return new Deferral();
}

$Promise.prototype.then = function (data, reason) {
    let dataCheck=data,
        reasonCheck=reason;
    if (typeof data !== 'function'){
      dataCheck=null;
    }
    if (typeof reason !== 'function'){
      reasonCheck=null;
    }
    this._handlerGroups.push({'successCb': dataCheck,  'errorCb': reasonCheck});

    //console.log(this._handlerGroups);
    if (this._state ==='fulfilled' || this._state ==='rejected'){
      //console.log(this._handlerGroups.length);
      var thisObj=this._handlerGroups.shift();
      this.callHandlers(thisObj.successCb, thisObj.errorCb);

    } else if (this._state ==='pending'){
      this._waiters++;
      //return;
      //this.callHandlers(thisObj.successCb, thisObj.errorCb);
    }
    //console.log('waiting functions: ', this._waiters);


}

$Promise.prototype.callHandlers = function(successCb, errorCb){
    if (successCb) return successCb(this._value);
    if (errorCb) return errorCb(this._value);
}

Deferral.prototype.resolve = function(data){
  if(!this.$promise._value && this.$promise._state  === "pending") this.$promise._value = data;
  if(this.$promise._state === 'pending') this.$promise._state = 'fulfilled';

  // if(this._waiters>0){
  //   console.log('can call then as may times as = waiters');

  // }
  //console.log(this._handlerGroups.length);
}

Deferral.prototype.reject = function(data){
  if(!this.$promise._value && this.$promise._state  === "pending") this.$promise._value = data;
  if(this.$promise._state === 'pending') this.$promise._state = 'rejected';
}






/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
