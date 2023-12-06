import { MongoClient } from 'mongodb';

import config from './config.js';

class Mongodb extends MongoClient {

    constructor(options) {
        super(`mongodb://${options.host}:${options.port}`, {
            auth: {
                username: options.username,
                password: options.pasword
            }
        });
    }

}

export default new Mongodb(config.mongodb)