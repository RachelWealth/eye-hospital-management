import mime from 'mime';

import Base from '../../lib/Base.js';
import Body from './Body.js';
import util from '../../lib/util.js';

export default class Response extends Base {

    statusCode;  //响应HTTP状态码
    type;  //响应内容类型
    headers;  //响应headers
    redirect;  //重定向目标
    body;  //响应载荷
    size;  //响应载荷大小
    time = 0;  //响应时间

    constructor(body, options = {}) {
        super();
        this.optionsInject(options, {
            statusCode: v => Number(util.defaultTo(v, Body.isInstance(body) ? body.statusCode : undefined)),
            time: v => Number(util.defaultTo(v, util.timestamp()))
        }, {
            statusCode: util.isFinite,
            type: util.isString,
            headers: util.isObject,
            redirect: util.isString,
            size: util.isFinite,
            time: util.isTimestamp
        });
        this.body = body;
    }

    injectTo(ctx) {
        this.redirect && ctx.redirect(this.redirect);
        this.statusCode && (ctx.status = this.statusCode);
        this.type && (ctx.type = mime.getType(this.type) || this.type);
        const headers = this.headers || {};
        if(this.size && !headers["Content-Length"] && !headers["content-length"])
            headers["Content-Length"] = this.size;
        ctx.set(headers);
        if(Body.isInstance(this.body))
            ctx.body = this.body.toObject();
        else
            ctx.body = this.body;
    }

    static isInstance(value) {
        return value instanceof Response;
    }

}