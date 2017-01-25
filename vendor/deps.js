// We use `browserify` to make these Node modules usable as globals in the
// browser. After `npm install`, a `postinstall` script generates a `bundle.js`
// which `testem` loads alongside the spec files.

var chai = require('chai');
var asPromised = require('chai-as-promised');
var spies = require('chai-spies');

chai.use(asPromised);
chai.use(spies);

global.chai = chai;
global.expect = chai.expect;
