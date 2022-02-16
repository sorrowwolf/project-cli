'use strict';

const Package = require("@sorrow-cli-dev/package");
const log = require("@sorrow-cli-dev/log");

const SETTINGS = {
    init: '@sorrow-cli-dev/init'
}

function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);
    
    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    if (!targetPath) {
        // 生成缓存路径
        targetPath = '';
    }

    const pkg = new Package({
        targetPath,
        packageName,
        packageVersion,
    });
    console.log(pkg.getRootFilePath());
}

module.exports = exec;