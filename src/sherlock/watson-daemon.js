import {Log, initDaemon, nowStr}    from '/helpers/helper.js';
import {WatsonConfig}               from '/config/config.js';
import {Contract}                   from '/sherlock/contract.js';
import {Sherlock}                   from '/sherlock/sherlock.js';

export async function main(ns) {
    initDaemon(ns, 'watson.js', WatsonConfig.displayTail);

    const rawContractsList = JSON.parse(ns.args[0]);
    let watsonDaemon = new WatsonDaemon(ns, rawContractsList);
    await watsonDaemon.wakeup();
}


class WatsonDaemon {

    _ns;
    _rewardDisplay;
    _contractsList;

    constructor(ns, rawContractsList) {
        this._ns            = ns;
        this._rewardDisplay = WatsonConfig.rewardDisplay;
        this._contractsList = this._prepareContracts(rawContractsList);
    }


    async wakeup() {

        const sherlock = new Sherlock(this._ns);

        for (let contract of this._contractsList) {
            
            if (this._ns.ls(contract.location, '.cct').includes(contract.name) === true) {
                contract = sherlock.solve(contract);
            } else {
                Log.warn(this._ns, `WATSON_DAEMON - Contract ${contract.name} doesn't exist anymore on ${contract.location}.`);
                continue;
            }

            if (contract.solution !== "Not implemented yet") {
                contract = this._submitSolution(contract);
                await this._reportResult(contract);              
            } else {
                Log.warn(this._ns, `WATSON_DAEMON - Solver for contract type "${contract.type}" not yet implemented.\nContract ${contract.name} on ${contract.location}) skipped.`);
            }
        }
    }


    _prepareContracts(rawContractsList) {

        let contractsList = [];

        for (const [name, location] of rawContractsList) {
            contractsList.push(new Contract(this._ns, name, location));
        }

        return contractsList;
    }


    _submitSolution(contract) {
        const rewardConfig = { returnReward: this._rewardDisplay };
        contract.reward = this._ns.codingcontract.attempt(contract.solution, contract.name, contract.location, rewardConfig)
        return contract;
    }


    async _reportResult(contract) {
        if (contract.reward !== "" || contract.reward === true) {
            Log.success(this._ns, `WATSON_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved. Reward: ${contract.reward}`, null);
            //this.#ns.toast(`INFO - WATSON_DAEMON - Contract solved (${contract.type}). Reward: ${contract.reward}`, "success", null);
        }
        else {
            const errorLog = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\nType: ${contract.type}\nData: ${JSON.stringify(contract.data)}\n\n`;
            await this._ns.write('sherlockfails.log.txt', errorLog, 'a');
            this._ns.toast(`ERROR - WATSON_DAEMON - Contract resolution failed! - ${contract.name} @ ${contract.location}`, "error", null);
            Log.error(this._ns, `WATSON_DAEMON - Contract ${contract.name} on ${contract.location} resolution has failed! Sherlock fired!`);
        }
    }

}