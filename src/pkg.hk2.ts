import {formatDuration, Log} from '/pkg.helpers';
import {ServiceProvider} from '/services/service';
import {Server} from '/services/network';
import {INs} from '/utils/interfaces';

export async function main(ns: INs): Promise<void> {
    
    const malware: string = 'HACK';
    
    const {targetId, landingTime, runnerId, threads} = JSON.parse(ns.args[0]);
    
    const network = ServiceProvider.getNetwork(ns);
    const target = network.getNode(targetId);
    const runner = network.getNode(runnerId);
    const log = new Log(ns);
    
    const msgHeader = buildMsgHeader(runner, target, malware, threads);
    logStatusBefore(msgHeader, target, log);
    
    await waitUntilTimestamp(ns, msgHeader, landingTime, target, log);
    
    logJobStart(msgHeader, target, log);
    
    const moneyStolen = await ns.hack(target.id);
    
    logJobCompletion(msgHeader, moneyStolen, log);
    logStatusAfter(msgHeader, target, log);
}

function buildMsgHeader(runner: Server, target: Server, malware: string, threads: number): string {
    return `${runner.id} ${malware} (x${threads}) ${target.id} -`;
}

function logStatusBefore(header: string, target: Server, log: Log): void {
    const moneyBefore: number = target.money.available;
    let moneyStatus: string = `${log.formatMoney(moneyBefore)} / ${log.formatMoney(target.money.max)}`;
    let secStatus: string = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    const msg = `${header} Target status before: ${moneyStatus}, SEC: ${secStatus}`;
    log.info(msg);
}

async function waitUntilTimestamp(ns: INs, msgHeader: string, landingTime: number, target: Server, log): Promise<void> {
    if (landingTime) {
        let fireIn: number = (landingTime - performance.now()) - target.hk.duration;
        log.info(`${msgHeader} Start in ${formatDuration(fireIn)}`);
        await ns.sleep(fireIn);
    }
}

function logJobStart(msgHeader: string, target: Server, log: Log): void {
    log.info(`${msgHeader} Start now, end in ${formatDuration(target.hk.duration)}`);
}

function logJobCompletion(msgHeader: string, moneyStolen: number, log: Log): void {
    log.info(`${msgHeader} Finished now - Money stolen: ${log.formatMoney(moneyStolen)}`);
}

function logStatusAfter(msgHeader: string, target: Server, log: Log): void {
    const moneyStatus = `${log.formatMoney(target.money.available)} / ${log.formatMoney(target.money.max)}`;
    const secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    log.info(`${msgHeader} Target status after: ${moneyStatus}, SEC: ${secStatus}`);
}