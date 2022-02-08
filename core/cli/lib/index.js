'use strict';

module.exports = core;

const pkg = require("../package.json");
const log = require("@sorrow-cli-dev/log");
const constant = require("./const");
const semver = require("semver");
const colors = require("colors");

function core() {
    checkPkgVersion();  // 获取版本号
    checkNodeVersion();
}

function checkNodeVersion() {
    // 1. 获取当前node版本号
    const currentVersion = process.version;
    // 2. 比对最低版本号
    const lowestVersion = constant.LOWEST_VERSION;
    if (semver.lt(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`sorrow-cli需要安装 v${lowestVersion} 以上版本的nodejs`));
    }
}

function checkPkgVersion() {
    const version = pkg.version;
    log.notice('cli', version)
}