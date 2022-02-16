'use strict';

const { isObject } = require("@sorrow-cli-dev/utils");
const pkgDir = require("pkg-dir").sync;
const path = require("path");

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的options参数不能为空!');
        }
        if (!isObject(options)) {
            throw new Error('Package类的options必须为对象!');
        }
        // package 的目标路径
        this.targetPath = options.targetPath;
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
    getRootFilePath() {
        // 1. 获取package.json所在目录 -> pkg-dir
        const dir = pkgDir(this.targetPath);
        if (dir) {
            // 2. 读取package.json - require()
            const pkgFile = require(path.resolve(dir, 'package.json'));
            // 3. main/lib - path
            if (pkgFile && pkgFile.main) {
                // 4, 路径的兼容(macOS/windows)
                return path.resolve(dir, pkgFile.main);
            }
        }
        return null;
    }
}

module.exports = Package;
