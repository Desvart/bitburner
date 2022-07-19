import {formatDuration, INs, Log} from '/pkg.helpers';
import {ServiceProvider} from '/services/service';

export async function main(ns: INs): Promise<void> {
    const targetHostname: string = ns.args[0];
    const jobStopTime: number = ns.args[1];
    const info: any = JSON.parse(ns.args[2]);
    
    const network = ServiceProvider.getNetwork(ns);
    const target = network.getNode(targetHostname);
    const log: Log = new Log(ns);
    
    const malware: string = 'WEAK';
    let msg: string = '';
    const msgHeader: string = `${info.runner} ${malware} (x${info.threads}) ${targetHostname} -`;
    
    const moneyBefore: number = target.money.available;
    let moneyStatus: string = `${log.formatMoney(moneyBefore)} / ${log.formatMoney(target.money.max)}`;
    let secStatus: string = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    msg = `${msgHeader} Target status before: ${moneyStatus}, SEC: ${secStatus}`;
    log.info(msg);
    
    if (jobStopTime) {
        let fireIn: number = (jobStopTime - performance.now()) - target.wk.duration;
        msg = `${msgHeader} Start in ${formatDuration(fireIn)}`;
        log.info(msg);
        await ns.sleep(fireIn);
    }
    
    msg = `${msgHeader} Start now, end in ${formatDuration(target.wk.duration)}`;
    log.info(msg);
    
    const securityDecrease: number = await ns.weaken(target.id);
    
    msg = `${msgHeader} Finished now - Security decrease: ${securityDecrease}`;
    log.info(msg);
    
    moneyStatus = `${log.formatMoney(target.money.available)} / ${log.formatMoney(target.money.max)}`;
    secStatus = `${target.security.level.toFixed(2)} / ${target.security.min}`;
    msg = `${msgHeader} Target status after: ${moneyStatus}, SEC: ${secStatus}`;
    log.info(msg);
}