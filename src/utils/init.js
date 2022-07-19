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
import { Network } from '/services/network';
import { ServiceName } from '/services/service';
const FLAGS = [
    ['killall', false],
];
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags(FLAGS);
        const init = new Init(ns, new Log(ns));
        if (flags.killall) {
            const hostnames = Network.retrieveHostnames(ns);
            init.removePreviousFiles(hostnames);
            init.globalKillAll(hostnames);
        }
        yield init.startAllServices();
    });
}
class Init {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
    }
    startAllServices() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ns.exec('/utils/monitor-overview-daemon.js', 'home');
            yield this.ns.sleep(500);
            yield this.getService(ServiceName.Player);
            yield this.getService(ServiceName.Network);
            yield this.getService(ServiceName.Deployer);
        });
    }
    retrieveService(serviceName) {
        const portHandle = this.ns.getPortHandle(serviceName);
        return portHandle.empty() ? null : portHandle.peek();
    }
    getService(serviceName) {
        return __awaiter(this, void 0, void 0, function* () {
            let obj = this.retrieveService(serviceName);
            if (!obj) {
                this.ns.exec(`/services/${ServiceName[serviceName].toLowerCase()}-service.js`, 'home');
                do {
                    yield this.ns.sleep(500);
                    obj = this.retrieveService(serviceName);
                } while (!obj);
            }
            return obj;
        });
    }
    globalKillAll(hostnames) {
        hostnames.forEach(hostname => {
            this.ns.killall(hostname, true);
        });
    }
    removePreviousFiles(hostnames) {
        hostnames.forEach(hostname => {
            if (hostname !== 'home') {
                const files = this.ns.ls(hostname);
                if (files.length > 0)
                    this.log.info(`${hostname.toUpperCase()} - ${files.length} files detected:\n${files.join(', ')}`);
                files.forEach(file => {
                    if (file.includes('.js') || file.includes('-init.txt')) {
                        if (this.ns.rm(file, hostname) === true)
                            this.log.info(`SUCCESS - File ${file} deleted.`);
                        else
                            this.log.info(`ERROR - Couldn't delete file ${file}.`);
                    }
                });
            }
        });
    }
}
//# sourceMappingURL=init.js.map