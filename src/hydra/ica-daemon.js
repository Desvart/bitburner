import {IcaConfig, NsConst} from '/config/config.js';
import {NetworkNode} from '/network/server.js';
import {Log} from '/helpers/helper.js';


export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const targetName = ns.args[0];
    
    const ica = new Ica(ns, targetName);
    
    await ica.reduceSecurityToMinimum();
    await ica.growMoneyToMaximumWhileKeepingSecurityMinimum();
    await ica.reduceSecurityToMinimumAndGrowMoneyToMaximum();
    
}

class Ica {
    
    constructor(ns, targetName) {
        this.ns = ns;
        this.target = new NetworkNode(ns, targetName);
        this.theoreticalSecurityLevel = this.initSecurityLevel = this.target.actualSecurity;
        this.theoreticalAvailableMoney = this.initAvailableMoney = this.target.availableMoney;
        
        const home = new NetworkNode(ns, 'home');
        this.runnerCoresCount = home.cpuCores;
        this.runnerRamMax = home.ramMax;
        
        this.securityDecrease = ns.weakenAnalyze(1, this.runnerCoresCount);
        this.weakenRam = ns.getScriptRam('/hydra/weaken.js', IcaConfig.RUNNER_NAME);
    }
    
    
    async reduceSecurityToMinimum() {
        this._logTargetStatus('AA', 'AA');
        
        const weakenThreadsCount = this._computeWeakenThreadsCount();
        
        let blockId = -1;
        let theoreticalSecurityLevel = this.initSecurityLevel;
        while (blockId++ < IcaConfig.LOOP_SECURITY) {
            
            if (blockId > 0)
                await this.ns.sleep(200);
            
            this.ns.exec('/hydra/weaken.js', IcaConfig.RUNNER_NAME, weakenThreadsCount, this.target.hostname,
                weakenThreadsCount, false, blockId, 0);
            
            theoreticalSecurityLevel -= this.securityDecrease * weakenThreadsCount;
            if (theoreticalSecurityLevel < this.target.securityMin)
                break;
        }
        
        this._logTargetStatus('BB', 'BB');
    }
    
    
    _computeWeakenThreadsCount() {
        const amountOfSecurityToDecrease = this.initSecurityLevel - this.target.securityMin;
        const threadAmountToDecreaseSecurityToMin = Math.ceil(amountOfSecurityToDecrease / this.securityDecrease);
        const maxThreadAvailable = Math.floor(IcaConfig.WEAKEN_RAM_MAX_FACTOR * this.runnerRamMax / this.weakenRam);
        const weakenThreadsCount = Math.min(threadAmountToDecreaseSecurityToMin, maxThreadAvailable) + 1;
        return weakenThreadsCount;
    }
    
    
    async growMoneyToMaximumWhileKeepingSecurityMinimum() {
        
        let blockId = -1;
        let theoreticalAvailableMoney = this.initAvailableMoney;
        while (blockId++ < IcaConfig.LOOP_SECURITY) {
            
            if (blockId > 0)
                await this.ns.sleep(2 * 200);
            
            this.ns.exec('/hydra/47-daemon.js', 'home', 1, this.target.hostname, blockId);
            
            theoreticalAvailableMoney += this._getTheoreticalMoneyGain();
            if (theoreticalAvailableMoney > this.target.moneyMax)
                break;
            
        }
        
        this._logTargetStatus('BB', 'BB');
    }
    
    
    async reduceSecurityToMinimumAndGrowMoneyToMaximum() {
        this._logTargetStatus('A', 'A');
        
        let blockId = -1;
        while (blockId++ < IcaConfig.LOOP_SECURITY) {
        
            if (blockId > 0) {
                await this.ns.sleep(2 * 200);
                this._updateTheoreticalServerState();
            }
    
            if (this.theoreticalAvailableMoney > this.target.moneyMax)
                break;
        
            this.ns.exec('/hydra/47-daemon.js', IcaConfig.RUNNER_NAME, 1, this.target.hostname, this.theoreticalSecurityLevel, this.theoreticalAvailableMoney, blockId);
            
        }
    }
    
    _updateTheoreticalServerState() {
        const [theoreticalSecurityDecrease, theoreticalMoneyIncrease] = this._getTheoreticalServerChanges();
        this.theoreticalSecurityLevel += theoreticalSecurityDecrease;
        this.theoreticalAvailableMoney += theoreticalMoneyIncrease;
    }
    
    _getTheoreticalServerChanges() {
        
        const queueValue = this.ns.readPort(IcaConfig.QUEUE_ID);
        
        if (queueValue !== NsConst.EMPTY_QUEUE) {
            return queueValue;
            
        } else {
            return [0, 0];
        }
    }
    
    
    _logTargetStatus(blockId, stepId) {
        let msg = `Target status: ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        Log.info(this.ns, `${this.target.hostname} - Shiva-${blockId}-${stepId} - ${msg}`);
    }
    
}