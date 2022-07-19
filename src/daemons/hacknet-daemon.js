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
import { Player } from '/services/player';
import { getService, ServiceName } from '/services/service';
const FLAGS = [
    ['harnestRatio', 1 / 4],
    ['cycleTime', 200],
];
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const flags = ns.flags(FLAGS);
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const hDaemon = new HacknetDaemon(ns);
        // noinspection InfiniteLoopJS
        while (true) {
            const bestUpgrade = hDaemon.identifyBestUpgrade();
            yield hDaemon.waitToHaveEnoughFunds(bestUpgrade, flags.harnestRatio);
            hDaemon.upgrade(bestUpgrade);
            yield ns.sleep(flags.cycleTime);
        }
    });
}
class HacknetDaemon {
    constructor(ns, log = new Log(ns), hacknet = new Hacknet(ns), player = new Player(ns)) {
        this.ns = ns;
        this.log = log;
        this.hacknet = hacknet;
        this.player = player;
    }
    identifyBestUpgrade() {
        let upgrades = [];
        upgrades.push(new Upgrade(this.hacknet.newServerGain, this.hacknet.costNewServer, 'server'));
        this.hacknet.forEach(server => {
            upgrades.push(new Upgrade(server.level.upgradeGain, server.level.upgradeCost, 'level', server.id));
            upgrades.push(new Upgrade(server.ram.upgradeGain, server.ram.upgradeCost, 'ram', server.id));
            upgrades.push(new Upgrade(server.cores.upgradeGain, server.cores.upgradeCost, 'cores', server.id));
        });
        const bestUpgrade = upgrades.sort((a, b) => b.ratio - a.ratio)[0];
        const msgRatio = `${this.log.formatMoney(bestUpgrade.gain)}/s / ${this.log.formatMoney(bestUpgrade.cost)} => ratio = ${this.log.formatNumber(bestUpgrade.ratio)}`;
        const msg = `HACKNET_DAEMON - Best upgrade: node${bestUpgrade.serverId}.${bestUpgrade.type} - ${msgRatio}`;
        this.log.info(msg);
        return bestUpgrade;
    }
    waitToHaveEnoughFunds(bestUpgrade, harnestRatio) {
        return __awaiter(this, void 0, void 0, function* () {
            let availableMoney = 0;
            while (bestUpgrade.cost >= availableMoney) {
                const hacknetProfit = this.hacknet.totalProduction - this.hacknet.cost;
                const reinvestAmount = hacknetProfit * (Math.sign(hacknetProfit) > 0 ? harnestRatio : 1 / harnestRatio);
                availableMoney = (this.player.money - reinvestAmount) >= 0 ? reinvestAmount : 0;
                if (bestUpgrade.cost >= availableMoney) {
                    const missingMoney = bestUpgrade.cost - availableMoney;
                    const timeToWait = missingMoney / (this.hacknet.productionRate * harnestRatio) * 1000;
                    const timeToWaitStr = this.ns.tFormat(timeToWait);
                    this.log.info(`HACKNET_DAEMON - Waiting time to next upgrade2 (node${bestUpgrade.serverId}.${bestUpgrade.type}): ${timeToWaitStr}`);
                    yield this.ns.sleep(timeToWait);
                }
            }
        });
    }
    upgrade(bestUpgrade) {
        switch (bestUpgrade.type) {
            case 'server':
                this.hacknet.buyNewServer();
                break;
            case 'level':
                this.hacknet[bestUpgrade.serverId].level.upgrade();
                break;
            case 'ram':
                this.hacknet[bestUpgrade.serverId].ram.upgrade();
                break;
            case 'cores':
                this.hacknet[bestUpgrade.serverId].cores.upgrade();
                break;
        }
        if (bestUpgrade.type === 'node')
            this.log.info(`HACKNET_DAEMON - New server ${bestUpgrade.serverId} bought`);
        else
            this.log.info(`HACKNET_DAEMON - ${bestUpgrade.type} upgraded on server ${bestUpgrade.serverId}.\n`);
    }
}
class Upgrade {
    constructor(gain, cost, type, serverId = 0) {
        this.gain = gain;
        this.cost = cost;
        this.type = type;
        this.serverId = serverId;
        this.ratio = gain / cost;
    }
}
export class Hacknet extends Array {
    constructor(ns) {
        super();
        this.ns = ns;
        this.maxServerCount = ns.hacknet.maxNumNodes();
        this.retrieveExistingHacknet();
    }
    get productionRate() {
        return this.reduce((acc, obj) => acc + obj.productionRate, 0);
    }
    get totalProduction() {
        return this.reduce((acc, obj) => acc + obj.totalProduction, 0);
    }
    get serverCount() {
        return this.ns.hacknet.numNodes();
    }
    get costNewServer() {
        return this.ns.hacknet.getPurchaseNodeCost();
    }
    get newServerGain() {
        return new HServer(this.ns, 0).simulateProductionRate(1, 0, 0);
    }
    get cost() {
        return this.reduce((acc, obj) => acc + obj.cost, 0);
    }
    retrieveExistingHacknet() {
        for (let id = 0; id < this.serverCount; id++) {
            this.push(new HServer(this.ns, id));
        }
    }
    buyNewServer() {
        const newId = this.ns.hacknet.purchaseNode();
        this.push(new HServer(this.ns, newId));
    }
}
class HServer {
    constructor(ns, id) {
        this.ns = ns;
        this.id = id;
        this.level = new Level(ns, id);
        this.ram = new Ram(ns, id);
        this.cores = new Cores(ns, id);
    }
    simulateProductionRate(level, ram, cores) {
        const player = getService(this.ns, ServiceName.Player);
        return (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * player.hacknet.multipliers.production;
    }
    get productionRate() {
        return this.simulateProductionRate(this.level.actual, this.ram.actual, this.cores.actual);
    }
    get totalProduction() {
        return this.ns.hacknet.getNodeStats(this.id).totalProduction;
    }
    get cost() {
        let nodeCost = 0;
        let levelCost = 0;
        let ramCost = 0;
        let coresCost = 0;
        const player = getService(this.ns, ServiceName.Player);
        if (player.software.formulas) {
            const costMult = player.hacknet.multipliers.purchaseCost;
            const hFormulas = this.ns.formulas.hacknetNodes;
            nodeCost = hFormulas.hacknetNodeCost(this.id, costMult);
            levelCost = hFormulas.levelUpgradeCost(1, this.level.actual - 1, costMult);
            ramCost = hFormulas.ramUpgradeCost(1, this.ram.actual - 1, costMult);
            coresCost = hFormulas.coreUpgradeCost(1, this.cores.actual - 1, costMult);
        }
        return nodeCost + levelCost + ramCost + coresCost;
    }
}
class Level {
    constructor(ns, serverId) {
        this.ns = ns;
        this.serverId = serverId;
        this.max = 200;
    }
    get actual() {
        return this.ns.hacknet.getNodeStats(this.serverId).level;
    }
    get upgradeCost() {
        return this.ns.hacknet.getLevelUpgradeCost(this.serverId, 1);
    }
    get upgradeGain() {
        const server = new HServer(this.ns, this.serverId);
        const upgradedGain = server.simulateProductionRate(server.level.actual + 1, server.ram.actual, server.cores.actual);
        return upgradedGain - server.productionRate;
    }
    upgrade() {
        this.ns.hacknet.upgradeLevel(this.serverId, 1);
    }
}
class Ram {
    constructor(ns, serverId) {
        this.ns = ns;
        this.serverId = serverId;
        this.max = 64;
    }
    get actual() {
        return this.ns.hacknet.getNodeStats(this.serverId).ram;
    }
    get upgradeCost() {
        return this.ns.hacknet.getRamUpgradeCost(this.serverId, 1);
    }
    get upgradeGain() {
        const server = new HServer(this.ns, this.serverId);
        const upgradedGain = server.simulateProductionRate(server.level.actual, server.ram.actual * 2, server.cores.actual);
        return upgradedGain - server.productionRate;
    }
    upgrade() {
        this.ns.hacknet.upgradeRam(this.serverId, 1);
    }
}
class Cores {
    constructor(ns, serverId) {
        this.ns = ns;
        this.serverId = serverId;
        this.max = 16;
    }
    get actual() {
        return this.ns.hacknet.getNodeStats(this.serverId).cores;
    }
    get upgradeCost() {
        return this.ns.hacknet.getCoreUpgradeCost(this.serverId, 1);
    }
    get upgradeGain() {
        const server = new HServer(this.ns, this.serverId);
        const upgradedGain = server.simulateProductionRate(server.level.actual, server.ram.actual, server.cores.actual + 1);
        return upgradedGain - server.productionRate;
    }
    upgrade() {
        this.ns.hacknet.upgradeCore(this.serverId, 1);
    }
}
//# sourceMappingURL=hacknet-daemon.js.map