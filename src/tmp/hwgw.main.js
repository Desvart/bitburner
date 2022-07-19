var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ServiceProvider } from '/services/service';
/* hackAnalyze = %MoneyHacked(server, player) = (1 - server.sec.level / 100) * (1 - (server.hackLevel-1) / player.hackLevel) * player.moneyMult * bitnode.Mult / 240
 * hackThreads = hackAmount / Ceil(MoneyAvail * %MoneyHacked))
 * hackSecIncrement = 0.002 * hackThreads
 * growSecIncrement = 2 * 0.002 * growThreads
 * weakenSecDecrease = 0.05 * weakenThreads * (1 + (cores - 1) / 16 ) * bitnode.mult;
 * weakenThreads = hackThreads * 16 /  (25 * (cores + 15));
 * weakenThreads = growThreads * 32 /  (25 * (cores + 15));
 */
/** @param {NS} ns */
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const network = ServiceProvider.getNetwork(ns);
        const targetHostname = 'joesguns';
        const target = network.getNode(targetHostname);
        // const runnerHostname = 'home';
        // const runnerHostname = 'sigma-cosmetics';
        const runnerHostname = 'home';
        const runner = network.getNode(runnerHostname);
        yield runner.upload(['pkg.hk.js', 'pkg.gw.js', 'pkg.wk.js', 'pkg.helpers.js', '/services/service.js']);
        const batchStopTime = performance.now() + target.wk.duration + 500;
        /*
        * 50 hTh Home => 16.44 m$ + 0.1 SEC
        * 100 hTh Home => 32.87 m$ + 0.2 SEC
        */
        let hThreads = Math.min(0, runner.getThreadsCount(1.7));
        hThreads = 10;
        const stolenMoney = hThreads * ns.hackAnalyze(target.id) * target.money.max;
        ns.print({ hThreads });
        if (hThreads > 0)
            ns.exec('pkg.hk.js', runner.id, hThreads, target.id, batchStopTime - 150, JSON.stringify({ runner: runner.id, threads: hThreads }));
        /*
        * 5 or 4
        * 2 w1Th Home => -0.11875
        * 4 w1Th Home => -0.415625
        * 2 w1Th !Home =>
        * 4 w1Th !Home =>
        */
        const secLevel = hThreads !== 0 ? hThreads * 0.002 : target.security.delta;
        // const secLevel = 2;
        let weakThreads1 = target.wk.getThreadsAmount(secLevel, runner.cores);
        weakThreads1 = Math.ceil(hThreads * 16 / (25 * (runner.cores + 15)));
        let w1Threads = Math.min(weakThreads1, runner.getThreadsCount(1.75));
        // w1Threads = 22;
        ns.print(`weaken1Threads: ${w1Threads}`);
        if (w1Threads > 0)
            ns.exec('pkg.wk.js', runner.id, w1Threads, target.id, batchStopTime - 100, JSON.stringify({ runner: runner.id, threads: w1Threads }));
        const growThreads = target.gw.getThreadsAmount(Math.min(target.money.available, target.money.max - stolenMoney), target.money.max, runner.cores);
        const gThreads = Math.min(growThreads, runner.getThreadsCount(1.75));
        // const gThreads = 0;
        ns.print({ gThreads });
        if (gThreads > 0) {
            ns.exec('pkg.gw.js', runner.id, gThreads, target.id, batchStopTime - 50, JSON.stringify({ runner: runner.id, threads: gThreads }));
            const gSecIncrease = target.gw.getSecurityIncrease(gThreads, runner.cores);
            let w2Threads = target.wk.getThreadsAmount(gSecIncrease, runner.cores);
            w2Threads = Math.ceil(gThreads * 32 / (25 * (runner.cores + 15)));
            ns.print(`weaken1Threads: ${w2Threads}`);
            ns.exec('pkg.wk.js', runner.id, w2Threads, target.id, batchStopTime, JSON.stringify({ runner: runner.id, threads: w2Threads }));
        }
        // Create warmup requirements
        // Create warmup batch
        // Execute warmup batch
    });
}
//# sourceMappingURL=hwgw.main.js.map