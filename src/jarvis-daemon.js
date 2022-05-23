var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/resources/helpers';
import { getService, ServiceName } from '/resources/service';
/** @param {NS} ns **/
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const log = new Log(ns);
        const jarvis = new Jarvis(ns, log);
        yield jarvis.startService(ServiceName.Network);
        //ns.closeTail();
    });
}
class Jarvis {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
    }
    startService(serviceName) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceFile = `/resources/${ServiceName[serviceName].toLowerCase()}-service.js`;
            this.ns.run(serviceFile, 1);
            this.network = yield getService(this.ns, serviceName);
        });
    }
}
//# sourceMappingURL=jarvis-daemon.js.map