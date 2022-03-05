import {Log, initDaemon, nowStr} from '/helpers/helper.js';
import {WATSON_CONFIG} from '/config/config.js';
import {Contract} from '/sherlock/contract.js';
import {Sherlock} from '/sherlock/sherlock.js';


export async function main(ns) {
    initDaemon(ns, 'watson.js', WATSON_CONFIG.DISPLAY_TAIL);
    
    const rawContractsList = JSON.parse(ns.args[0]);
    const watsonDaemon = new WatsonDaemon(ns, rawContractsList);
    await watsonDaemon.wakeup();
}


class WatsonDaemon {
    
    #ns;
    #CONFIG = WATSON_CONFIG;
    #contractsList;
    
    
    constructor(ns, rawContractsList) {
        this.#ns = ns;
        this.#contractsList = this.#prepareContracts(rawContractsList);
    }
    
    
    static call(ns, contractsList) {
        
        ns.exec(WATSON_CONFIG.DAEMON_FILE, WATSON_CONFIG.LOCATION, 1, JSON.stringify(contractsList));
        
    }
    
    
    async wakeup() {
        
        const sherlock = new Sherlock(this.#ns);
        
        for (let contract of this.#contractsList) {
            
            if (this.#ns.ls(contract.location, '.cct').includes(contract.name) === true) {
                contract = sherlock.solve(contract);
                
            } else {
                const msg = `WATSON_DAEMON - Contract ${contract.name} doesn't exist anymore on ${contract.location}.`;
                Log.warn(this.#ns, msg);
                continue;
            }
            
            if (contract.solution !== 'Not implemented yet') {
                contract = this.#submitSolution(contract);
                await this.#reportResult(contract);
                
            } else {
                const msg1 = `WATSON_DAEMON - Solver for contract type "${contract.type}" not yet implemented.\n`;
                const msg2 = `Contract ${contract.name} on ${contract.location}) skipped.`;
                Log.warn(this.#ns, msg1 + msg2);
            }
        }
    }
    
    
    #prepareContracts(rawContractsList) {
        
        let contractsList = [];
        for (const [name, location] of rawContractsList) {
            contractsList.push(new Contract(this.#ns, name, location));
        }
        
        return contractsList;
    }
    
    
    #submitSolution(contract) {
        const rewardConfig = {returnReward: this.#CONFIG.REWARD_DISPLAY};
        contract.reward = this.#ns.codingcontract.attempt(contract.solution, contract.name, contract.location, rewardConfig);
        return contract;
    }
    
    
    async #reportResult(contract) {
        if (contract.reward !== '' || contract.reward === true) {
            const msg1 = `WATSON_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved.`;
            const msg2 = `Reward: ${contract.reward}`;
            Log.success(this.#ns, msg1 + msg2, null);

        } else {
            const errorLog1 = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\n`;
            const errorLog2 = `Type: ${contract.type}\nData: ${JSON.stringify(contract.data)}\n\n`;
            await this.#ns.write(this.#CONFIG.LOGFILE, errorLog1 + errorLog2, 'a');
            
            const msg = `ERROR - WATSON_DAEMON - Contract resolution failed! - ${contract.name} @ ${contract.location}`;
            this.#ns.toast(msg, 'error', null);
            
            const msg2 = `WATSON_DAEMON - Contract ${contract.name} on ${contract.location} resolution has failed!`;
            Log.error(this.#ns, msg2 + ' Sherlock fired!');
        }
    }
    
}