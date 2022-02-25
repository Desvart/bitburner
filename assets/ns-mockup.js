

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
    hackAnalyzeThreads
    hackAnalyzeSecurity
    hackAnalyze
    growthAnalyze
    growthAnalyzeSecurity
    getHackTime
    getWeakenTime
    getGrowTime
    async hack(target, { threads: threadsCount, stock: marketImpact }) {}
    async grow(target, { threads: threadsCount, stock: marketImpact }) {}
    async weaken(target, { threads: threadsCount, stock: marketImpact }) {}

    getPurchasedServerCost() {}
    brutessh(target) {}
    ftpcrack(target) {}
    relaysmtp(target) {}
    httpworm(target) {}
    sqlinject(target) {}
    fileExists(fileName, target) {}
    clearPort(portId) {}
    readPort(portId) {}
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