import Body from './Body.js';;
import util from '../../lib/util.js';
import { Code } from '../../lib/exceptions.js';

export default class FailureBody extends Body {
    
    constructor(error, data) {
        if(util.isString(error)) error = new Error(error);
        super({
            code: util.isFinite(error._code) ? error._code : Code.ServerError,
            message: error.message,
            data,
            statusCode: error.httpStatusCode
        });
    }

    static isInstance(value) {
        return value instanceof FailureBody;
    }

}