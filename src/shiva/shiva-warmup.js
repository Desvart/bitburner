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
        const log = new Log(ns);
        const warmup = new ShivaWarmup(ns, log, loadInitFile(ns, ns.args[0], ns.args[1]));
        warmup.logSteps('START');
        while (warmup.actualSec() !== warmup.target.minSec || warmup.availMoney() !== warmup.target.maxMoney) {
            warmup.printHostState();
            if (warmup.actualSec() > warmup.target.minSec) {
                warmup.computeNextWeakenStepParam();
                yield warmup.weakenAndWait();
            }
            else if (warmup.availMoney() < warmup.target.maxMoney) {
                warmup.computeNextGrowStepParam();
                yield warmup.growAndWait();
            }
        }
        warmup.printHostState();
        warmup.logSteps('STOP');
        warmup.launchDaemon();
    });
}
class ShivaWarmup {
    constructor(ns, log, staticValues) {
        this.ns = ns;
        this.log = log;
        this.package = staticValues.packageName;
        this.runner = staticValues.runner;
        this.target = staticValues.target;
        this.wFile = staticValues.wFile;
        this.gFile = staticValues.gFile;
        //this.wThrdQty = staticValues.wThrdQty;
        //this.gThrdQty = staticValues.gThrdQty;
    }
    actualSec() {
        return this.ns.getServerSecurityLevel(this.target.hostname);
    }
    availMoney() {
        return this.ns.getServerMoneyAvailable(this.target.hostname);
    }
    weakenAndWait() {
        return __awaiter(this, void 0, void 0, function* () {
            const wDuration = this.log.formatDuration(this.ns.getWeakenTime(this.target.hostname));
            this.log.info(`SHIVA_WARMUP ${this.target.hostname} - WEAKEN starts: ${this.wThrdQty}x; ${wDuration} duration`);
            this.ns.exec(this.wFile, this.runner, this.wThrdQty, this.target.hostname, this.wThrdQty, 0, 0, 0, false, 'SHIVA_WARMUP');
            yield this.ns.sleep(this.ns.getWeakenTime(this.target.hostname) + 200);
        });
    }
    growAndWait() {
        return __awaiter(this, void 0, void 0, function* () {
            const gDuration = this.log.formatDuration(this.ns.getGrowTime(this.target.hostname));
            this.log.info(`SHIVA_WARMUP ${this.target.hostname} - GROW starts: ${this.gThrdQty}x; ${gDuration} duration`);
            this.ns.exec(this.gFile, this.runner, this.gThrdQty, this.target.hostname, this.gThrdQty, 0, 0, 0, false, 'SHIVA_WARMUP');
            yield this.ns.sleep(this.ns.getGrowTime(this.target.hostname) + 200);
        });
    }
    computeNextGrowStepParam() {
        const growthRatio = Math.ceil(this.target.maxMoney / this.ns.getServerMoneyAvailable(this.target.hostname));
        this.gThrdQty = Math.ceil(this.ns.growthAnalyze(this.target.hostname, growthRatio));
    }
    computeNextWeakenStepParam() {
        const deltaSec = this.ns.getServerSecurityLevel(this.target.hostname) - this.target.minSec;
        this.wThrdQty = Math.ceil(deltaSec / this.ns.weakenAnalyze(1));
    }
    printHostState() {
        const secMsg = `Security: ${this.log.formatNumber(this.actualSec())}/ ${this.target.minSec}`;
        const monMsg = `Money: ${this.log.formatMoney(this.availMoney())} / ${this.log.formatMoney(this.target.maxMoney)}`;
        this.log.info(`SHIVA_WARMUP > STATUS ${this.target.hostname}: ${secMsg} - ${monMsg}\n`);
    }
    logSteps(border) {
        this.log.info(`SHIVA_WARMUP ${this.target.hostname} - ${border} -----------------\n`);
    }
    launchDaemon() {
        const daemonFile = `/${this.package}/${this.package}-daemon.js`;
        ShivaWarmup.closeTail(this.package);
        this.ns.spawn(daemonFile, 1, this.runner, this.target.hostname);
    }
    static closeTail(packageName) {
        const doc = eval('document');
        let xpath = `//h6[starts-with(text(),'/${packageName}/')]/parent::*//button[text()='Close']`;
        const obj = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (obj !== null)
            obj.click();
    }
}
//# sourceMappingURL=shiva-warmup.js.map