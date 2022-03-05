

export class ns {
    args = [];
    print(string) {}
    sleep(int) {}
    pop(string) {}
    ps() {}
    scp(files, target) {}
    exec(file, target, threadCount, args) {}
    ls() {}

    write(string) {}

    tail() {}
    disableLog(logToDisable) {}
    clearLog() {}

    toast(string) {}
    scan(nodeName) {}
    getServer = {
        cpuCores: ''
    }
    hasRootAccess(hostname) {}
    getServerMoneyAvailable(hostname) {}
    getServerSecurityLevel(hostname) {}

    weakenAnalyze(){}
    hackAnalyzeThreads(){}
    hackAnalyzeSecurity(){}
    hackAnalyzeChance(){}
    hackAnalyze(){}
    growthAnalyze(){}
    growthAnalyzeSecurity(){}
    getHackTime(){}
    getWeakenTime(){}
    getGrowTime(){}
    async hack(target, { threads: threadsCount, stock: marketImpact }) {}
    async grow(target, { threads: threadsCount, stock: marketImpact }) {}
    async weaken(target, { threads: threadsCount, stock: marketImpact }) {}
    
    hacknet = {
        getNodeStats () {},
        getLevelUpgradeCost() {},
        getRamUpgradeCost() {},
        getCoreUpgradeCost() {},
        upgradeLevel(nodeId, qty) {},
        upgradeRam() {},
        upgradeCore() {},
        maxNumNodes() {},
        numNodes() {},
        getPurchaseNodeCost() {},
        purchaseNode() {}
    }
    
    getScriptRam() {}
    
    formulas = {
        hacking: {
            growPercent() {}
        }
    }

    getPurchasedServerCost() {}
    brutessh(target) {}
    ftpcrack(target) {}
    relaysmtp(target) {}
    httpworm(target) {}
    sqlinject(target) {}
    fileExists(fileName, target) {}
    clearPort(portId) {}
    readPort(portId) {}
    async writePort(portId, data) {}
    scriptRunning(fileName, hostname) {}
    getPlayer = {
        hacking: ''
    }
    codingcontract = {
        getContractType(name, location) {},
        getData(name, location) {},
        attempt(solution, contractName, contractLocation, rewardConfig) {}
    }


}