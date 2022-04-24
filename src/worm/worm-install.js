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
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const hostname = ns.getHostname();
        yield ns.scp(WORM_CONFIG.INSTALL_PACKAGE, 'home', hostname);
        const daemonFile = WORM_CONFIG.RUN_PACKAGE[0];
        const hackFile = WORM_CONFIG.RUN_PACKAGE[1];
        const weakenFile = WORM_CONFIG.RUN_PACKAGE[2];
        const growFile = WORM_CONFIG.RUN_PACKAGE[3];
        const hostConstFile = WORM_CONFIG.INSTALL_PACKAGE[3];
        const hostConst = {
            hostname: hostname,
            freeRam: ns.getServerMaxRam(hostname) - ns.getScriptRam(daemonFile, hostname),
            hackRam: ns.getScriptRam(hackFile, hostname),
            weakenRam: ns.getScriptRam(weakenFile, hostname),
            growRam: ns.getScriptRam(growFile, hostname),
            minSec: ns.getServerMinSecurityLevel(hostname),
            maxMoney: ns.getServerMaxMoney(hostname),
        };
        yield ns.write(hostConstFile, JSON.stringify(hostConst), 'w');
        ns.spawn(daemonFile, 1);
    });
}
//# sourceMappingURL=worm-install.js.map