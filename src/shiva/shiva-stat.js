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
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = ns.args[0];
        const blockId = ns.args[1];
        const delay = ns.args[2];
        const pauseBetweenBlocks = ns.args[3];
        const log = new Log(ns);
        yield ns.sleep(delay);
        let msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
        log.info(`SHIVA > STATUS ${target} < HACK     ${blockId}-0: ${msg}`);
        yield ns.sleep(pauseBetweenBlocks);
        msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
        log.info(`SHIVA > STATUS ${target} > HACK     ${blockId}-4: ${msg}`);
        yield ns.sleep(pauseBetweenBlocks);
        msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
        log.info(`SHIVA > STATUS ${target} > WEAKEN 1 ${blockId}-1: ${msg}`);
        yield ns.sleep(pauseBetweenBlocks);
        msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
        log.info(`SHIVA > STATUS ${target} > GROW     ${blockId}-2: ${msg}`);
        yield ns.sleep(pauseBetweenBlocks);
        msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
        log.info(`SHIVA > STATUS ${target} > WEAKEN 2 ${blockId}-3: ${msg}`);
    });
}
function getAvailMoney(ns, log, targetName) {
    return log.formatMoney(Math.floor(ns.getServerMoneyAvailable(targetName)));
}
function getActualSec(ns, log, targetName) {
    return log.formatNumber(ns.getServerSecurityLevel(targetName));
}
//# sourceMappingURL=shiva-stat.js.map