import Base from '../../lib/Base.js';
import util from '../../lib/util.js';

export default class Body extends Base {

    code = 0;  //状态码
    message = '';  //状态消息
    data = {};  //数据
    statusCode = 0;  //HTTP状态码

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            code: Number,
            data: v => util.defaultTo(v, null),
            statusCode: v => Number(util.defaultTo(v, 200))
        }, {
            code: util.isFinite,
            message: util.isString,
            data: v => util.isNull(v) || util.isObject(v) || util.isString(v),
            statusCode: util.isFinite
        });
    }

    toObject() {
        return {
            code: this.code,
            message: this.message,
            data: this.data
        };
    }

    static isInstance(value) {
        return value instanceof Body;
    }

}