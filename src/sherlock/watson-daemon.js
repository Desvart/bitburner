import {Log, initDaemon, nowStr} from '/helpers/helper.js';
import {WATSON_CONFIG as config} from '/config/config.js';
import {Contract} from '/sherlock/contract.js';
import {Sherlock} from '/sherlock/sherlock.js';

export async function main(ns) {
    initDaemon(ns, config.DISPLAY_TAIL);
    const rawContractsList = JSON.parse(ns.args[0]);
    await new WatsonDaemon(ns, rawContractsList).wakeup();
}

export class WatsonDaemon {
    #contractsList;
    #ns;
    
    constructor(ns, rawContractsList = []) {
        this.#ns = ns;
        this.#contractsList = this.#prepareContracts(rawContractsList);
    }
    
    call(rawContractsList) {
        this.#ns.exec(config.DAEMON_FILE, config.LOCATION, 1, JSON.stringify(rawContractsList));
    }
    
    async wakeup() {
        for (let contract of this.#contractsList) {
            if (this.#ns.ls(contract.location, '.cct').includes(contract.name) === true) {
                contract = new Sherlock(this.#ns).solve(contract);
                
            } else {
                const msg = `WATSON_DAEMON - Contract ${contract.name} doesn't exist anymore on ${contract.location}.`;
                Log.warn(this.#ns, msg);
                continue;
            }
            
            if (contract.solution !== 'Not implemented yet') {
                contract = this.#submitSolution(contract);
                await this.#reportResult(contract);
                
            } else {
                const msg = `WATSON_DAEMON - Solver for contract type "${contract.type}" not yet implemented.\n
                    Contract ${contract.name} on ${contract.location}) skipped.`;
                Log.warn(this.#ns, msg);
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
        const rwrdTgl = {returnReward: config.REWARD_DISPLAY};
        contract.reward = this.#ns.codingcontract.attempt(contract.solution, contract.name, contract.location, rwrdTgl);
        return contract;
    }
    
    async #reportResult(contract) {
        if (contract.reward !== '' || contract.reward === true) {
            const msg = `WATSON_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved.
                Reward: ${contract.reward}`;
            Log.success(this.#ns, msg, null);
            
        } else {
            const errorLog = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\n
                Type: ${contract.type}\nData: ${JSON.stringify(contract.data)}\n\n`;
            await this.#ns.write(config.LOGFILE, errorLog, 'a');
            
            const msg = `ERROR - WATSON_DAEMON - Contract resolution failed! - ${contract.name} (${contract.type})
                @${contract.location}`;
            Log.warn(this.#ns, msg);
        }
    }
    
}