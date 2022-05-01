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
import { Install } from '/resources/install';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const install = new InstallSherlock(ns, new Log(ns));
        yield install.downloadPackage();
        yield install.precomputeStaticValues();
        install.launchDaemon();
    });
}
class InstallSherlock extends Install {
    constructor(ns, log) {
        super(ns, log);
    }
    precomputeStaticValues(hostname = this.hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            const staticValues = {
                packageName: this.packageName,
                hostname: hostname,
                network: this.mapNetwork(),
            };
            const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
            yield this.ns.write(initFile, JSON.stringify(staticValues), 'w');
            if (hostname !== this.hostname) {
                yield this.ns.scp(initFile, hostname);
            }
        });
    }
    mapNetwork() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let infiniteLoopProtection = 999;
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.ns.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
}
//# sourceMappingURL=sherlock-install.js.map