var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/pkg.helpers';
import { getService, ServiceName } from '/services/service';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const network = getService(ns, ServiceName.Network);
        const target = network.getNode('foodnstuff');
        const runner = network.getNode('home');
        const val = ns.hackAnalyzeThreads('joesguns', 31268000);
        ns.print({ val });
        return;
        const info = JSON.stringify({
            runner: 'home',
            threads: 120
        });
        ns.exec('hk.js', runner.id, 120, target.id, 0, info);
        yield ns.sleep(5000);
        let ramPool = new Map();
        network.forEach(server => { ramPool.set(server.id, server.ram.free); });
        const warmupBatch = yield buildWarmupBatch(ns, target, runner, ramPool);
        warmupBatch.print();
        warmupBatch.execute();
    });
}
function buildWarmupBatch(ns, target, runner, ramPool) {
    return __awaiter(this, void 0, void 0, function* () {
        const log = new Log(ns);
        const weakThreads1 = target.wk.getThreadsAmount(target.security.level - target.security.min, runner.cores);
        const growThreads = target.gw.getThreadsAmount(target.money.available, target.money.max, runner.cores);
        const growSecurityIncrease = target.gw.getSecurityIncrease(growThreads, runner.cores);
        const weakThreads2 = target.wk.getThreadsAmount(growSecurityIncrease, runner.cores);
        const batchRequirements = new BatchRequirements(0, weakThreads1, growThreads, weakThreads2);
        const batchStopTime = performance.now() + target.wk.duration + 500;
        ns.print(batchStopTime);
        const warmupBatch = new Batch(ns, target, runner);
        if (weakThreads1 > 0 && runner.getThreadsCount(1.75) > weakThreads1) {
            const availableRam = runner.ram.free;
            const requiredRam = weakThreads1 * 1.75;
            if (availableRam > requiredRam) {
                const weak1Job = new Job('wk', target.id, runner.id, weakThreads1, batchStopTime - 100);
                warmupBatch.push(weak1Job);
            }
            else {
                log.warn(`Not enough free RAM on ${runner.id} to warmup ${target.id}: ${requiredRam}GB / ${availableRam}GB`);
            }
        }
        if (weakThreads2 > 0) {
            const availableRam = runner.ram.free;
            const requiredRam = (growThreads + weakThreads2) * 1.75;
            if (availableRam > requiredRam) {
                const growJob = new Job('gw', target.id, runner.id, growThreads, batchStopTime - 50);
                warmupBatch.push(growJob);
                const weak2Job = new Job('wk', target.id, runner.id, weakThreads2, batchStopTime);
                warmupBatch.push(weak2Job);
            }
            else {
                log.warn(`Not enough free RAM on ${runner.id} to warmup ${target.id}: ${requiredRam}GB / ${availableRam}GB`);
            }
        }
        return warmupBatch;
    });
}
//
//
//
// if (weakThreads1 > 0) {
//     ns.print(`Weaken x ${weakThreads1}`);
//     ns.exec('wk.js', runner.id, weakThreads1, target.id);
//     await ns.sleep(17000);
// }
// if (growThreads > 0) {
//     debugger
//     ns.print(`Grow x ${growThreads}`);
//     ns.exec('gw.js', runner.id, growThreads, target.id);
//     await ns.sleep(13000);
// }
//
// while (growThreads > 2 || weakThreads1 > 0 || weakThreads2 > 2) {
//     ns.clearLog();
//
//     const batchTreads = growThreads + weakThreads2 + weakThreads1;
//     if (runner.getThreadsCount(1.75) >= batchTreads) {
//         if (weakThreads1 > 0 || growThreads > 0)
//             ns.exec('wk.js', runner.id, weakThreads1 + weakThreads2, target.id);
//         if (growThreads > 0)
//             ns.exec('gw.js', runner.id, growThreads, target.id);
//
//     } else {
//         if (weakThreads1 > 0 && runner.getThreadsCount(1.75) > 0) {
//             const maxAvailableThreads: number = Math.min(weakThreads1, runner.getThreadsCount(1.75));
//             ns.exec('wk.js', runner.id, maxAvailableThreads, target.id);
//         } else if (growThreads > 0 && runner.getThreadsCount(1.75) > 0) {
//             const maxAvailableThreads: number = Math.min(growThreads, runner.getThreadsCount(1.75));
//             ns.exec('gw.js', runner.id, maxAvailableThreads, target.id);
//         } else if (weakThreads2 > 0 && runner.getThreadsCount(1.75) > 0) {
//             const maxAvailableThreads: number = Math.min(weakThreads2, runner.getThreadsCount(1.75));
//             ns.exec('wk.js', runner.id, maxAvailableThreads, target.id);
//         }
//     }
//
//     growThreads = target.gw.getThreadsAmount(target.money.available, target.money.max);
//     weakThreads1 = Math.ceil((target.security.level - target.security.min) * 20);
//     weakThreads2 = Math.ceil(growThreads / 12.5);
//
//     ns.print(target.id);
//     ns.print(`Weak threads1: ${weakThreads1}`);
//     ns.print(`Grow threads1: ${growThreads}`);
//     ns.print(`Weak threads2: ${weakThreads2}`);
//
//     await ns.sleep(10);
// }
// }
class BatchRequirements {
    constructor(hkThreads, wk1Threads, gwThreads, wk2Threads) {
        this.hkThreads = hkThreads;
        this.wk1Threads = wk1Threads;
        this.gwThreads = gwThreads;
        this.wk2Threads = wk2Threads;
        this.ram = hkThreads * 1.7 + (wk1Threads + gwThreads + wk2Threads) * 1.75;
    }
}
class WarmupRequirements extends BatchRequirements {
    constructor(target, runnerCores) {
        const hThreads = {
            min: 0,
            max: 0
        };
        const wThreads1 = {
            min: target.wk.getThreadsAmount(target.security.level - target.security.min, runnerCores),
            max: target.wk.getThreadsAmount(target.security.level - target.security.min, 1)
        };
        const gThreads = {
            min: target.gw.getThreadsAmount(target.money.available, target.money.max, runnerCores),
            max: target.gw.getThreadsAmount(target.money.available, target.money.max, 1),
        };
        const gSecIncreaseMin = target.gw.getSecurityIncrease(gThreads.min, runnerCores);
        const gSecIncreaseMax = target.gw.getSecurityIncrease(gThreads.max, 1);
        const wThreads2 = {
            min: target.wk.getThreadsAmount(gSecIncreaseMin, runnerCores),
            max: target.wk.getThreadsAmount(gSecIncreaseMax, 1)
        };
        super(hThreads, wThreads1, gThreads, wThreads2);
    }
}
class Batch extends Array {
    constructor(ns, target, runner) {
        super();
        this.ns = ns;
        this.target = target;
        this.runner = runner;
    }
    execute() {
        for (let job of this) {
            if (job.threadsQty > 0) {
                const info = JSON.stringify({
                    runner: this.runner.id,
                    threads: job.threadsQty
                });
                this.ns.exec(job.malware, this.runner.id, job.threadsQty, this.target.id, job.stopTime, info);
            }
        }
    }
    print() {
        for (let job of this) {
            this.ns.print(job.print());
        }
    }
}
class Job {
    constructor(malware, targetHostname, runnerHostname, threadsQty, stopTime) {
        this.targetHostname = targetHostname;
        this.runnerHostname = runnerHostname;
        this.threadsQty = threadsQty;
        this.stopTime = stopTime;
        this.malware = malware + '.js';
    }
    print() {
        return `${this.malware} x${this.threadsQty} ${this.targetHostname} with ${this.runnerHostname} for ${this.stopTime}`;
    }
}
//# sourceMappingURL=scratch.js.map