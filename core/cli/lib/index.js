'use strict';

module.exports = core;

const pkg = require("../package.json");

function core() {
    // TODO
    console.log('core')
}

function checkPkgVersion() {
    const version = pkg.version;
}