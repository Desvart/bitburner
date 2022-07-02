var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Player } from '/services/player';
/**
 * This script improves the Overview panel by adding 2 new sections. The first section displays various assets and a
 * status describing if the asset is already owned or not yet. The second section list all existing services and their
 * activation status.
 */
const FLAGS = [
    ['refreshRate', 1000],
    ['help', false]
];
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        /*ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();*/
        const flags = ns.flags(FLAGS);
        if (flags.help) {
            ns.tprint(`This script monitors the player characteristics and the services status.`);
            ns.tprint(`USAGE: run ${ns.getScriptName()}`);
            return;
        }
        yield new Monitor(ns).start(flags.refreshRate);
    });
}
// noinspection DuplicatedCode
class Monitor {
    constructor(ns) {
        this.ns = ns;
        this.ns.atExit(this.tearDown.bind(this));
        const doc = eval('document');
        this.headerHook = doc.getElementById('overview-extra-hook-0');
        this.valueHook = doc.getElementById('overview-extra-hook-1');
        this.network = this.retrieveNetwork();
    }
    start(refreshRate) {
        return __awaiter(this, void 0, void 0, function* () {
            this.running = true;
            while (this.running) {
                try {
                    const elementsToMonitorAsArray = [...yield this.getElementsToMonitor()];
                    this.headerHook.innerText = elementsToMonitorAsArray.map(n => n[0]).join(' \n');
                    this.valueHook.innerText = elementsToMonitorAsArray.map(n => n[1]).join('\n');
                }
                catch (err) {
                    this.ns.print('ERROR: Update Skipped: ' + String(err));
                }
                yield this.ns.asleep(refreshRate);
            }
            this.tearDown();
        });
    }
    getElementsToMonitor() {
        return __awaiter(this, void 0, void 0, function* () {
            let elementsToMonitorMap = new Map();
            const player = new Player(this.ns);
            elementsToMonitorMap.set(' ', ' ');
            elementsToMonitorMap.set('ASSETS____', '__________');
            elementsToMonitorMap.set('Ports key', `${player.portsKeyCount}/5`);
            elementsToMonitorMap.set('TOR', player.software.tor ? '✅' : '🔴');
            elementsToMonitorMap.set('Formulas', player.software.formulas ? '✅' : '🔴');
            elementsToMonitorMap.set('Market WSE', player.market.wse.wse && player.market.wse.fourSigma ? '✅' : '🔴');
            elementsToMonitorMap.set('Market API', player.market.api.tix && player.market.api.fourSigma ? '✅' : '🔴');
            elementsToMonitorMap.set('  ', ' ');
            elementsToMonitorMap.set('SERVICES__', '__________');
            for (const serviceFile of this.getServiceList()) {
                const serviceName = this.getServiceNameFromServiceFile(serviceFile);
                const serviceStatus = this.checkIfScriptRunning(serviceFile);
                elementsToMonitorMap.set(serviceName, serviceStatus ? '✅' : '🔴');
            }
            return elementsToMonitorMap;
        });
    }
    getServiceList() {
        return this.ns.ls('home', '-service.js');
    }
    getServiceNameFromServiceFile(serviceFile) {
        const regExp = /\/services\/(.*)-service.js/;
        const serviceName = eval('regExp.exec(serviceFile)[1]');
        return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }
    checkIfScriptRunning(serviceFile) {
        return this.network
            .filter(hostname => this.ns.ps(hostname)
            .filter(process => process.filename === serviceFile)
            .length > 0)
            .length > 0;
    }
    retrieveNetwork() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let maxLoop = 999;
        while (nodesToScan.length > 0 && maxLoop-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.ns.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames)
                if (!discoveredNodes.includes(connectedNodeName))
                    nodesToScan.push(connectedNodeName);
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
    tearDown() {
        this.running = false;
        this.headerHook.innerText = '';
        this.valueHook.innerText = '';
        this.ns.closeTail();
    }
}
//# sourceMappingURL=monitor-overview-daemon.js.map