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
        const malware = 'HACK';
        const { targetId, landingTime, runnerId, threads } = JSON.parse(ns.args[0]);
        const network = ServiceProvider.getNetwork(ns);
        const target = network.getNode(targetId);
        const runner = network.getNode(runnerId);
        const log = new Log(ns);
        const msgHeader = buildMsgHeader(runner, target, malware, threads);
        logStatusBefore(msgHeader, target, log);
        yield waitUntilTimestamp(ns, msgHeader, landingTime, target, log);
        logJobStart(msgHeader, target, log);
        const moneyStolen = yield ns.hack(target.id);
        logJobCompletion(msgHeader, moneyStolen, log);
        logStatusAfter(msgHeader, target, log);
    });
}
function buildMsgHeader(runner, target, malware, threads) {
    return `${runner.id} ${malware} (x${threads}) ${target.id} -`;
}
function logStatusBefore(header, target, log) {
    const moneyBefore = target.money.available;
    let moneyStatus = `${log.formatMoney(moneyBefore)} / ${log.formatMoney(target.money.max)}`;
    let secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    const msg = `${header} Target status before: ${moneyStatus}, SEC: ${secStatus}`;
    log.info(msg);
}
function waitUntilTimestamp(ns, msgHeader, landingTime, target, log) {
    return __awaiter(this, void 0, void 0, function* () {
        if (landingTime) {
            let fireIn = (landingTime - performance.now()) - target.hk.duration;
            log.info(`${msgHeader} Start in ${formatDuration(fireIn)}`);
            yield ns.sleep(fireIn);
        }
    });
}
function logJobStart(msgHeader, target, log) {
    log.info(`${msgHeader} Start now, end in ${formatDuration(target.hk.duration)}`);
}
function logJobCompletion(msgHeader, moneyStolen, log) {
    log.info(`${msgHeader} Finished now - Money stolen: ${log.formatMoney(moneyStolen)}`);
}
function logStatusAfter(msgHeader, target, log) {
    const moneyStatus = `${log.formatMoney(target.money.available)} / ${log.formatMoney(target.money.max)}`;
    const secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    log.info(`${msgHeader} Target status after: ${moneyStatus}, SEC: ${secStatus}`);
}
//# sourceMappingURL=pkg.hk2.js.map