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
import { NsAdapter } from '/hacknet/ns-adapter.js';
import { LogNsAdapter } from '/resources/helper.js';
import { config as configTech } from '/hacknet/config.js';
import { config } from '/hacknet/config.js';
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
        this.nsA = new NsAdapter(ns);
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
        this.nsA.kill(configTech.DAEMON_FILE, config.LOCATION, '--operate');
    }
    setupInfra() {
        this.nsA.nuke(config.LOCATION);
    }
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (config.LOCATION !== 'home') {
                const filesList = [configGlobal.CONFIG_FILE,
                    configTech.CONFIG_FILE,
                    configTech.DAEMON_FILE,
                    configTech.MANAGER_FILE,
                    configTech.FARM_FILE,
                    configTech.NODE_FILE,
                    configTech.COMPONENT_FILE,
                    configGlobal.HELPER_FILE
                ];
                yield this.nsA.scp(filesList, config.LOCATION);
            }
        });
    }
    activate() {
        if (this.nsA.scriptRunning(configTech.DAEMON_FILE, config.LOCATION) === false) {
            this.nsA.exec(configTech.DAEMON_FILE, config.LOCATION, 1, '--operate');
            this.logA.info('JARVIS_DAEMON - Hacknet HacknetDaemon activated with success.');
        }
        else {
            const msg = `JARVIS_DAEMON - Hacknet Daemon couldn't be activated: the process is already alive.`;
            this.logA.warn(msg);
        }
    }
}
//# sourceMappingURL=hacknet-daemon.js.map