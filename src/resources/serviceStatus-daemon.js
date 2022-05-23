var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getService, ServiceName } from '/resources/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        yield new ServiceStatus(ns).start();
    });
}
class ServiceStatus {
    constructor(ns) {
        this.ns = ns;
        this.ns.atExit(this.tearDown.bind(this));
        const doc = eval('document');
        this.headerHook = doc.getElementById('overview-extra-hook-0');
        this.valueHook = doc.getElementById('overview-extra-hook-1');
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.running = true;
            while (this.running) {
                try {
                    const serviceStatusAsArray = [...yield this.getAllServiceStatus()];
                    this.headerHook.innerText = serviceStatusAsArray.map(n => n[0]).join(' \n');
                    this.valueHook.innerText = serviceStatusAsArray.map(n => n[1]).join('\n');
                }
                catch (err) {
                    this.ns.print('ERROR: Update Skipped: ' + String(err));
                }
                yield this.ns.asleep(1000);
            }
            this.tearDown();
        });
    }
    getAllServiceStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let serviceStatusMap = new Map();
            for (const serviceFile of this.getServiceList()) {
                const serviceName = this.getServiceNameFromServiceFile(serviceFile);
                this.deployer = yield getService(this.ns, ServiceName.Deployer);
                const serviceStatus = this.deployer.checkIfScriptRunning(serviceFile);
                serviceStatusMap.set(serviceName, serviceStatus ? '✅' : '🔴');
            }
            return serviceStatusMap;
        });
    }
    getServiceList() {
        return this.ns.ls('home', '-service.js');
    }
    getServiceNameFromServiceFile(serviceFile) {
        const regExp = /\/resources\/(.*)-service.js/;
        const serviceName = regExp.exec(serviceFile)[1];
        return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }
    tearDown() {
        this.running = false;
        this.headerHook.innerText = '';
        this.valueHook.innerText = '';
        this.ns.closeTail();
    }
}
//# sourceMappingURL=serviceStatus-daemon.js.map