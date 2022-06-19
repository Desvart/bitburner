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
            ['refreshrate', 1000],
        ]);
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        // noinspection InfiniteLoopJS
        while (true) {
            const player = getService(ns, ServiceName.Player);
            let network = getService(ns, ServiceName.Network);
            ns.clearLog();
            ns.print(`Player level  : ${player === null || player === void 0 ? void 0 : player.hacking.level}`);
            ns.print(`Player money  : ${player === null || player === void 0 ? void 0 : player.money}`);
            ns.print(`Servers count : ${network === null || network === void 0 ? void 0 : network.length}`);
            let test = '';
            for (let i = 0; i < network.length; i++) {
                test += network[i].id;
            }
            const test2 = network.map(serv => serv.id);
            ns.print(`Servers list  : ${network === null || network === void 0 ? void 0 : network.map(serv => serv.id)}`);
            yield ns.sleep(flags.refreshrate);
        }
    });
}
//# sourceMappingURL=monitor-services-daemon.js.map