import Base from './Base.js';
import ServiceConfig from './configs/ServiceConfig.js';
import SystemConfig from './configs/SystemConfig.js';
import MongodbConfig from './configs/MongodbConfig.js';


class Config extends Base {

    service;
    system;
    mongodb;

    constructor(options = {}) {
        super();
        this.optionsInject(options, {
            service: ServiceConfig.create,
            system: SystemConfig.create,
            mongodb: MongodbConfig.create
        }, {
            service: ServiceConfig.isInstance,
            system: SystemConfig.isInstance,
            mongodb: MongodbConfig.isInstance
        });
    }

    load() {
        this.service = ServiceConfig.load();
        this.system = SystemConfig.load();
        this.mongodb = MongodbConfig.load();
        return this;
    }

    update(config = {}) {
        this.service.update(config.service);
        this.system.update(config.system);
        this.mongodb.update(config.mongodb);
    }

    async save() {
        await this.service.save();
        await this.system.save();
        await this.mongodb.save();
    }

}

export default new Config().load();