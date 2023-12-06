import Base from '../Base.js';
import util from '../util.js';

/**
 * 请求器配置
 */
export default class RequesterConfig extends Base {

    timeout = 0;  //请求超时时间
    downloadTimeout = 0;  //下载超时时间

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            timeout: v => Number(util.defaultTo(v, 60000)),
            downloadTimeout: v => Number(util.defaultTo(v, 300000))
        }, {
            timeout: util.isFinite,
            downloadTimeout: util.isFinite
        });
    }

    static create(value) {
        if(util.isUndefined(value)) return value;
        return RequesterConfig.isInstance(value) ? value : new RequesterConfig(value);
    }

    static isInstance(value) {
        return value instanceof RequesterConfig;
    }

}