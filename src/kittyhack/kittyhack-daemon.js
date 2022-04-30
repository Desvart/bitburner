var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { KITTY_HACK_CONFIG } from '/kittyhack/kitty-hack-config';
import { Log } from '/resources/helpers';
import { KittyHackAdapter } from '/kittyhack/kitty-hack-adapters';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.disableLog('ALL');
        const nsA = new KittyHackAdapter(ns);
        const logA = new Log(ns);
        //noinspection InfiniteLoopJS
        while (true) {
            const hostState = {
                minSec: nsA.getServerMinSecurityLevel(KITTY_HACK_CONFIG.HOSTNAME),
                actualSec: nsA.getServerSecurityLevel(KITTY_HACK_CONFIG.HOSTNAME),
                maxMoney: nsA.getServerMaxMoney(KITTY_HACK_CONFIG.HOSTNAME),
                availMoney: nsA.getServerMoneyAvailable(KITTY_HACK_CONFIG.HOSTNAME),
            };
            printHostState(logA, hostState);
            if (hostState.actualSec > hostState.minSec) {
                logA.debug(`KITTY-HACK - Start weaken.`);
                yield nsA.weaken(KITTY_HACK_CONFIG.HOSTNAME);
            }
            else if (hostState.availMoney < hostState.maxMoney) {
                logA.debug(`KITTY-HACK - Start grow.`);
                yield nsA.grow(KITTY_HACK_CONFIG.HOSTNAME);
            }
            else {
                logA.debug(`KITTY-HACK - Start hack.`);
                yield nsA.hack(KITTY_HACK_CONFIG.HOSTNAME);
            }
        }
    });
}
function printHostState(logA, hostState) {
    const secMsg = `Security: ${hostState.actualSec}/${hostState.minSec}`;
    const monMsg = `Money: ${logA.formatMoney(hostState.availMoney)}/${logA.formatMoney(hostState.maxMoney)}`;
    logA.debug(`KITTY-HACK - ${secMsg} - ${monMsg}`);
}
//# sourceMappingURL=kitty-hack-daemon.js.map