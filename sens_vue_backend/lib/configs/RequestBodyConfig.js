import Base from '../Base.js';
import util from '../util.js';

/**
 * 请求体解析配置
 */
export default class RequestBodyConfig extends Base {

    enableTypes = [];  //允许的请求体类型
    encoding = '';  //请求内容编码
    formLimit = '';  //表单请求体大小限制
    jsonLimit = '';  //JSON请求体大小限制
    textLimit = '';  //纯文本请求体大小限制
    xmlLimit = '';  //XML请求体大小限制
    formidable = {};  //formidable模块参数
    multipart = false;  //解析multipart体
    parsedMethods = false;  //解析正文的请求方法

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            enableTypes: v => util.defaultTo(v, ["json", "form", "text", "xml"]),
            encoding: v => util.defaultTo(v, "utf-8"),
            formLimit: v => util.defaultTo(v, "100mb"),
            jsonLimit: v => util.defaultTo(v, "100mb"),
            textLimit: v => util.defaultTo(v, "100mb"),
            xmlLimit: v => util.defaultTo(v, "100mb"),
            formidable: v => util.defaultTo(v, {
                maxFileSize: "1gb"
            }),
            multipart: v => util.defaultTo(v, true),
            parsedMethods: v => util.defaultTo(v, ["POST", "PUT", "PATCH"])
        }, {
            enableTypes: util.isArray,
            encoding: util.isString,
            formLimit: util.isString,
            jsonLimit: util.isString,
            textLimit: util.isString,
            xmlLimit: util.isString,
            formidable: util.isObject,
            multipart: util.isBoolean,
            parsedMethods: util.isArray
        });
    }

    static create(value) {
        if(util.isUndefined(value)) return value;
        return RequestBodyConfig.isInstance(value) ? value : new RequestBodyConfig(value);
    }

    static isInstance(value) {
        return value instanceof RequestBodyConfig;
    }

}