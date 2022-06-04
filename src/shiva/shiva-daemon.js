var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadInitFile, Log } from '/resources/helpers';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const shiva = new ShivaDaemon(ns, new Log(ns), loadInitFile(ns, ns.args[0], ns.args[1]));
        shiva.determineConfig();
        while (true) {
            let i = shiva.maxParallelBatch;
            //i = 2;
            //while (i-- >= 0) {
            shiva.run();
            yield shiva.pauseLoop();
            //}
            // await ns.sleep(shiva.blockDuration + 200);
        }
    });
}
class ShivaDaemon {
    constructor(ns, log, staticValues) {
        this.blockId = 1;
        this.ns = ns;
        this.log = log;
        this.runner = staticValues.runner;
        this.target = staticValues.target;
        this.hFile = staticValues.hFile;
        this.wFile = staticValues.wFile;
        this.gFile = staticValues.gFile;
        this.sFile = staticValues.sFile;
        this.hackRatio = staticValues.hackRatio;
        this.pauseBtwBlocks = staticValues.pauseBtwBlocks;
    }
    determineConfig() {
        this.computeThreadsQty();
        this.computeDelays();
        this.computeMaxParallelBatch();
    }
    run() {
        this.ns.exec(this.sFile, this.runner, 1, this.target.hostname, this.blockId, this.sDelay, this.pauseBtwBlocks);
        this.exec(this.wFile, this.runner, this.target.hostname, this.w1ThrdQty, 0, 2);
        this.exec(this.wFile, this.runner, this.target.hostname, this.w2ThrdQty, this.wDelay, 4);
        this.exec(this.gFile, this.runner, this.target.hostname, this.gThrdQty, this.gDelay, 3);
        this.exec(this.hFile, this.runner, this.target.hostname, this.hThrdQty, this.hDelay, 1);
        this.blockId = this.blockId < 1000 ? this.blockId + 1 : 1;
    }
    pauseLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(4 * this.pauseBtwBlocks);
        });
    }
    computeMaxParallelBatch() {
        this.maxParallelBatch = Math.floor((this.hDuration - 4 * this.pauseBtwBlocks) / (4 * this.pauseBtwBlocks)) - 1;
        this.log.info(`max//Batch: ${this.maxParallelBatch}`);
        return this.maxParallelBatch;
    }
    computeDelays() {
        this.hDuration = this.ns.getHackTime(this.target.hostname);
        this.log.warn(`hDuration: ${this.log.formatDuration(this.hDuration)}`);
        const wDuration = this.ns.getWeakenTime(this.target.hostname);
        this.log.warn(`wDuration: ${this.log.formatDuration(wDuration)}`);
        /*const wDuration = this.ns.formulas.hacking.weakenTime(
            {...this.ns.getServer(this.target.hostname), hackDifficulty: this.sec1},
            this.ns.getPlayer()
        );*/
        const gDuration = this.ns.getGrowTime(this.target.hostname);
        this.log.warn(`gDuration: ${this.log.formatDuration(gDuration)}`);
        this.blockDuration = wDuration + 2 * this.pauseBtwBlocks;
        this.wDelay = 2 * this.pauseBtwBlocks;
        this.gDelay = wDuration + this.pauseBtwBlocks - gDuration;
        this.hDelay = wDuration - this.pauseBtwBlocks - this.hDuration;
        this.sDelay = wDuration - 1.5 * this.pauseBtwBlocks;
    }
    computeThreadsQty() {
        this.hThrdQty = Math.ceil(this.hackRatio / this.ns.hackAnalyze(this.target.hostname));
        //this.sec1 = this.target.minSec + this.ns.hackAnalyzeSecurity(this.hThrdQty);
        this.w1ThrdQty = Math.ceil(this.ns.hackAnalyzeSecurity(this.hThrdQty) / this.ns.weakenAnalyze(1));
        //this.gThrdQty = Math.ceil(this.ns.growthAnalyze(this.target.hostname, 1 / (1 - this.hackRatio))) + 1;
        //const growthRatio = Math.ceil(this.target.maxMoney / this.ns.getServerMoneyAvailable(this.target.hostname));
        const growthRatio = Math.ceil(1 / (1 - this.ns.hackAnalyze(this.target.hostname) * this.hThrdQty));
        this.gThrdQty = Math.ceil(this.ns.growthAnalyze(this.target.hostname, growthRatio));
        this.w2ThrdQty = Math.ceil(this.ns.growthAnalyzeSecurity(this.gThrdQty) / this.ns.weakenAnalyze(1));
    }
    exec(file, runner, target, thrdQty, delay, stepId) {
        this.ns.exec(file, runner, thrdQty, target, thrdQty, delay, this.blockId, stepId, false, 'SHIVA');
    }
}
//# sourceMappingURL=shiva-daemon.js.map