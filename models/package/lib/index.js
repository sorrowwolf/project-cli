'use strict';

const { isObject } = require("@sorrow-cli-dev/utils");

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的options参数不能为空!');
        }
        if (!isObject(options)) {
            throw new Error('Package类的options必须为对象!');
        }
        // package 的路径
        this.targetPath = options.targetPath;
        // package 的存储路径
        this.storePath = options.storePath;
        // package 的name
        this.packageName = options.packageName;
        // package 的version
        this.packageVersion = options.packageVersion;
    }

    // 判断当前package是否存在
    exit() {

    }

    // 安装package
    install() {

    }

    // 更新package
    update() {

    }

    // 获取入口文件的路径
    getRootPath() {

    }
}

module.exports = Package;
