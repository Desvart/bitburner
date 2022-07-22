import {ServiceProvider} from '/services/service';
import {INs, Log, ptimestamp} from '/pkg.helpers';
import * as http from 'http';

/* hackAnalyze = %MoneyHacked(server, player) = (1 - server.sec.level / 100) * (1 - (server.hackLevel-1) / player.hackLevel) * player.moneyMult * bitnode.Mult / 240
 * hackThreads = hackAmount / Ceil(MoneyAvail * %MoneyHacked))
 * hackSecIncrement = 0.002 * hackThreads
 * growSecIncrement = 2 * 0.002 * growThreads
 * weakenSecDecrease = 0.05 * weakenThreads * (1 + (cores - 1) / 16 ) * bitnode.mult;
 * weakenThreads = hackThreads * 16 /  (25 * (cores + 15));
 * weakenThreads = growThreads * 32 /  (25 * (cores + 15));
 */

/** @param {NS} ns */
export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    
    // Define constants
    const dependencies = ['pkg.hk.js', 'pkg.gw.js', 'pkg.wk.js', 'pkg.helpers.js', '/services/service.js'];
    const targetHostname = 'joesguns';
    const runnerHostname = 'home';
    // const runnerHostname = 'sigma-cosmetics';
    
    
    // Load initial objects
    const log = new Log(ns);
    const network = ServiceProvider.getNetwork(ns);
    const target = network.getNode(targetHostname);
    const runner = network.getNode(runnerHostname);
    await runner.upload(dependencies);
    
    
    
    while (true) {
        const batchStopTime: ptimestamp = performance.now() + target.wk.duration + 160;
        const hackRatio: number = 0.1;
        
        let hThreads: number = 0;
        let w1Threads: number = 0;
        let gThreads: number = 0;
        let w2Threads: number = 0;
        
        let stolenMoney: number = 0;
        let stolenRatio: string = '0';
        
        if (target.money.isMax && target.security.isMin) {
            const hackAmount: number = Math.floor(target.money.max * hackRatio);
            hThreads = Math.min(Math.floor(ns.hackAnalyzeThreads(target.id, hackAmount)), runner.getThreadsCount(1.7));
            stolenMoney = hThreads * ns.hackAnalyze(target.id) * target.money.max;
            stolenRatio = (stolenMoney / target.money.max * 100).toFixed(2);
        }
        ns.print(`Hack ${hThreads}x: ${log.formatMoney(stolenMoney)} (${stolenRatio}%)`);
        
        let secLevel1 = 0;
        if (hThreads > 0 || !target.security.isMin) {
            secLevel1 = (0.002 * hThreads) + target.security.delta;
            let weakThreads: number = target.wk.getThreadsAmount(secLevel1, runner.cores);
            w1Threads = Math.min(weakThreads, runner.getThreadsCount(1.75));
        }
        ns.print(`Weaken1 ${w1Threads}x: -${secLevel1.toFixed(2)} §`);
        
        let secLevel2 = 0;
        
        let amountToGrowFrom: number = 0;
        if (!target.money.isMax || hThreads > 0) {
            
            amountToGrowFrom = Math.min(target.money.available, target.money.max - stolenMoney);
            const growThreads: number = target.gw.getThreadsAmount(amountToGrowFrom, target.money.max, runner.cores);
            gThreads = Math.min(growThreads, runner.getThreadsCount(1.75));
            
            secLevel2 = (0.004 * gThreads) + target.security.delta;
            let weakThreads: number = target.wk.getThreadsAmount(secLevel2, runner.cores);
            w2Threads = Math.min(weakThreads, runner.getThreadsCount(1.75));
        }
        
        ns.print(`Grow ${gThreads}x: +${log.formatMoney(amountToGrowFrom)}`);
        ns.print(`Weaken2 ${w2Threads}x: -${secLevel2.toFixed(2)} §`);
        
        if (hThreads > 0)
            ns.exec('pkg.hk.js', runner.id, hThreads, target.id, batchStopTime - 120,
                JSON.stringify({runner: runner.id, threads: hThreads}));
        if (w1Threads > 0)
            ns.exec('pkg.wk.js', runner.id, w1Threads, target.id, batchStopTime - 80,
                JSON.stringify({runner: runner.id, threads: w1Threads}));
        if (gThreads > 0)
            ns.exec('pkg.gw.js', runner.id, gThreads, target.id, batchStopTime - 40,
                JSON.stringify({runner: runner.id, threads: gThreads}));
        if (w2Threads > 0)
            ns.exec('pkg.wk.js', runner.id, w2Threads, target.id, batchStopTime - 0,
                JSON.stringify({runner: runner.id, threads: w2Threads}));
        
        await ns.sleep(160);
    }
}