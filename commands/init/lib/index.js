'use strict';

const fs = require('fs');
const Command = require("@sorrow-cli-dev/command");
const log = require('@sorrow-cli-dev/log');

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }
    exec() {
        try {
            // 1. 准备阶段
            this.prepare();
            // 2. 下载模板
            // 3. 安装模板
        } catch (e) {
            log.error(e.message);
        }
    }
    prepare() {
        // 1. 判断当前目录是否为空
        const ret = this.isCwdEmpty();
        if (!ret) {
            // 1.1 询问是否继续创建
        }
        // 2. 是否启动强制更新
        // 3. 选择创建项目或组件
        // 4. 获取项目的基本信息
    }
    isCwdEmpty() {
        const localPath = process.cwd();
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter(file => (
            !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
        ));
        return !fileList || fileList.length <= 0;
    }
}

function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
