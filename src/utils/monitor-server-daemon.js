var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getService, ServiceName } from '/services/service';
// noinspection JSCommentMatchesSignature
/**
 * This script continuously monitors a specific server on multiple parameters. Useful for creating hacking scripts.
 * Money: actual value / max value (% of actual value relative to the total value)
 * Sec.: actual security / minimum security
 * Hack: number of seconds to hack the server (number of threads to hack the total amount of actual money)
 * Grow: number of seconds to grow the server to its maximum amount from the actual value (number of threads to grow the server)
 * Weaken: number of seconds to weaken the server to its minimum amount from the actual value (number of threads to weaken the server)
 * WARNING - This script cannot work properly without the network service up and running.
 * @param {string} hostname
 */
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags([
            ['refreshrate', 200]
        ]);
        ns.tail();
        ns.disableLog('ALL');
        const network = getService(ns, ServiceName.Network);
        const server = network.getNode(flags._[0]);
        const home = network.getNode('home');
        const maxMoney = server.money.max;
        const maxMoneyStr = ns.nFormat(maxMoney, "$0.000a");
        const minSec = server.security.min;
        const minSecStr = minSec.toFixed(2);
        // noinspection InfiniteLoopJS
        while (true) {
            const money = Math.max(server.money.available, 1);
            const moneyStr = ns.nFormat(money, "$0.000a");
            const moneyRatioStr = (money / maxMoney * 100).toFixed(2) + '%';
            const sec = server.security.level;
            const secStr = sec.toFixed(2);
            const secDeltaStr = (sec - minSec).toFixed(2);
            const hackTimeStr = server.hk.durationStr;
            const hackThreadsStr = server.hk.getThreadsAmount(money).toFixed();
            const growTimeStr = server.gw.durationStr;
            const growThreadsStr = server.gw.getThreadsAmount(money, maxMoney).toFixed();
            const growThreadsHomeStr = server.gw.getThreadsAmount(money, maxMoney, home.cores).toFixed();
            const weakenTimeStr = server.wk.durationStr;
            const weakenThreadsStr = server.wk.getThreadsAmount(sec - minSec).toFixed();
            const weakenThreadsHomeStr = server.wk.getThreadsAmount(sec - minSec, home.cores).toFixed();
            const ramRatioStr = (server.ram.free / server.ram.max * 100).toFixed(2) + '%';
            const hackChance = (server.hk.chance * 100).toFixed(2) + '%';
            ns.clearLog();
            ns.print(server.id);
            ns.print(` money      : ${moneyStr} / ${maxMoneyStr} (${moneyRatioStr})`);
            ns.print(` sec.       : ${secStr} / ${minSecStr} (+${secDeltaStr})`);
            ns.print(` hack       : ${hackTimeStr} (threads = ${hackThreadsStr})`);
            ns.print(` grow       : ${growTimeStr} (threads = ${growThreadsStr} or ${growThreadsHomeStr})`);
            ns.print(` weaken     : ${weakenTimeStr} (threads = ${weakenThreadsStr} or ${weakenThreadsHomeStr})`);
            ns.print(` RAM (free) : ${server.ram.free}GB / ${server.ram.max}GB (${ramRatioStr})`);
            ns.print(` hackChance : ${hackChance}`);
            yield ns.sleep(flags.refreshrate);
        }
    });
}
export function autocomplete(data, args) {
    return [...data.servers];
}
//# sourceMappingURL=monitor-server-daemon.js.map