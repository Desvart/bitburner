var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WORM_CONFIG } from '/worm/worm-config';
import { LogNsAdapter } from '/resources/helpers';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const nsA = new WormAdapter(ns);
        const logA = new LogNsAdapter(ns);
        const hostConst = JSON.parse(ns.read(WORM_CONFIG.INSTALL_PACKAGE[3]));
        //noinspection InfiniteLoopJS
        while (true) {
            const hostState = {
                minSec: hostConst.minSec,
                actualSec: nsA.getServerSecurityLevel(hostConst.hostname),
                maxMoney: hostConst.maxMoney,
                availMoney: nsA.getServerMoneyAvailable(hostConst.hostname),
            };
            printHostState(logA, hostConst.hostname, hostState);
            if (hostState.actualSec > hostState.minSec) {
                const threadQty = Math.floor(hostConst.freeRam / hostConst.weakenRam);
                nsA.exec(WORM_CONFIG.RUN_PACKAGE[2], hostConst.hostname, threadQty);
                yield nsA.sleep(nsA.getWeakenTime(hostConst.hostname) + 100);
            }
            else if (hostState.availMoney < hostState.maxMoney) {
                const threadQty = Math.floor(hostConst.freeRam / hostConst.growRam);
                nsA.exec(WORM_CONFIG.RUN_PACKAGE[3], hostConst.hostname, threadQty);
                yield nsA.sleep(nsA.getGrowTime(hostConst.hostname) + 100);
            }
            else {
                const threadQty = Math.floor(hostConst.freeRam / hostConst.hackRam);
                nsA.exec(WORM_CONFIG.RUN_PACKAGE[1], hostConst.hostname, threadQty);
                yield nsA.sleep(nsA.getHackTime(hostConst.hostname) + 100);
            }
        }
    });
}
function printHostState(logA, hostname, hostState) {
    const secMsg = `Security: ${hostState.actualSec}/${hostState.minSec}`;
    const monMsg = `Money: ${logA.formatMoney(hostState.availMoney)}/${logA.formatMoney(hostState.maxMoney)}`;
    logA.debug(`WORM ${hostname} - ${secMsg} - ${monMsg}`);
}
class WormAdapter {
    constructor(ns) {
        this.ns = ns;
    }
    exec(filePath, targetName, threadsQty) {
        this.ns.exec(filePath, targetName, threadsQty, targetName, threadsQty, 0, 0, 0, false);
    }
    getHackTime(hostname) {
        return this.ns.getHackTime(hostname);
    }
    getWeakenTime(hostname) {
        return this.ns.getWeakenTime(hostname);
    }
    getGrowTime(hostname) {
        return this.ns.getGrowTime(hostname);
    }
    getServerMoneyAvailable(targetName) {
        return this.ns.getServerMoneyAvailable(targetName);
    }
    getServerSecurityLevel(hostname) {
        return this.ns.getServerSecurityLevel(hostname);
    }
    sleep(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(duration);
        });
    }
}
//# sourceMappingURL=worm-daemon.js.map