const Code = {

    //系统级错误 1000-1999
    SystemError: 1000,
    ConfigInvalid: 1001,

    //服务器错误 2000 - 2999
    ServerError: 2000,  //服务器错误
    RequestBodyInvalid: 2001,  //请求载荷数据非法
    RequestNotSupported: 2002,  //请求不受支持
    ResponseIsInvalid: 2003,  //响应体非法

};
const Message = {

    //系统级错误
    [Code.SystemError]: "系统错误，请联系管理员",
    [Code.ConfigInvalid]: "配置非法，请检查配置内容",

    //服务器错误
    [Code.ServerError]: "服务器错误，请联系管理员",
    [Code.RequestBodyInvalid]: "请求载荷非法，请检查数据格式",
    [Code.RequestNotSupported]: "服务器不支持此请求",
    [Code.ResponseIsInvalid]: "服务器响应非法，请联系管理员",

};
export { Code, Message };
export default { Code, Message };