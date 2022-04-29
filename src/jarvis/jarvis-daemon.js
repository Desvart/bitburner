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
import { Server } from '/jarvis/server';
const CONFIG = {
    CYCLE_TIME: 12000,
    HACKNET_HOST: 'foodnstuff',
    KITTYCAT_HOSTS: ['n00dles', 'foodnstuff'],
    WORM_HOSTS: ['nectar-net', 'sigma-cosmetics', 'harakiri-sushi'],
    SHERLOCK_HOST: 'hong-fang-tea',
    C2_HOST: 'joesguns',
    WOLFSTREET_HOST: '?',
};
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const jarvis = new Jarvis(ns, new Log(ns));
        jarvis.nukeWeakServers();
        if (!jarvis.isDaemonFullyDeployed('hacknet')) {
            yield jarvis.releaseDaemon('hacknet', CONFIG.HACKNET_HOST);
        }
        if (!jarvis.isDaemonFullyDeployed('kittycat')) {
            yield jarvis.releaseDaemon('kittycat', CONFIG.KITTYCAT_HOSTS);
        }
        while (!jarvis.areAllServersOfGivenSizeHacked(16)) {
            yield jarvis.waitNCycles();
            if (jarvis.isThereAServersOfGivenSizeToHack(16)) {
                jarvis.nukeWeakServers();
                if (!jarvis.isDaemonFullyDeployed('worm')) {
                    yield jarvis.releaseDaemon('worm', CONFIG.WORM_HOSTS);
                }
            }
        }
        if (!jarvis.isDaemonFullyDeployed('sherlock')) {
            yield jarvis.releaseDaemon('sherlock', CONFIG.SHERLOCK_HOST); //TODO split script in two less than 16 GB RAM
        }
        if (!jarvis.isDaemonFullyDeployed('c2')) {
            yield jarvis.releaseDaemon('C2', CONFIG.C2_HOST);
        }
        while (!jarvis.areAllServersOfGivenSizeHacked(32)) {
            yield jarvis.waitNCycles(5);
            if (jarvis.isThereAServersOfGivenSizeToHack(32)) {
                jarvis.nukeWeakServers();
                if (jarvis.isDaemonFullyDeployed('wolfstreet')) {
                    yield jarvis.releaseDaemon('wolfstreet', CONFIG.WOLFSTREET_HOST);
                }
            }
        }
        while (!jarvis.isNetworkFullyOwned()) {
            yield jarvis.waitNCycles();
            jarvis.nukeWeakServers();
        }
    });
}
class Jarvis {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
        this.network = this.retrieveNetwork();
    }
    retrieveNetwork() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let loopProtection = 999;
        while (nodesToScan.length > 0 && loopProtection-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.ns.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (!discoveredNodes.map(n => n.hostname).includes(connectedNodeName)) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(new Server(this.ns, this.log, nodeName));
        }
        return discoveredNodes;
    }
    nukeWeakServers() {
        this.network.filter(n => n.isNukable()).forEach(n => n.nuke());
    }
    isDaemonFullyDeployed(daemonName) {
        let allProcessesName = [];
        for (const server of this.network) {
            allProcessesName.push(...this.ns.ps(server.hostname).map(p => p.filename));
        }
        return allProcessesName.filter(fileName => fileName.includes(daemonName + '-daemon')).length > 0;
    }
    releaseDaemon(daemonName, hostnames) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = [`/${daemonName}/${daemonName}-install.js`, '/resources/helpers.js'];
            if (typeof hostnames === 'string')
                hostnames = [hostnames];
            let globalStatus = true;
            for (const hostname of hostnames) {
                const scpStatus = yield this.ns.scp(files, hostname);
                const execStatus = this.ns.exec(files[0], hostname, 1);
                if (scpStatus === true && execStatus > 0) {
                    this.log.success(`JARVIS - ${daemonName} installer successfully uploaded on ${hostname}`);
                }
                else if (scpStatus === false || execStatus === 0) {
                    this.log.warn(`JARVIS - Couldn't upload ${daemonName} installer on ${hostname}`);
                    globalStatus = false;
                }
                else {
                    globalStatus = false;
                }
            }
            return globalStatus;
        });
    }
    waitNCycles(mult = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(CONFIG.CYCLE_TIME * mult);
        });
    }
    areAllServersOfGivenSizeHacked(size) {
        return !this.network.filter(n => n.ram === size).some(n => !n.hasRootAccess());
    }
    isThereAServersOfGivenSizeToHack(size) {
        return this.network.filter(n => n.ram === size).some(n => n.isNukable());
    }
    isNetworkFullyOwned() {
        return !this.network.filter(n => n.isPotentialTarget).some(n => !n.hasRootAccess());
    }
}
//# sourceMappingURL=jarvis-daemon.js.map