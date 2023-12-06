import { Code, Message } from './exceptions.js';

const code = Code.SystemError;
Error.prototype._code = code;  //默认状态码
Error.prototype.message = Message[code];  //默认状态消息
TypeError.prototype._code = Code.ParamsInvalid;  //类型错误默认状态码
TypeError.prototype.message = Message[code];  //类型错误默认状态消息
Error.prototype.httpStatusCode = 200;  //默认HTTP状态码
Error.prototype.setCode = function(code) {
    this._code = code;
    this.message = Message[code] || this.message || "unknown error";
    return this;
};  //设置状态码原型扩展
Error.prototype.setMessage = function(message) {
    this.message = `${message}${this.message ? ": " + this.message : ""}`;
    return this;
};  //设置消息原型扩展
Error.prototype.setHTTPStatusCode = function(httpStatusCode) {
    this.httpStatusCode = httpStatusCode;
    return this;
};  //设置HTTP状态码原型扩展