var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SHIVA_CONFIG } from '/shiva2/shiva-config';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetName = ns.args[0];
        const hDuration = ns.args[1];
        const blockId = ns.args[2];
        let availableMoney = ns.getServerMoneyAvailable(targetName);
        let actualSecurity = ns.getServerSecurityLevel(targetName);
        let msg = `Target status: ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
        console.debug(`${targetName} - Shiva${blockId} - ${msg}`);
        yield ns.sleep(hDuration + SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS / 2);
        availableMoney = ns.getServerMoneyAvailable(targetName);
        actualSecurity = ns.getServerSecurityLevel(targetName);
        msg = `Target status: HACK - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
        let shivaLoc = `Shiva${blockId}-3`;
        console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
        yield ns.sleep(SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
        availableMoney = ns.getServerMoneyAvailable(targetName);
        actualSecurity = ns.getServerSecurityLevel(targetName);
        msg = `Target status: WEAKEN1 - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
        shivaLoc = `Shiva${blockId}-0`;
        console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
        yield ns.sleep(SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
        availableMoney = ns.getServerMoneyAvailable(targetName);
        actualSecurity = ns.getServerSecurityLevel(targetName);
        msg = `Target status: GROW - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
        shivaLoc = `Shiva${blockId}-1`;
        console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
        yield ns.sleep(SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
        availableMoney = ns.getServerMoneyAvailable(targetName);
        actualSecurity = ns.getServerSecurityLevel(targetName);
        msg = `Target status: WEAKEN2 - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
        shivaLoc = `Shiva${blockId}-2`;
        console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
    });
}
//# sourceMappingURL=server-stat.js.map