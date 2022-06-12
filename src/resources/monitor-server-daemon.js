var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getService, ServiceName } from '/resources/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags([
            ['refreshrate', 200],
            ['help', false],
        ]);
        if (flags._.length === 0 || flags.help) {
            ns.tprint("This script helps visualize the money and security of a server.");
            ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
            ns.tprint("Example:");
            ns.tprint(`> run ${ns.getScriptName()} n00dles`);
            return;
        }
        ns.tail();
        ns.disableLog('ALL');
        const network = getService(ns, ServiceName.Network);
        const server = network.servers.filter(n => n.hostname === flags._[0]);
        const maxMoney = ns.getServerMaxMoney(server);
        const minSec = ns.getServerMinSecurityLevel(server);
        while (true) {
            let money = ns.getServerMoneyAvailable(server);
            if (money === 0)
                money = 1;
            const sec = ns.getServerSecurityLevel(server);
            ns.clearLog();
            ns.print(server);
            ns.print(` money  : ${ns.nFormat(money, "$0.000a")} / ${ns.nFormat(maxMoney, "$0.000a")} (${(money / maxMoney * 100).toFixed(2)}%)`);
            ns.print(` sec.   : +${(sec - minSec).toFixed(2)}`);
            ns.print(` hack   : ${ns.tFormat(ns.getHackTime(server))} (t=${Math.ceil(ns.hackAnalyzeThreads(server, money))})`);
            ns.print(` grow   : ${ns.tFormat(ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
            ns.print(` weaken : ${ns.tFormat(ns.getWeakenTime(server))} (t=${Math.ceil((sec - minSec) * 20)})`);
            yield ns.sleep(flags.refreshrate);
        }
    });
}
export function autocomplete(data, args) {
    return data.servers;
}
//# sourceMappingURL=monitor-server-daemon.js.map