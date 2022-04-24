var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SHIVA_CONFIG } from '/shiva2/shiva-config';
import { LogNsAdapter } from '/resources/helpers';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = ns.args[0];
        const runner = ns.args[1];
        const nsA = new ShivaInstallAdapter(ns);
        const logA = new LogNsAdapter(ns);
        const malwareStaticProperties = gatherMalwareStaticProperty(nsA, runner, target);
        yield saveStaticPropertiesToFile(nsA, malwareStaticProperties);
        killAnyPreviousMalware(nsA, malwareStaticProperties.targetName);
        yield bringTargetToSpeed(nsA, logA, malwareStaticProperties);
        launchShivaDaemon(nsA, target, runner);
    });
}
function saveStaticPropertiesToFile(nsA, malwareStaticProperties) {
    return __awaiter(this, void 0, void 0, function* () {
        yield nsA.write(SHIVA_CONFIG.SETUP_PACKAGE[1], JSON.stringify(malwareStaticProperties));
    });
}
function gatherMalwareStaticProperty(nsA, hostname, target) {
    return {
        runnerName: hostname,
        targetName: target,
        freeRam: nsA.getServerMaxRam(hostname) - nsA.getScriptRam(SHIVA_CONFIG.SETUP_PACKAGE[0], hostname),
        hackRam: nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[1], hostname),
        weakenRam: nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[2], hostname),
        growRam: nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[3], hostname),
        minSec: nsA.getServerMinSecurityLevel(target),
        maxMoney: nsA.getServerMaxMoney(target),
        purchasedServerLimit: nsA.getPurchasedServerLimit(),
        purchasedServerMaxRam: nsA.getPurchasedServerMaxRam(),
    };
}
function killAnyPreviousMalware(nsA, target) {
    const malwareNames = ['worm', 'kitty', 'hack', 'weaken', 'grow'];
    const processes = nsA.ps(target);
    for (const process of processes) {
        if (malwareNames.some(m => process.filename.includes(m))) {
            nsA.kill(process.pid, target);
        }
    }
}
function bringTargetToSpeed(nsA, logA, prop) {
    return __awaiter(this, void 0, void 0, function* () {
        let actualSec = 100;
        let availMoney = 0;
        while (actualSec > prop.minSec || availMoney < prop.maxMoney) {
            actualSec = nsA.getServerSecurityLevel(prop.targetName);
            availMoney = nsA.getServerMoneyAvailable(prop.targetName);
            printHostState(logA, prop.targetName, actualSec, prop.minSec, availMoney, prop.maxMoney);
            if (actualSec > prop.minSec) {
                const threadQty = Math.floor(prop.freeRam / prop.weakenRam);
                nsA.exec(SHIVA_CONFIG.RUN_PACKAGE[2], prop.runnerName, prop.targetName, threadQty);
                yield nsA.sleep(nsA.getWeakenTime(prop.targetName) + 100);
            }
            else if (availMoney < prop.maxMoney) {
                const threadQty = Math.floor(prop.freeRam / prop.growRam);
                nsA.exec(SHIVA_CONFIG.RUN_PACKAGE[3], prop.runnerName, prop.targetName, threadQty);
                yield nsA.sleep(nsA.getGrowTime(prop.targetName) + 100);
            }
        }
        logA.debug(`SHIVA_INSTALL ${prop.targetName} - Target us up to speed:`);
        printHostState(logA, prop.targetName, actualSec, prop.minSec, availMoney, prop.maxMoney);
    });
}
function printHostState(logA, hostname, actualSec, minSec, availMoney, maxMoney) {
    const secMsg = `Security: ${actualSec}/${minSec}`;
    const monMsg = `Money: ${logA.formatMoney(availMoney)}/${logA.formatMoney(maxMoney)}`;
    logA.debug(`SHIVA_INSTALL ${hostname} - ${secMsg} - ${monMsg}`);
}
function launchShivaDaemon(nsA, target, runner) {
    nsA.spawn(SHIVA_CONFIG.RUN_PACKAGE[0], target, runner);
}
class ShivaInstallAdapter {
    constructor(ns) {
        this.ns = ns;
    }
    exec(filePath, runnerName, targetName, threadsQty) {
        this.ns.exec(filePath, runnerName, threadsQty, targetName, threadsQty, 0, 0, 0, false);
    }
    getWeakenTime(hostname) {
        return this.ns.getWeakenTime(hostname);
    }
    getGrowTime(hostname) {
        return this.ns.getGrowTime(hostname);
    }
    getServerMoneyAvailable(targetName) {
        return this.ns.getServerMoneyAvailable(targetName);
    }
    getServerSecurityLevel(hostname) {
        return this.ns.getServerSecurityLevel(hostname);
    }
    sleep(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(duration);
        });
    }
    scp(files, target) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ns.scp(files, 'home', target);
        });
    }
    ps(target) {
        return this.ns.ps(target);
    }
    kill(pid, target) {
        this.ns.kill(pid, target);
    }
    getScriptRam(file, hostname) {
        return this.ns.getScriptRam(file, hostname);
    }
    getServerMaxRam(target) {
        return this.ns.getServerMaxRam(target);
    }
    getServerMinSecurityLevel(target) {
        return this.ns.getServerMinSecurityLevel(target);
    }
    getServerMaxMoney(target) {
        return this.ns.getServerMaxMoney(target);
    }
    getHostname() {
        return this.ns.getHostname();
    }
    write(file, content) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ns.write(file, content, 'w');
        });
    }
    spawn(file, target, runner) {
        this.ns.spawn(file, 1, target, runner);
    }
    getPurchasedServerLimit() {
        return this.ns.getPurchasedServerLimit();
    }
    getPurchasedServerMaxRam() {
        return this.ns.getPurchasedServerMaxRam();
    }
}
//# sourceMappingURL=shiva-setup.js.map