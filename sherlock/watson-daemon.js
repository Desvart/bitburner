import {Log, initDaemon, nowStr}    from '/helper.js';
import {WatsonConfig}               from '/config/config.js';
import {Contract}                   from './contract.js';
import {Sherlock}                   from './sherlock.js';

export async function main(ns) {
    initDaemon(ns, 'watson.js', WatsonConfig.displayTail);

    const rawContractsList = JSON.parse(ns.args[0]);
    let watsonDaemon = new WatsonDaemon(ns, rawContractsList);
    await watsonDaemon.wakeup();
}


class WatsonDaemon {

    #ns;
    #rewardDisplay;
    #contractsList

    constructor(ns, rawContractsList) {
        this.#ns            = ns;
        this.#rewardDisplay = WatsonConfig.rewardDisplay;
        this.#contractsList = this.#prepareContracts(rawContractsList);
    }


    async wakeup() {

        const sherlock = new Sherlock(this.#ns);

        for (let contract of this.#contractsList) {
            
            if (this.#ns.ls(contract.location, '.cct').includes(contract.name) === true) {
                contract = sherlock.solve(contract);
            } else {
                Log.warn(this.#ns, `WATSON_DAEMON - Contract ${contract.name} doesn't exist anymore on ${contract.location}.`);
                continue;
            }

            if (contract.solution !== "Not implemented yet") {
                contract = this.#submitSolution(contract);
                await this.#reportResult(contract);              
            } else {
                Log.warn(this.#ns, `WATSON_DAEMON - Solver for contract type "${contract.type}" not yet implemented.\nContract ${contract.name} on ${contract.location}) skipped.`);
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
        const rewardConfig = { returnReward: this.#rewardDisplay };
        contract.reward = this.#ns.codingcontract.attempt(contract.solution, contract.name, contract.location, rewardConfig)
        return contract;
    }


    async #reportResult(contract) {
        if (contract.reward !== "" || contract.reward === true) {
            Log.success(this.#ns, `WATSON_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved. Reward: ${contract.reward}`, null);
            //this.#ns.toast(`INFO - WATSON_DAEMON - Contract solved (${contract.type}). Reward: ${contract.reward}`, "success", null);
        }
        else {
            const errorLog = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\nType: ${contract.type}\nData: ${JSON.stringify(contract.data)}\n\n`;
            await this.#ns.write('sherlockfails.log.txt', errorLog, 'a');
            this.#ns.toast(`ERROR - WATSON_DAEMON - Contract resolution failed! - ${contract.name} @ ${contract.location}`, "error", null);
            Log.error(this.#ns, `WATSON_DAEMON - Contract ${contract.name} on ${contract.location} resolution has failed! Sherlock fired!`);
        }
    }

}