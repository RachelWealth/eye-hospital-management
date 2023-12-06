import path from 'path';

import fs from 'fs-extra';
import minimist from 'minimist';

import Base from './Base.js';
import util from './util.js';

const cmdArgs = minimist(process.argv.slice(2));  //获取命令行参数
const envVars = process.env;  //获取环境变量

class Environment extends Base {

    cmdArgs;  //命令行参数
    envVars;  //环境变量
    env = '';  //运行环境
    name;  //服务名称
    host;  //服务地址
    port;  //服务端口
    package;  //包参数

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            env: v => util.defaultTo(v, "development"),
            port: Number
        }, {
            cmdArgs: util.isObject,
            envVars: util.isObject,
            env: util.isString,
            name: util.isString,
            host: util.isString,
            port: util.isFinite,
            package: util.isObject
        });
    }

}

export default new Environment({
    cmdArgs,
    envVars,
    env: cmdArgs.env || envVars.AGGREGATION_ENV,
    name: cmdArgs.name || envVars.AGGREGATION_NAME,
    host: cmdArgs.host || envVars.AGGREGATION_HOST,
    port: cmdArgs.port || envVars.AGGREGATION_PORT,
    package: JSON.parse(fs.readFileSync(path.join(path.resolve(), "package.json")).toString())
});