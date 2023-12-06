import Base from '../../lib/Base.js';
import util from '../../lib/util.js';

export default class Request extends Base {

    method;  //请求方法
    url;  //请求URL
    path;  //请求路径
    type;  //请求载荷类型
    headers;  //请求headers
    search;  //请求原始查询字符串
    query;  //请求查询参数
    params;  //请求URL参数
    body;  //请求载荷
    files;  //上传的文件
    remoteAddress;  //客户端地址
    time = 0;  //请求接受时间

    constructor(ctx, options = {}) {
        super();
        this.optionsInject(options, {
            time: v => Number(util.defaultTo(v, util.timestamp()))
        }, {
            time: util.isTimestamp
        });
        this.init(ctx);
    }

    init(ctx) {
        this.method = ctx.request.method;
        this.url = ctx.request.url;
        this.path = ctx.request.path;
        this.type = ctx.request.type;
        this.headers = ctx.request.headers || {};
        this.search = ctx.request.search;
        this.query = ctx.query || {};
        this.params = ctx.params || {};
        this.body = ctx.request.body || {};
        this.files = ctx.request.files || {};
        this.remoteAddress = this.headers["X-Real-IP"] || this.headers["x-real-ip"] || this.headers["X-Forwarded-For"] || this.headers["x-forwarded-for"] || ctx.ip || null;
    }


}