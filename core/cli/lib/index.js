'use strict';

module.exports = core;

const path = require("path");
const pkg = require("../package.json");
const log = require("@sorrow-cli-dev/log");
const constant = require("./const");
const semver = require("semver");
const colors = require("colors");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;

let args;

async function core() {
    try {
        checkPkgVersion();  // 获取版本号
        checkNodeVersion();    // 检查 node 版本号
        checkRoot();    // 检查root账户
        checkUserHome();    // 检查用户主目录
        checkInputArgs();   // 检查入参
        checkEnv();     // 检查环境变量
        // await checkGlobalUpdate();    // 检查全局更新
    } catch (error) {
        console.log('error', error);
    }
}

async function checkGlobalUpdate() {
    const currentVersion = pkg.version;
    const npmName = pkg.name;
    const { getNpmSemverVersion } = require("@sorrow-cli-dev/get-npm-info");
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本 ${currentVersion}，最新版本 ${lastVersion}`));
    }
}

function checkEnv() {
    const dotenv = require('dotenv');
    const dotenvPath = path.resolve(userHome, '.env');
    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        });
    }
    createDefaultConfig();
    log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkInputArgs() {
    const minimist = require("minimist");
    args = minimist(process.argv.slice(2));
    checkArgs();
}

function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red(`当前登录用户主目录不存在`));
    }
}

function checkRoot() {
    // windows 不支持process.geteuid();
    const rootCheck = require("root-check");
    rootCheck();
}

function checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = constant.LOWEST_VERSION;
    if (semver.lt(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`sorrow-cli需要安装 v${lowestVersion} 以上版本的nodejs`));
    }
}

function checkPkgVersion() {
    const version = pkg.version;
    log.notice('cli', version)
}