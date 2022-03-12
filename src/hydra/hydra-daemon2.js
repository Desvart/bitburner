import {HYDRA_CONFIG as config} from '/config/config.js';
import {Log, initDaemon} from '/helpers/helper.js';
import {Network} from '/network/network.js';

export async function main(ns) {
    initDaemon(ns, config.displayTail);
    const vulnerableTargetList = ns.args[0];
    const targetName = ns.args[1];
    await new Hydra(ns).run(vulnerableTargetList, targetName);
}

class Hydra {
    #hackingFarm;
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
        this.#hackingFarm = new HackingFarm(ns);
    }
    
    async run(targetName = null) {
        targetName = this.#findNextBestTarget(targetName);
        Log.debug(this.#ns, `HYDRA_DAEMON - No potential target at the moment ${targetName}.`);
        if (targetName.length !== 0) {
            //targetName = 'ecorp';
            const runnerName = this.#setupRunnerInfra(targetName);
            //const runnerName = 'home';
            await this.#deployMalwaresOnRunner(runnerName);
            this.#activateShiva(runnerName, targetName);
        } else {
            Log.warn(this.#ns, `HYDRA_DAEMON - No potential target at the moment.`);
        }
    }
    
    #findNextBestTarget(targetName) {
        const ns = this.#ns;
        const network = new Network(ns);
        if (targetName === null) {
            const availableTargetsList = getListOfAvailableTargets();
            if (availableTargetsList.length !== 0) {
                targetName = identifyMostProfitableTarget(availableTargetsList);
            } else {
                targetName = [];
            }
        }
        return targetName;
        
        function getListOfAvailableTargets() {
            const vulnerableTargetList = network.nodesList.filter(n =>
                n.isPotentialTarget === true &&
                n.hasAdminRights === true &&
                n.hackChance === 1
            ).map(n => n.hostname);
            const operationalTargetsList = getListOfOperationalTargets();
            
            const availableTargetsList = vulnerableTargetList.filter(t =>
                operationalTargetsList.includes(t) === false);
            
            return availableTargetsList;
            
            function getListOfOperationalTargets() {
                let operationalTargetsList = [];
                for (const server of ns.getPurchasedServers()) {
                    const processList = ns.ps(server);
                    for (const process of processList) {
                        if (process.filename === config.SHIVA_DAEMON_FILE) {
                            operationalTargetsList.push(process.args[0]);
                        }
                    }
                }
                return operationalTargetsList;
            }
        }
        
        function identifyMostProfitableTarget(availableTargetsList) {
            
            let ratedTargetsList = rateTargets(availableTargetsList);
            const mostProfitableTarget = ratedTargetsList.sort((prev, curr) => -prev.rate + curr.rate)[0];
            return mostProfitableTarget.targetName;
            
            function rateTargets(availableTargetsList) {
                let targets = [];
                for (const target of availableTargetsList) {
                    const server = ns.getServer(target);
                    targets.push({
                        'targetName': server.hostname,
                        'growthFactor': server.serverGrowth,
                        'minSec': server.minDifficulty,
                        'maxMoney': server.moneyMax,
                        'rate': 0,
                    });
                }
                
                const growthFactorMax = targets.sort((prev, curr) => -prev.growthFactor + curr.growthFactor)[0].growthFactor;
                const minSecMax = targets.sort((prev, curr) => -prev.minSec + curr.minSec)[0].minSec;
                const maxMoneyMax = targets.sort((prev, curr) => -prev.maxMoney + curr.maxMoney)[0].maxMoney;
                
                for (const target of targets) {
                    const minSecNorm = (1 - target.minSec / minSecMax) * 100;
                    const growthFactorNorm = target.growthFactor / growthFactorMax * 10;
                    const maxMoneyNorm = target.maxMoney / maxMoneyMax * 1;
                    target.rate = minSecNorm + growthFactorNorm + maxMoneyNorm;
                }
                
                return targets;
            }
        }
    }
    
    #setupRunnerInfra(targetName) {
        const existingRunnerName = this.#hackingFarm.getServersHacking(targetName)[0];
        const newRunnerName = this.#identifyNewRunner(targetName, existingRunnerName);
        const newRunnerRam = this.#determineRunnerRam(targetName);
        this.#upgradeInfraWithNewRunner(newRunnerName, newRunnerRam, existingRunnerName);
        return newRunnerName;
    }
    
    async #deployMalwaresOnRunner(runnerName) {
        if (runnerName !== 'home') {
            await this.#ns.scp(config.MALWARE_FILES, runnerName);
            Log.info(this.#ns, `Hydra malwares deployed on ${runnerName}`);
        }
    }
    
    #activateShiva(runnerName, targetName) {
        this.#ns.exec(config.SHIVA_DAEMON_FILE, runnerName, 1, targetName, runnerName);
        Log.info(this.#ns, `HYDRA_DAEMON - Shiva-daemon activated on ${runnerName} and targeting ${targetName}.`);
    }
    
    #identifyNewRunner(targetName, existingRunnerName = []) {
        if (existingRunnerName.length === 0) {
            return config.SERVER_ROOT_NAME + this.#hackingFarm.serverCount;
        } else {
            return existingRunnerName;
        }
    }
    
    #determineRunnerRam(targetName) {
        
        const hackThreads = Math.ceil(config.hackRatio / this.#ns.hackAnalyze(targetName));
        const weaken1Threads = Math.ceil(this.#ns.hackAnalyzeSecurity(hackThreads) / this.#ns.weakenAnalyze(1));
        const growThreads = Math.ceil(this.#ns.growthAnalyze(targetName, 1 / (1 - config.hackRatio))) + 1;
        const weaken2Threads = Math.ceil(this.#ns.growthAnalyzeSecurity(growThreads) / this.#ns.weakenAnalyze(1));
        
        const hackRam = this.#ns.getScriptRam(config.HACK_FILE, 'home') ;
        const weakenRam = this.#ns.getScriptRam(config.WEAKEN_FILE, 'home') ;
        const growRam = this.#ns.getScriptRam(config.GROW_FILE, 'home') ;
        
        const minRamNeededFor1Block =
            hackRam * hackThreads +
            weakenRam * weaken1Threads +
            growRam * growThreads +
            weakenRam * weaken2Threads;
    
        const maxNumberOfParallelBlock = Math.ceil(this.#ns.getWeakenTime(targetName) / (2 * config.PAUSE_BETWEEN_BLOCKS));
        const minRamNeeded = minRamNeededFor1Block * maxNumberOfParallelBlock;
        
        for (let i = 0; i < 20; i++) {
            const ramSize = Math.pow(2, i);
            if (minRamNeeded < ramSize) {
                return ramSize;
            }
        }
    }
    
    #upgradeInfraWithNewRunner(newRunnerName, newRunnerRam, existingRunnerName) {
        this.#hackingFarm.deleteServer(existingRunnerName);
        this.#hackingFarm.buyNewServer(newRunnerName, newRunnerRam);
    }
}

class HackingFarm {
    SERVER_COUNT_LIMIT;
    SERVER_RAM_LIMIT;
    #ns;
    
    get serversList() { return this.#ns.getPurchasedServers(); }
    
    get serverCount() { return this.serversList.length; }
    
    constructor(ns) {
        this.#ns = ns;
        this.SERVER_COUNT_LIMIT = ns.getPurchasedServerLimit();
        this.SERVER_RAM_LIMIT = ns.getPurchasedServerMaxRam();
    }
    
    buyNewServer(serverName, ramSize) {
        const ns = this.#ns;
        if (checkIfLimitReached() === false && checkIfEnoughMoney() === true) {
            const purchasedResponse = this.#ns.purchaseServer(serverName, ramSize);
            return validatePurchase(purchasedResponse);
        } else {
            return null;
        }
        
        function checkIfLimitReached() {
            if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
                return false;
            } else {
                Log.warn(ns, `HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                Max number of servers already bought.`);
                return true;
            }
        }
        
        function checkIfEnoughMoney() {
            const serverCost = ns.getPurchasedServerCost(ramSize);
            const availableMoney = ns.getServerMoneyAvailable('home');
            if (serverCost < availableMoney) {
                return true;
            } else {
                Log.warn(ns, `HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                    Not enough money ${availableMoney} / ${serverCost}.`);
                return false;
            }
        }
        
        function validatePurchase(purchasedResponse= []) {
            if (purchasedResponse.length !== 0) {
                return purchasedResponse;
            } else {
                Log.error(ns, `HYDRA_DAEMON - Cannot purchase new server ${serverName}. Unknown error.`);
            }
        }
        
    }
    
    deleteServer(serverName = []) {
        if (serverName.length !== 0) {
            
            this.#ns.killall(serverName);
            const resp = this.#ns.deleteServer(serverName);
            
            if (resp === true) {
                Log.info(this.#ns, `HYDRA_DAEMON - Successfully deleted server ${serverName}.`);
            } else {
                Log.error(this.#ns, `HYDRA_DAEMON - Cannot delete server ${serverName}. Unknown error.`);
            }
        }
    }
    
    getServersHacking(targetName) {
        let detectedServer = [];
        for (const server of this.serversList) {
            const processList = this.#ns.ps(server);
            for (const process of processList) {
                if (process.args.includes(targetName) === true) {
                    detectedServer.push(server);
                }
            }
        }
        return detectedServer;
    }
    
    getNewServerCost(ramSize) {
        return this.#ns.getPurchasedServerCost(ramSize);
    }
    
}





