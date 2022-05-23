var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var ServiceName;
(function (ServiceName) {
    ServiceName[ServiceName["Network"] = 10] = "Network";
    ServiceName[ServiceName["Deployer"] = 11] = "Deployer";
    ServiceName[ServiceName["ThreadPool"] = 12] = "ThreadPool";
    ServiceName[ServiceName["ShivaOptimizer"] = 13] = "ShivaOptimizer";
})(ServiceName || (ServiceName = {}));
const CONFIG = {
    MAX_RETRY: 10,
    SLEEP_DURATION: 100, // ms
};
export function getService(ns, serviceName) {
    return __awaiter(this, void 0, void 0, function* () {
        const portHandle = ns.getPortHandle(serviceName);
        let tries = CONFIG.MAX_RETRY;
        while (portHandle.empty() && tries-- > 0) {
            yield ns.asleep(CONFIG.SLEEP_DURATION);
        }
        return portHandle.empty() ? null : portHandle.peek();
    });
}
export class Service {
    constructor(ns, log, portId = 1, obj) {
        this.ns = ns;
        this.log = log;
        this.portId = portId;
        this.portHandle = this.ns.getPortHandle(portId);
        this.publishObject(obj);
    }
    publishObject(obj) {
        this.object = obj;
        this.objectName = obj.constructor.name;
        this.portHandle.clear();
        this.portHandle.write(this.object);
        this.ns.atExit(this.tearDown.bind(this));
        this.log.info(`Service ${this.objectName} started on port ${this.portId}`);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.operational = true;
            while (this.operational) {
                yield this.ns.asleep(1000);
            }
            this.tearDown();
        });
    }
    tearDown() {
        this.operational = false;
        this.portHandle.read();
        this.log.info(`Service ${this.objectName} stopped on port ${this.portId}`);
        this.ns.closeTail();
    }
}
//# sourceMappingURL=service.js.map