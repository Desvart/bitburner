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
function buildWarmupBatch(server) { }
class Batch extends Array {
    constructor(ns, target, runner) {
        super();
        this.ns = ns;
        this.target = target;
        this.runner = runner;
    }
    execute() {
        for (let job of this) {
            this.ns.exec(job.malware, this.runner.id, job.threadsQty, this.target.id, job.stopTime);
        }
    }
}
class Job {
    constructor(runnerHostname, malware, threadsQty, stopTime) {
        this.runnerHostname = runnerHostname;
        this.threadsQty = threadsQty;
        this.stopTime = stopTime;
        this.malware = malware + '.js';
    }
}
function warmupServer(ns, home, target, player) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.exec('hk.js', home.id, 120, target.id);
        yield ns.sleep(5000);
        const growThreads = target.gw.getThreadsAmount(target.money.available, target.money.max, home.cores);
        const growSecurityIncrease = target.gw.getSecurityIncrease(growThreads, home.cores);
        const weakThreads1 = target.wk.getThreadsAmount(target.security.level - target.security.min, home.cores);
        const weakThreads2 = target.wk.getThreadsAmount(growSecurityIncrease, home.cores);
        if (weakThreads1 > 0) {
            ns.print(`Weaken x ${weakThreads1}`);
            ns.exec('wk.js', home.id, weakThreads1, target.id);
            yield ns.sleep(17000);
        }
        if (growThreads > 0) {
            debugger;
            ns.print(`Grow x ${growThreads}`);
            ns.exec('gw.js', home.id, growThreads, target.id);
            yield ns.sleep(13000);
        }
        return;
        while (growThreads > 2 || weakThreads1 > 0 || weakThreads2 > 2) {
            ns.clearLog();
            const batchTreads = growThreads + weakThreads2 + weakThreads1;
            if (home.getThreadsCount(1.75) >= batchTreads) {
                if (weakThreads1 > 0 || growThreads > 0)
                    ns.exec('wk.js', home.id, weakThreads1 + weakThreads2, target.id);
                if (growThreads > 0)
                    ns.exec('gw.js', home.id, growThreads, target.id);
            }
            else {
                if (weakThreads1 > 0 && home.getThreadsCount(1.75) > 0) {
                    const maxAvailableThreads = Math.min(weakThreads1, home.getThreadsCount(1.75));
                    ns.exec('wk.js', home.id, maxAvailableThreads, target.id);
                }
                else if (growThreads > 0 && home.getThreadsCount(1.75) > 0) {
                    const maxAvailableThreads = Math.min(growThreads, home.getThreadsCount(1.75));
                    ns.exec('gw.js', home.id, maxAvailableThreads, target.id);
                }
                else if (weakThreads2 > 0 && home.getThreadsCount(1.75) > 0) {
                    const maxAvailableThreads = Math.min(weakThreads2, home.getThreadsCount(1.75));
                    ns.exec('wk.js', home.id, maxAvailableThreads, target.id);
                }
            }
            growThreads = target.gw.getThreadsAmount(target.money.available, target.money.max);
            weakThreads1 = Math.ceil((target.security.level - target.security.min) * 20);
            weakThreads2 = Math.ceil(growThreads / 12.5);
            ns.print(target.id);
            ns.print(`Weak threads1: ${weakThreads1}`);
            ns.print(`Grow threads1: ${growThreads}`);
            ns.print(`Weak threads2: ${weakThreads2}`);
            yield ns.sleep(10);
        }
    });
}
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        const network = getService(ns, ServiceName.Network);
        // network.sort((a, b) => (a.isHome ? 1 : 0) - (b.isHome ? 1 : 0));
        const target = network.getNode('foodnstuff');
        const home = network.getNode('home');
        const player = getService(ns, ServiceName.Player);
        yield warmupServer(ns, home, target, player);
        return;
        const hackRatio = 0.01;
        while (true) {
            ns.clearLog();
            let ramPool = new Map();
            network.forEach(server => { ramPool.set(server.id, server.ram.free); });
            const hackThreads = Math.floor(target.hk.getThreadsAmount(target.money.max * hackRatio));
            const weakThreads1 = Math.ceil(hackRatio / 25 + (target.security.level - target.security.min) * 20);
            let growThreads = Math.floor(target.gw.getThreadsAmount(target.money.max * (1 - hackRatio), target.money.max));
            growThreads = Math.floor(target.gw.getThreadsAmount(target.money.available, target.money.max, home.cores));
            growThreads += Math.floor(target.gw.getThreadsAmount(target.money.max * (1 - hackRatio), target.money.max, home.cores));
            const weakThreads2 = Math.ceil(growThreads / 12.5);
            ns.print(target.id);
            ns.print(`Hack  threads: ${hackThreads}`);
            ns.print(`Weak1 threads: ${weakThreads1}`);
            ns.print(`Grow threads: ${growThreads}`);
            ns.print(`Weak2 threads: ${weakThreads2}`);
            const batchStop = target.wk.duration + 2000 + performance.now();
            let nextBatch = [];
            const batch = {
                hk: hackThreads,
                wk1: weakThreads1,
                gr: growThreads,
                wk2: weakThreads2,
            };
            let batchRam = 1.7 * batch.hk + 1.75 * batch.gr;
            const availableRam = home.ram.free;
            if (ramPool.get(home.id) > batchRam) {
                nextBatch.push({
                    runner: home.id,
                    malware: 'hk.js',
                    threads: batch.hk,
                    stopTime: batchStop,
                });
                nextBatch.push({
                    runner: home.id,
                    malware: 'gr.js',
                    threads: batch.gr,
                    stopTime: batchStop + 100,
                });
                ramPool.set(home.id, ramPool.get(home.id) - batchRam);
                batch.hk = 0;
                batch.gr = 0;
            }
            for (let server of network) {
                if (batch.wk1 > 0 && ramPool.get(server.id) > 1.75 * batch.wk1) {
                    nextBatch.push({
                        runner: server.id,
                        malware: 'wk.js',
                        threads: batch.wk1,
                        stopTime: batchStop + 50,
                    });
                    ramPool.set(server.id, ramPool.get(server.id) - batch.wk1 * 1.75);
                    batch.wk1 = 0;
                }
                if (batch.wk2 > 0 && ramPool.get(server.id) > 1.75 * batch.wk2) {
                    nextBatch.push({
                        runner: server.id,
                        malware: 'wk.js',
                        threads: batch.wk2,
                        stopTime: batchStop + 150,
                    });
                    ramPool.set(server.id, ramPool.get(server.id) - batch.wk2 * 1.75);
                    batch.wk2 = 0;
                }
            }
            if (nextBatch.length === 4) {
                for (let job of nextBatch)
                    ns.exec(job.malware, job.runner, job.threads, target.id, job.stopTime);
            }
            yield ns.sleep(200);
        }
    });
}
//# sourceMappingURL=batch.js.map