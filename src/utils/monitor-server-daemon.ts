import {getService, ServiceName} from '/services/service';
import {Network, Server} from '/services/network';
import {formatDuration, INs} from '/helpers';

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

export async function main(ns: INs) {
    const flags = ns.flags([
        ['refreshrate', 200]
    ]);
    
    ns.tail();
    ns.disableLog('ALL');
    
    const network: Network = getService<Network>(ns, ServiceName.Network);
    const server: Server = network.filter(server => server.id === flags._[0])[0];
    
    const maxMoney: number = server.money.max;
    const maxMoneyStr: string = ns.nFormat(maxMoney, "$0.000a");
    const minSec: number = server.security.min;
    const minSecStr: string = minSec.toFixed(2);
    
    
    // noinspection InfiniteLoopJS
    while (true) {
        
        const money: number = Math.max(server.money.available, 1);
        const moneyStr: string = ns.nFormat(money, "$0.000a");
        const moneyRatioStr: string = (money / maxMoney * 100).toFixed(2) + '%';
        
        const sec: number = server.security.level;
        const secStr: string = sec.toFixed(2);
        const secDeltaStr: string = (sec - minSec).toFixed(2);
        
        const hackTimeStr: string = server.hk.durationStr;
        const hackThreadsStr: string = server.hk.getThreadsAmount(money).toFixed();
        
        const growTimeStr: string = server.gw.durationStr;
        const growThreadsStr: string = server.gw.getThreadsAmount(money, maxMoney).toFixed();
        
        const weakenTimeStr: string = server.wk.durationStr;
        const weakenThreadsStr: string = server.wk.getThreadsAmount(sec - minSec).toFixed();
        
        const hackChance: string = (server.hk.chance * 100).toFixed(2) + '%';
        
        ns.clearLog();
        ns.print(server.id);
        ns.print(` money      : ${moneyStr} / ${maxMoneyStr} (${moneyRatioStr})`);
        ns.print(` sec.       : ${secStr} / ${minSecStr} (+${secDeltaStr})`);
        ns.print(` hack       : ${hackTimeStr} (threads = ${hackThreadsStr})`);
        ns.print(` grow       : ${growTimeStr} (threads = ${growThreadsStr})`);
        ns.print(` weaken     : ${weakenTimeStr} (threads = ${weakenThreadsStr})`);
        ns.print(` RAM (free) : ${server.ram.free}GB / ${server.ram.max}GB`);
        ns.print(` hackChance : ${hackChance}`);
        
        await ns.sleep(flags.refreshrate);
    }
}

export function autocomplete(data, args) {
    return [...data.servers];
}