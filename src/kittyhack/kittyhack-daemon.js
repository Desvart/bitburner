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
            printHostState(log, hostState);
            if (hostState.actualSec > hostState.minSec) {
                log.info(`KITTYHACK - Start weaken.`);
                yield ns.weaken(staticValues.hostname);
            }
            else if (hostState.availMoney < hostState.maxMoney) {
                log.info(`KITTYHACK - Start grow.`);
                yield ns.grow(staticValues.hostname);
            }
            else {
                log.info(`KITTYHACK - Start hack.`);
                yield ns.hack(staticValues.hostname);
            }
        }
    });
}
function printHostState(log, hostState) {
    const secMsg = `Security: ${log.formatNumber(hostState.actualSec)}/${hostState.minSec}`;
    const monMsg = `Money: ${log.formatMoney(hostState.availMoney)}/${log.formatMoney(hostState.maxMoney)}`;
    log.info(`KITTYHACK - ${secMsg} - ${monMsg}\n`);
}
//# sourceMappingURL=kittyhack-daemon.js.map