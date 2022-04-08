var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Farm } from '/hacknet/farm.js';
import { HacknetAdapters } from '/hacknet/hacknet-adapters.js';
import { LogNsAdapter } from '/resources/helpers.js';
import { hacknetConfig as configTech } from '/hacknet/hacknet-config.js';
import { hacknetConfig } from '/hacknet/hacknet-config.js';
import { configGlobal } from '/resources/global-config.js';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags([
            ['deploy', false],
            ['operate', false],
        ]);
        const daemon = new HacknetDaemon(ns, flags);
        yield daemon.setup();
        yield daemon.run();
    });
}
export class HacknetDaemon {
    constructor(ns, flags) {
        this.nsA = new HacknetAdapters(ns);
        this.logA = new LogNsAdapter(ns);
        this.farm = new Farm(this.nsA, this.logA);
        this.flags = flags;
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.flags.deploy === true) {
                this.kill();
                this.setupInfra();
                yield this.deploy();
                this.activate();
            }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.flags.operate === true) {
                yield this.farm.operate();
            }
        });
    }
    kill() {
        this.nsA.kill(configTech.DAEMON_FILE, hacknetConfig.LOCATION, '--operate');
    }
    setupInfra() {
        this.nsA.nuke(hacknetConfig.LOCATION);
    }
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (hacknetConfig.LOCATION !== 'home') {
                const filesList = [configGlobal.CONFIG_FILE,
                    configTech.CONFIG_FILE,
                    configTech.DAEMON_FILE,
                    configTech.MANAGER_FILE,
                    configTech.FARM_FILE,
                    configTech.NODE_FILE,
                    configTech.COMPONENT_FILE,
                    configGlobal.HELPER_FILE
                ];
                yield this.nsA.scp(filesList, hacknetConfig.LOCATION);
            }
        });
    }
    activate() {
        if (this.nsA.scriptRunning(configTech.DAEMON_FILE, hacknetConfig.LOCATION) === false) {
            this.nsA.exec(configTech.DAEMON_FILE, hacknetConfig.LOCATION, 1, '--operate');
            this.logA.info('JARVIS_DAEMON - Hacknet HacknetDaemon activated with success.');
        }
        else {
            const msg = `JARVIS_DAEMON - Hacknet Daemon couldn't be activated: the process is already alive.`;
            this.logA.warn(msg);
        }
    }
}
//# sourceMappingURL=hacknet-daemon.js.map