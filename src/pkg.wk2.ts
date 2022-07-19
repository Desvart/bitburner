import {formatDuration, Log} from '/pkg.helpers';
import {ServiceProvider} from '/services/service';
import {INs} from '/utils/interfaces';
import {Server} from '/services/network';

export async function main(ns: INs): Promise<void> {
    
    const malware: string = 'WEAK';
    
    const {targetId, landingTime, runnerId, threads} = JSON.parse(ns.args[0]);
    
    const network = ServiceProvider.getNetwork(ns);
    const target = network.getNode(targetId);
    const runner = network.getNode(runnerId);
    const log = new Log(ns);
    
    const msgHeader = buildMsgHeader(runner, target, malware, threads);
    logStatusBefore(msgHeader, target, log);
    
    await waitUntilTimestamp(ns, msgHeader, landingTime, target, log);
    
    logJobStart(msgHeader, target, log);
    
    const securityDecrease: number = await ns.weaken(target.id);
    
    logJobCompletion(msgHeader, securityDecrease, log);
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
        let fireIn: number = (landingTime - performance.now()) - target.wk.duration;
        log.info(`${msgHeader} Start in ${formatDuration(fireIn)}`);
        await ns.sleep(fireIn);
    }
}

function logJobStart(msgHeader: string, target: Server, log: Log): void {
    log.info(`${msgHeader} Start now, end in ${formatDuration(target.wk.duration)}`);
}

function logJobCompletion(msgHeader: string, securityDecrease: number, log: Log): void {
    log.info(`${msgHeader} Finished now - Security decrease: ${securityDecrease}`);
}

function logStatusAfter(msgHeader: string, target: Server, log: Log): void {
    const moneyStatus = `${log.formatMoney(target.money.available)} / ${log.formatMoney(target.money.max)}`;
    const secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    log.info(`${msgHeader} Target status after: ${moneyStatus}, SEC: ${secStatus}`);
}