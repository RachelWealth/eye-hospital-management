import path from 'path';

import fs from 'fs-extra';
import beautify from 'json-beautify';

import Base from '../Base.js';
import environment from '../environment.js';
import { Code } from '../exceptions.js';
import util from '../util.js';

const CONFIG_PATH = path.join(path.resolve(), 'configs/', environment.env, "/service.json");

/**
 * 服务配置
 */
export default class ServiceConfig extends Base {

    name = '';  //服务名称
    host = '';  //服务绑定主机地址
    port = 0;  //服务绑定端口
    urlPrefix = '';  //服务路由前缀
    bindAddress;  //服务绑定地址（外部访问地址）

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            name: v => util.defaultTo(v, "ave-aggregation-service"),
            host: v => util.defaultTo(v, "127.0.0.1"),
            port: v => Number(util.defaultTo(v, 3010)),
            urlPrefix: v => util.defaultTo(v, "")
        }, {
            name: util.isString,
            host: util.isString,
            port: util.isFinite,
            urlPrefix: util.isString,
            bindAddress: util.isString
        });
    }

    update(config = {}) {
        try {
            const _config = new ServiceConfig(util.merge({ ...this }, config));
            util.merge(this, _config);
        }
        catch(err) {
            throw new Error("service config invalid")
            .setCode(Code.ConfigInvalid).setMessage("服务配置非法，请检查配置内容")
        }
    }

    get addressHost() {
        if(this.bindAddress) return this.bindAddress;
        const ipAddresses = util.getIPAddressesByIPv4();
        for(let ipAddress of ipAddresses) {
            if(ipAddress === this.host)
                return ipAddress;
        }
        return ipAddresses[0] || "127.0.0.1";
    }

    get address() {
        return `${this.addressHost}:${this.port}`;
    }

    get pageDirUrl() {
        return `http://127.0.0.1:${this.port}/page`;
    }

    get publicDirUrl() {
        return `http://127.0.0.1:${this.port}/public`;
    }

    async save(filePath) {
        filePath = filePath || CONFIG_PATH;
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, beautify(this, null, 4));
    }

    static load(filePath) {
        filePath = filePath || CONFIG_PATH;
        const external = util.pickBy(environment, (v, k) => ["name", "host", "port"].includes(k) && !util.isUndefined(v));
        if(!fs.pathExistsSync(filePath)) return new ServiceConfig(external);
        const data = fs.readJSONSync(filePath);
        return new ServiceConfig({ ...data, ...external });
    }

    static create(value) {
        if(util.isUndefined(value)) return value;
        return ServiceConfig.isInstance(value) ? value : new ServiceConfig(value);
    }

    static isInstance(value) {
        return value instanceof ServiceConfig;
    }

}