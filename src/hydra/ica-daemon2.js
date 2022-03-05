import {IcaConfig, NsConst} from '/config/config.js';
import {NetworkNode} from '/network/server.js';
import {Log} from '/helpers/helper.js';


export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const targetName = ns.args[0];
    
    const ica = new Ica(ns, targetName);
    await ica.reduceSecurityToMinimumAndGrowMoneyToMaximum();
    
}

class Ica {
    
    constructor(ns, targetName) {
        this.ns = ns;
        this.target = new NetworkNode(ns, targetName);
        this.targetState = {
            theoreticalSecurityLevel: this.target.actualSecurity,
            theoreticalAvailableMoney: this.target.availableMoney
        };
    }
    
    async reduceSecurityToMinimumAndGrowMoneyToMaximum() {
        this._logTargetStatus('A', 'A');
        
        let blockId = -1;
        while (blockId++ < IcaConfig.LOOP_SECURITY) {
        
            if (blockId > 0) {
                await this.ns.sleep(2 * 200);
                this._updateTheoreticalServerState();
            }
    
            if (this.targetState.theoreticalAvailableMoney > this.target.moneyMax)
                break;
        
            this.ns.exec('/hydra/47-daemon.js', IcaConfig.RUNNER_NAME, 1, this.target.hostname, this.targetState, blockId);
            
        }
    }
    
    _updateTheoreticalServerState() {
        const [theoreticalSecurityDecrease, theoreticalMoneyIncrease] = this._getTheoreticalServerChanges();
        this.targetState.theoreticalSecurityLevel += theoreticalSecurityDecrease;
        this.targetState.theoreticalAvailableMoney += theoreticalMoneyIncrease;
    }
    
    _getTheoreticalServerChanges() {
    
        const queueValue = this.ns.readPort(IcaConfig.QUEUE_ID)
        
        if (queueValue !== NsConst.EMPTY_QUEUE) {
            const theoreticalServerChanges = JSON.parse(queueValue);
            return theoreticalServerChanges;
            
        } else {
            return [0, 0];
        }
    }
    
    
    _logTargetStatus(blockId, stepId) {
        let msg = `Target status: ${Math.floor(this.target.availableMoney)} \$, SEC-${this.target.actualSecurity}`;
        Log.info(this.ns, `${this.target.hostname} - Shiva-${blockId}-${stepId} - ${msg}`);
    }
    
}