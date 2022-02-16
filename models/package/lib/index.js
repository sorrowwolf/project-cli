'use strict';

const path = require("path");
const { isObject } = require("@sorrow-cli-dev/utils");
const npminstall = require("npminstall");
const formatPath = require("@sorrow-cli-dev/format-path");
const { getDefaultRegistry } = require("@sorrow-cli-dev/get-npm-info");
const pkgDir = require("pkg-dir").sync;

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
        // 缓存 package 的路径
        this.storeDir = options.storeDir;
        // package 的name
        this.packageName = options.packageName;
        // package 的version
        this.packageVersion = options.packageVersion;
    }

    // 判断当前package是否存在
    exists() {

    }

    // 安装package
    install() {
        npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: this.version,
            }]
        })
    }

    // 更新package
    update() {

    }

    // 获取入口文件的路径
    getRootFilePath() {
        // 1. 获取package.json所在目录 -> pkg-dir
        const dir = pkgDir(this.targetPath);
        console.log(dir)
        if (dir) {
            // 2. 读取package.json - require()
            const pkgFile = require(path.resolve(dir, 'package.json'));
            // 3. main/lib - path
            if (pkgFile && pkgFile.main) {
                // 4, 路径的兼容(macOS/windows)
                return formatPath(path.resolve(dir, pkgFile.main));
            }
        }
        return null;
    }
}

module.exports = Package;
