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
    ServiceName[ServiceName["Player"] = 10] = "Player";
    ServiceName[ServiceName["Network"] = 12] = "Network";
    ServiceName[ServiceName["Deployer"] = 14] = "Deployer";
    ServiceName[ServiceName["ThreadPool"] = 16] = "ThreadPool";
    ServiceName[ServiceName["ShivaOptimizer"] = 18] = "ShivaOptimizer";
})(ServiceName || (ServiceName = {}));
const CONFIG = {
    MAX_RETRY: 10,
    SLEEP_DURATION: 100, // ms
};
export function getService(ns, serviceName) {
    const portHandle = ns.getPortHandle(serviceName);
    return portHandle.empty() ? null : portHandle.peek();
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
    start() {
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