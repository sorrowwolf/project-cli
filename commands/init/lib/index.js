'use strict';

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const fse = require("fs-extra");
const semver = require("semver");
const userHome = require("user-home");
const Command = require("@sorrow-cli-dev/command");
const Package = require("@sorrow-cli-dev/package");
const { spinnerStart, sleep } = require("@sorrow-cli-dev/utils");
const log = require('@sorrow-cli-dev/log');
const getProjectTemplate = require("./getProjectTemplate");

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

class InitCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }
    async exec() {
        try {
            // 1. 准备阶段
            const projectInfo = await this.prepare();
            if (projectInfo) {
                // 2. 下载模板
                log.verbose('projectInfo', projectInfo);
                this.projectInfo = projectInfo;
                await this.downloadTemplate();
                // 3. 安装模板
                await this.installTemplate();
            }
        } catch (e) {
            log.error(e.message);
        }
    }

    async installTemplate() {
        if (this.templateInfo) {
            if (!this.templateInfo.type) {
                this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
            }
            if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
                // 标准安装
            } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
                // 自定义安装
            } else {
                throw new Error('项目模板类型无法识别!');
            }
        } else {
            throw new Error('项目模板不存在!');
        }
    }

    async installNormalTemplate() {

    }

    async installCustomTemplate() {

    }

    async downloadTemplate() {
        // 1. 通过项目模板API获取项目模板信息
        // 1.1 通过egg.js搭建一套后端系统
        // 1.2 通过npm存储项目模板  (vue-cli/vue-element-admin)
        // 1.3 将项目模板信息存储到mongodb数据库中
        // 1.4 通过egg.js获取mongodb中的数据并且通过API返回
        const { projectTemplate } = this.projectInfo;
        const templateInfo = this.template.find(item => item.npmName === projectTemplate);
        const targetPath = path.resolve(userHome, '.sorrow-cli-dev', 'template');
        const storeDir = path.resolve(userHome, '.sorrow-cli-dev', 'template', 'node_modules');
        const { npmName, version } = templateInfo;
        const templateNpm = new Package({
            targetPath,
            storeDir,
            packageName: npmName,
            packageVersion: version,
        })
        this.templateInfo = templateInfo;
        if (! await templateNpm.exists()) {
            const spinner = spinnerStart('正在下载模板...');
            await sleep();
            try {
                await templateNpm.install();
            } catch (error) {
                throw error;
            } finally {
                spinner.stop(true);
                if (await templateNpm.exists()) {
                    log.success('下载模板成功');
                }
            }
        } else {
            const spinner = spinnerStart('正在更新模板...');
            await sleep();
            try {
                await templateNpm.update();
                
            } catch (error) {
                throw error;
            } finally {
                spinner.stop(true);
                if (await templateNpm.exists()) {
                    log.success('更新模板成功');
                }
            }
        }
    }
    async prepare() {
        // 判断项目模板是否存在
        const template = await getProjectTemplate();
        if (!template || template.length === 0) {
            throw new Error('项目模板不存在');
        }
        this.template = template;
        const localPath = process.cwd();
        // 1. 判断当前目录是否为空
        if (!this.isCwdEmpty(localPath)) {
            let ifContinue = false;
            if (!this.force) {
                // 1.1 询问是否继续创建
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: '当前文件夹不为空，是否继续创建项目?'
                })).ifContinue;
                if (!ifContinue) return;
            }
            // 2. 是否启动强制更新
            if (ifContinue || this.force) {
                // 二次确认
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '是否确认清空当前目录下的文件?'
                })
                if (confirmDelete) {
                    // 清空当前目录
                    fse.emptyDirSync(localPath);
                }
            }
        }
        // 3. 选择创建项目或组件
        // 4. 获取项目的基本信息
        return this.getProjectInfo();
    }

    async getProjectInfo() {
        let projectInfo = {};
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                {
                    name: '项目',
                    value: TYPE_PROJECT,
                },
                {
                    name: '组件',
                    value: TYPE_COMPONENT,
                }
            ]
        })
        log.verbose('type', type);
        if (type === TYPE_PROJECT) {
            const project = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'projectName',
                    message: '请输入项目名称',
                    default: '',
                    validate: function(v) {
                        // 1. 首字符必须为英文字符
                        // 2. 尾字符必须为英文或数字，不能为字符
                        // 3. 字符只允许为'-_'
                        const done = this.async();
                        setTimeout(() => {
                            if (!/^[a-zA-Z]+[\w-]*[a-zA-Z0-9]$/.test(v)) {
                                done('请输入合法的项目名称');
                                return;
                            }
                            done(null, true);
                        }, 0)
                    },
                    filter: function(v) {
                        return v;
                    }
                },
                {
                    type: 'input',
                    name: 'projectVersion',
                    message: '请输入项目版本号',
                    default: '1.0.0',
                    validate: function(v) {
                        const done = this.async();
                        setTimeout(() => {
                            if (!(!!semver.valid(v))) {
                                done('请输入合法的版本号');
                                return;
                            }
                            done(null, true);
                        }, 0)
                    },
                    filter: function(v) {
                        if (!!semver.valid(v)) {
                            return semver.valid(v)
                        } else {
                            return v;
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'projectTemplate',
                    message: '请选择项目模板',
                    choices: this.createTemplateChoice()
                }
            ])
            projectInfo = {
                type,
                ...project
            }
        } else if (type === TYPE_COMPONENT) {

        }
        return projectInfo;
    }

    isCwdEmpty(localPath) {
        let fileList = fs.readdirSync(localPath);
        fileList = fileList.filter(file => (
            !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
        ));
        return !fileList || fileList.length <= 0;
    }

    createTemplateChoice() {
        return this.template.map(item => ({
            name: item.name,
            value: item.npmName
        }))
    }
}

function init(argv) {
    return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
