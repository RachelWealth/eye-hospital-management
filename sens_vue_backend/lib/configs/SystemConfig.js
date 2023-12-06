import path from 'path';

import fs from 'fs-extra';
import beautify from 'json-beautify';

import Base from '../Base.js';
import RequesterConfig from './RequesterConfig.js';
import RequestBodyConfig from './RequestBodyConfig.js';
import environment from '../environment.js';
import { Code } from '../exceptions.js';
import util from '../util.js';

const CONFIG_PATH = path.join(path.resolve(), 'configs/', environment.env, "/system.json");

/**
 * 系统配置
 */
export default class SystemConfig extends Base {

    enableNaming = false;  //是否启用服务注册
    requestLog = false;  //是否开启请求日志
    tmpDir = '';  //临时目录路径
    logDir = '';  //日志目录路径
    logWriteInterval = 0;  //日志写入间隔（毫秒）
    logFileExpires = 0;  //日志文件有效期（毫秒）
    requester = {};  //请求器配置
    requestBody = {};  //请求体配置
    debug = false;  //是否开启系统调试

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            enableNaming: v => util.defaultTo(v, false),
            requestLog: v => util.defaultTo(v, false),
            tmpDir: v => util.defaultTo(v, "./tmp"),
            logDir: v => util.defaultTo(v, "./logs"),
            logWriteInterval: v => Number(util.defaultTo(v, 500)),
            logFileExpires: v => Number(util.defaultTo(v, 2626560000)),
            requester: v => RequesterConfig.create(util.defaultTo(v, {})),
            requestBody: v => RequestBodyConfig.create(util.defaultTo(v, {})),
            debug: v => util.defaultTo(v, false)
        }, {
            enableNaming: util.isBoolean,
            requestLog: util.isBoolean,
            tmpDir: util.isString,
            logDir: util.isString,
            logWriteInterval: util.isFinite,
            logFileExpires: util.isFinite,
            requester: RequesterConfig.isInstance,
            requestBody: RequestBodyConfig.isInstance,
            debug: util.isBoolean,
        });
    }

    update(config = {}) {
        try {
            const _config = new SystemConfig(util.merge({ ...this }, config));
            util.merge(this, _config);
        }
        catch(err) {
            throw new Error("system config invalid")
            .setCode(Code.ConfigInvalid).setMessage("系统配置非法，请检查配置内容")
        }
    }

    get rootDirPath() {
        return path.resolve();
    }

    get tmpDirPath() {
        return path.resolve(this.tmpDir);
    }

    get logDirPath() {
        return path.resolve(this.logDir);
    }

    async save(filePath) {
        filePath = filePath || CONFIG_PATH;
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, beautify(this, null, 4));
    }

    static load(filePath) {
        filePath = filePath || CONFIG_PATH;
        if (!fs.pathExistsSync(filePath)) return new SystemConfig();
        const data = fs.readJSONSync(filePath);
        return new SystemConfig(data);
    }

    static create(value) {
        if (util.isUndefined(value)) return value;
        return SystemConfig.isInstance(value) ? value : new SystemConfig(value);
    }

    static isInstance(value) {
        return value instanceof SystemConfig;
    }

}