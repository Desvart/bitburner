var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/pkg.helpers';
import { getService, ServiceName } from '/services/service';
const CONFIG = {
    CYCLE_TIME: 2000, //60 * 1000, //ms
};
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const log = new Log(ns);
        const jarvis = new Jarvis(ns, log);
        if (ns.args[0] === 'reset') {
            yield jarvis.startServices();
            jarvis.killAllScript();
            jarvis.removePreviousFiles();
        }
        yield jarvis.startServices();
        while (!jarvis.areAllDaemonsRunning()) {
            jarvis.nukeServers();
            if (!jarvis.isDaemonRunning('hacknet')) {
                yield jarvis.startDaemon('hacknet');
            }
            if (!jarvis.isDaemonRunning('shiva')) {
                yield jarvis.startDaemon('shiva');
            }
            if (!jarvis.isDaemonRunning('sherlock')) {
                yield jarvis.startDaemon('sherlock');
            }
            if (jarvis.isDaemonRunning('wolfstreet')) {
                yield jarvis.startDaemon('wolfstreet');
            }
            yield jarvis.waitNCycles();
        }
    });
}
class Jarvis {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
    }
    startServices() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ns.exec('/resources/serviceStatus-daemon.js', 'home');
            this.ns.exec('/resources/player-service.js', 'home');
            yield this.ns.sleep(500);
            this.ns.exec('/resources/network-service.js', 'home');
            yield this.ns.sleep(500);
            this.ns.exec('/resources/deployer-service.js', 'home');
            yield this.ns.sleep(500);
            this.deployer = getService(this.ns, ServiceName.Deployer);
            this.network = getService(this.ns, ServiceName.Network);
        });
    }
    nukeServers() {
        this.network.servers.filter(n => n.canBeNuked()).forEach(n => n.nuke());
    }
    isDaemonRunning(daemonName) {
        let allProcessesName = [];
        for (const server of this.network.servers) {
            allProcessesName.push(...this.ns.ps(server.hostname).map(p => p.filename));
        }
        return allProcessesName.filter(fileName => fileName.includes(daemonName + '-daemon')).length > 0;
    }
    areAllDaemonsRunning() {
        const daemonList = ['hacknet', 'shiva', 'sherlock', 'wolfstreet'];
        return !daemonList.some(d => !this.isDaemonRunning(d));
    }
    startDaemon(daemonName) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = this.ns.ls('home', daemonName);
            let setupScript = '';
            let setupRam = 0;
            if (files.includes('-setup')) {
                setupScript = `/${daemonName}/${daemonName}-setup.js`;
                setupRam = this.ns.getScriptRam(setupScript, 'home');
            }
            let daemonScript = `/${daemonName}/${daemonName}-daemon.js`;
            let daemonRam = this.ns.getScriptRam(daemonScript, 'home');
            let startingScript = setupScript || daemonScript;
            const daemonJob = {
                script: startingScript,
                dependencies: files.filter(f => f !== startingScript),
                scriptRam: Math.max(setupRam, daemonRam)
            };
            return yield this.deployer.deploy(daemonJob);
        });
    }
    waitNCycles(mult = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(CONFIG.CYCLE_TIME * mult);
        });
    }
    killAllScript() {
        for (const server of this.network.servers) {
            if (server.hostname === 'home')
                continue;
            this.ns.killall(server.hostname);
        }
    }
    removePreviousFiles() {
        for (const server of this.network.servers) {
            if (server.hostname === 'home')
                continue;
            const files = this.ns.ls(server.hostname);
            if (files.length > 0)
                this.log.info(`${server.hostname.toUpperCase()} - ${files.length} files detected:\n${files.join(', ')}`);
            for (let file of files) {
                if (file.includes('.js') || file.includes('-init.txt')) {
                    if (this.ns.rm(file, server.hostname) === true) {
                        this.log.info(`SUCCESS - File ${file} deleted.`);
                    }
                    else {
                        this.log.info(`ERROR - Couldn't delete file ${file}.`);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=jarvis-daemon.js.map