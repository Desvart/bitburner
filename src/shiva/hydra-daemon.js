import {HackingFarm} from '/shiva/shiva-farm.js';
import {LogNsAdapter} from './resources/helpers.js';
import {ShivaAdapter} from '/shiva/shiva-adapters.js';
import {Network} from '/shiva/network.js';
import {SHIVA_CONFIG} from '/shiva/shiva-config.js';

export async function main(ns) {
    let targetName = ns.args[0] | null;
    let runnerName = ns.args[1] | null;
    const nsA = new ShivaAdapter(ns);
    const logA = new LogNsAdapter(ns);
    
    const hydra = new Hydra(nsA, logA);
    
    targetName = hydra.findNextBestTarget(targetName);
    logA.debug(`HYDRA_DAEMON - No potential target at the moment ${targetName}.`);
    if (targetName.length !== 0) {
        if (runnerName === null) {
            runnerName = hydra.setupRunnerInfra(targetName);
        }
        await hydra.deployMalwaresOnRunner(runnerName);
        hydra.activateShiva(runnerName, targetName);
    } else {
        logA.warn(`HYDRA_DAEMON - No potential target at the moment.`);
    }
}

class Hydra {
    #hackingFarm;
    #nsA;
    
    constructor(nsA, logA) {
        this.#nsA = nsA;
        this.#hackingFarm = new HackingFarm(ns);
    }
    
    async run(targetName = null, runnerName = null) {
    
    }
    
    findNextBestTarget(targetName) {
        const ns = this.#nsA;
        const network = new Network(ns);
        if (targetName === null) {
            const availableTargetsList = this.#getListOfAvailableTargets(network);
            if (availableTargetsList.length !== 0) {
                targetName = this.#identifyMostProfitableTarget(availableTargetsList);
            } else {
                targetName = [];
            }
        }
        return targetName;
    }
    
    #getListOfAvailableTargets(network) {
        const vulnerableTargetList = network.nodes.filter(n =>
            n.isPotentialTarget === true &&
            n.hasAdminRights === true &&
            n.hackChance === 1
        ).map(n => n.hostname);
        const operationalTargetsList = this.#getListOfOperationalTargets();
        
        const availableTargetsList = vulnerableTargetList.filter(t =>
            operationalTargetsList.includes(t) === false);
        
        return availableTargetsList;
    }
    
    #getListOfOperationalTargets() {
        let operationalTargetsList = [];
        for (const server of this.#nsA.getPurchasedServers()) {
            const processList = this.#nsA.ps(server);
            for (const process of processList) {
                if (process.filename === SHIVA_CONFIG.RUN_PACKAGE[1]) {
                    operationalTargetsList.push(process.args[0]);
                }
            }
        }
        return operationalTargetsList;
    }
    
    #identifyMostProfitableTarget(availableTargetsList) {
        
        let ratedTargetsList = rateTargets(availableTargetsList);
        const mostProfitableTarget = ratedTargetsList.sort((prev, curr) => -prev.rate + curr.rate)[0];
        return mostProfitableTarget.targetName;
        
        function rateTargets(availableTargetsList) {
            let targets = [];
            for (const target of availableTargetsList) {
                const server = this.#nsA.getServer(target);
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
    
    setupRunnerInfra(targetName) {
        const existingRunnerName = this.#hackingFarm.getServersHacking(targetName)[0];
        const newRunnerName = this.#identifyNewRunner(targetName, existingRunnerName);
        const newRunnerRam = this.#determineRunnerRam(targetName);
        this.#upgradeInfraWithNewRunner(newRunnerName, newRunnerRam, existingRunnerName);
        return newRunnerName;
    }
    
    async deployMalwaresOnRunner(runnerName) {
        if (runnerName !== 'home') {
            await this.#ns.scp(config.MALWARE_FILES, runnerName);
            Log.info(this.#ns, `Hydra malwares deployed on ${runnerName}`);
        }
    }
    
    activateShiva(runnerName, targetName) {
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

