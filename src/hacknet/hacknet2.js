export class Hacknet2 extends Array {
    constructor(ns) {
        super();
        this.ns = ns;
        this.maxServerCount = ns.hacknet.maxNumNodes();
        this.retrieveExistingHacknet();
    }
    get productionRate() {
        return this.reduce((acc, obj) => acc + obj.productionRate, 0);
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
        return (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * this.ns.getPlayer().hacking_money_mult;
    }
    get productionRate() {
        return this.simulateProductionRate(this.level.actual, this.ram.actual, this.cores.actual);
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
//# sourceMappingURL=hacknet2.js.map