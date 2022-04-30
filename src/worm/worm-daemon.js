var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadInitFile, Log } from '/resources/helpers';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const staticValues = loadInitFile(ns, ns.args[0]);
        const log = new Log(ns);
        //noinspection InfiniteLoopJS
        while (true) {
            const hostState = {
                minSec: staticValues.minSec,
                actualSec: ns.getServerSecurityLevel(staticValues.hostname),
                maxMoney: staticValues.maxMoney,
                availMoney: ns.getServerMoneyAvailable(staticValues.hostname),
            };
            log.printHostState('WORM', staticValues.hostname, hostState);
            if (hostState.actualSec > hostState.minSec) {
                ns.exec(staticValues.WEAKEN_FILE, staticValues.hostname, staticValues.weakenThreadQty, staticValues.hostname, staticValues.weakenThreadQty);
                yield ns.sleep(ns.getWeakenTime(staticValues.hostname) + 200);
            }
            else if (hostState.availMoney < hostState.maxMoney) {
                ns.exec(staticValues.GROW_FILE, staticValues.hostname, staticValues.growThreadQty, staticValues.hostname, staticValues.growThreadQty);
                yield ns.sleep(ns.getGrowTime(staticValues.hostname) + 200);
            }
            else {
                ns.exec(staticValues.HACK_FILE, staticValues.hostname, staticValues.hackThreadQty, staticValues.hostname, staticValues.hackThreadQty);
                yield ns.sleep(ns.getHackTime(staticValues.hostname) + 200);
            }
        }
    });
}
//# sourceMappingURL=worm-daemon.js.map