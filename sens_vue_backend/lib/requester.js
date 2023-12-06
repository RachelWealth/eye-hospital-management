import fs from 'fs-extra';
import axios from 'axios';

import Base from './Base.js';
import RequesterConfig from './configs/RequesterConfig.js';
import config from './config.js';
import logger from './logger.js';
import util from './util.js';

import HTTP_STATUS_CODE from './http-status-codes.js';

class Requester extends Base {

    config = {};

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            config: RequesterConfig.create
        }, {
            config: RequesterConfig.isInstance
        });
    }

    async get(url, options = {}) {
        if (!util.isString(url)) throw new TypeError("url must be an string");
        if (!util.isObject(options)) throw new TypeError("options must be an Object");
        return await this.request("GET", url, options);
    }

    async post(url, data = {}, options = {}) {
        if (!util.isString(url)) throw new TypeError("url must be an string");
        if (!util.isBuffer(data) && !util.isString(data) && !util.isObject(data)) throw new TypeError("data must be an Buffer/String/Object");
        if (!util.isObject(options)) throw new TypeError("options must be an Object");
        return await this.request("POST", url, { data, ...options });
    }

    async put(url, data = {}, options = {}) {
        if (!util.isString(url)) throw new TypeError("url must be an string");
        if (!util.isBuffer(data) && !util.isString(data) && !util.isObject(data)) throw new TypeError("data must be an Buffer/String/Object");
        if (!util.isObject(options)) throw new TypeError("options must be an Object");
        return await this.request("PUT", url, { data, ...options });
    }

    async patch(url, data = {}, options = {}) {
        if (!util.isString(url)) throw new TypeError("url must be an string");
        if (!util.isBuffer(data) && !util.isString(data) && !util.isObject(data)) throw new TypeError("data must be an Buffer/String/Object");
        if (!util.isObject(options)) throw new TypeError("options must be an Object");
        return await this.request("PATCH", url, { data, ...options });
    }

    async delete(url, data = {}, options = {}) {
        if (!util.isString(url)) throw new TypeError("url must be an string");
        if (!util.isBuffer(data) && !util.isString(data) && !util.isObject(data)) throw new TypeError("data must be an Buffer/String/Object");
        if (!util.isObject(options)) throw new TypeError("options must be an Object");
        return await this.request("DELETE", url, { data, ...options });
    }

    async head(url, options = {}) {
        return await this.request("HEAD", url, options);
    }

    async download(method, url, dest, options = {}) {
        let stream;
        if(util.isString(dest))
            stream = fs.createWriteStream(dest);
        else if(util.isWriteStream(dest))
            stream = dest;
        else
            throw new TypeError("dest must be an writeStream or path");
        const downloadTimeout = this.config.downloadTimeout;
        const startTime = util.timestamp();
        const result = await new Promise(resolve => {
            this.request(method, url, {
                responseType: "stream",
                maxContentLength: Infinity,  //解除大小限制
                timeout: downloadTimeout,
                ...options
            })
                .then(response => {
                    const { status, statusText, headers, data } = response;
                    const isExceptionResponse = !/\.json/.test(url) && headers["content-type"] === "application/json";
                    if (status !== HTTP_STATUS_CODE.OK || isExceptionResponse) {  //如果返回值不是200或非json文件却返回json字符串则作为异常处理
                        let message;
                        try { message = data.read().toString() } catch (err) { message = "request error" };
                        return resolve(new Error(`file ${url} download failed: [${status}] ${statusText} -> ${message}`));
                    }
                    let timer;
                    Promise.race([
                        new Promise(resolve => {
                            stream.once("error", resolve);
                            stream.once("finish", resolve);
                        }),
                        new Promise((_, reject) =>
                            timer = setTimeout(() => reject(new Error(`file ${url} download timeout`)), downloadTimeout - (util.timestamp() - startTime)))
                    ])
                        .finally(() => clearTimeout(timer))
                        .then(resolve)
                        .catch(resolve);
                    data.pipe(stream);
                })
                .catch(err => {
                    stream.end();
                    if(util.isString(dest)) {
                        fs.remove()
                        .finally(() => resolve(err))
                        .catch(err => logger.error("remove undownloaded file error:", err));
                    }
                    else
                        resolve(err);
                });
        });
        if(util.isError(result)) {
            if(util.isString(dest)) {
                await new Promise(resolve => {
                    fs.remove(dest)
                    .finally(resolve)
                    .catch(err => logger.error("remove undownloaded file error:", err));
                });
            }
            throw result;
        }
        return result;
    }

    async request(method, url, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                axios.request({
                    method,
                    url,
                    ...(this.config || { timeout: 60000 }),
                    ...options
                })
                .then(response => resolve(this.responseHandle(response)))
                .catch(err => {
                    if (util.isObject(err.response))
                        resolve(this.responseHandle(err.response));
                    else
                        reject(new Error(`\nRequest Error:\nURL: [${method}] ${url}\nError: ${err.message}`));
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }

    responseHandle(response) {
        const result = util.pick(response, ["status", "statusText", "data", "headers"]);
        result.isSuccessfully = function() { return this.status < 400 };
        result.isFailed = function() { return this.status >= 400 };
        result.getType = function() {
            const contentType = this.headers["content-type"] || this.headers["Content-Type"];
            if(!contentType) return;
            return contentType.split(";")[0];
        };
        result.isJSON = function() { return this.getType() === "application/json" };
        result.isXML = function() { return ["text/xml", "application/xml"].includes(this.getType()) }
        return result;
    }

}

export default new Requester({ config: config.system.requester });