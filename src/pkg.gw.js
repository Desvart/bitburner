var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { formatDuration, Log } from '/pkg.helpers';
import { ServiceProvider } from '/services/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetHostname = ns.args[0];
        const jobStopTime = ns.args[1];
        const info = JSON.parse(ns.args[2]);
        const network = ServiceProvider.getNetwork(ns);
        const target = network.getNode(targetHostname);
        const log = new Log(ns);
        const malware = 'GROW';
        let msg = '';
        const msgHeader = `${info.runner} ${malware} (x${info.threads}) ${targetHostname} -`;
        const moneyBefore = target.money.available;
        let moneyStatus = `${log.formatMoney(moneyBefore)} / ${log.formatMoney(target.money.max)}`;
        let secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
        msg = `${msgHeader} Target status before: ${moneyStatus}, SEC: ${secStatus}`;
        log.info(msg);
        if (jobStopTime) {
            const fireIn = (jobStopTime - performance.now()) - target.gw.duration;
            msg = `${msgHeader} Start in ${formatDuration(fireIn)}`;
            log.info(msg);
            yield ns.sleep(fireIn);
        }
        msg = `${msgHeader} Start now, end in ${formatDuration(target.gw.duration)}`;
        log.info(msg);
        const moneyGrowth = yield ns.grow(target.id);
        msg = `${msgHeader} Finished now - Money growth: ${log.formatMoney(Math.min(target.money.max, moneyBefore * moneyGrowth) - moneyBefore)}`;
        log.info(msg);
        moneyStatus = `${log.formatMoney(target.money.available)} / ${log.formatMoney(target.money.max)}`;
        secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
        msg = `${msgHeader} Target status after: ${moneyStatus}, SEC: ${secStatus}`;
        log.info(msg);
    });
}
//# sourceMappingURL=pkg.gw.js.map