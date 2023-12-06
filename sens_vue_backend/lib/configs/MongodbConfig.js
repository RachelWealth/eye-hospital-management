import path from 'path';

import fs from 'fs-extra';
import beautify from 'json-beautify';

import Base from '../Base.js';
import environment from '../environment.js';
import util from '../util.js';

const CONFIG_PATH = path.join(path.resolve(), 'configs/', environment.env, "/mongodb.json");

/**
 * MongoDB配置
 */
export default class MognodbConfig extends Base {

    host;
    port;
    username;
    password;

    constructor(options = {}) {
        super();
        this.optionsInject(options, {}, {
            host: util.isString,
            port: util.isFinite,
            username: util.isString,
            password: util.isString
        });
    }

    async save(filePath) {
        filePath = filePath || CONFIG_PATH;
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, beautify(this, null, 4));
    }

    static load(filePath) {
        filePath = filePath || CONFIG_PATH;
        if(!fs.pathExistsSync(filePath)) return new MognodbConfig();
        const data = fs.readJSONSync(filePath);
        return new MognodbConfig(data);
    }

    static create(value) {
        if(util.isUndefined(value)) return value;
        return MognodbConfig.isInstance(value) ? value : new MognodbConfig(value);
    }

    static isInstance(value) {
        return value instanceof MognodbConfig;
    }

}