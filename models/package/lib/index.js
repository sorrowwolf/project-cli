'use strict';

const path = require("path");
const fse = require("fs-extra");
const { isObject } = require("@sorrow-cli-dev/utils");
const npminstall = require("npminstall");
const pathExists = require("path-exists").sync;
const formatPath = require("@sorrow-cli-dev/format-path");
const { getDefaultRegistry, getNpmLatestVersion } = require("@sorrow-cli-dev/get-npm-info");
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
        // packge 的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }

    async prepare() {
        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirpSync(this.storeDir);
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName);
        }
    }

    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
    }

    getSpecificCacheFilePath(packageVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
    }

    // 判断当前package是否存在
    async exists() {
        if (this.storeDir) {
            await this.prepare()
            return pathExists(this.cacheFilePath);
        } else {
            return pathExists(this.targetPath);
        }
    }

    // 安装package
    async install() {
        await this.prepare();
        npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: this.packageVersion,
            }]
        })
    }

    // 更新package
    async update() {
        await this.prepare();
        // 1. 获取模块最新的版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName);
        // 2. 查询最新版本号对应的模块路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
        // 3. 如果不存在，则直接安装最新版本
        if (!pathExists(latestFilePath)) {
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                    name: this.packageName,
                    version: latestPackageVersion,
                }]
            })
            this.packageVersion = latestPackageVersion;
        } else {
            this.packageVersion = latestPackageVersion;
        }
    }

    // 获取入口文件的路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            // 1. 获取package.json所在目录 -> pkg-dir
            const dir = pkgDir(targetPath);
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
        if (this.storeDir) {
            return _getRootFile(this.cacheFilePath);
        } else {
            return _getRootFile(this.targetPath);
        }
    }
}

module.exports = Package;
