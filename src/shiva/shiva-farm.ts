import {LogNsAdapter} from '/resources/helpers';

export class HackingFarm {
    SERVER_COUNT_LIMIT;
    SERVER_RAM_LIMIT;
    logA: LogNsAdapter;
    #ns;
    
    get serversList() { return this.#ns.getPurchasedServers(); }
    
    get serverCount() { return this.serversList.length; }
    
    constructor(ns) {
        this.#ns = ns;
        this.logA = new LogNsAdapter(ns);
        this.SERVER_COUNT_LIMIT = ns.getPurchasedServerLimit();
        this.SERVER_RAM_LIMIT = ns.getPurchasedServerMaxRam();
    }
    
    buyNewServer(serverName, ramSize) {
        const ns = this.#ns;
        if (this.checkIfLimitReached(serverName) === false && this.checkIfEnoughMoney(serverName, ramSize) === true) {
            const purchasedResponse = this.#ns.purchaseServer(serverName, ramSize);
            return this.validatePurchase(purchasedResponse, serverName);
        } else {
            return null;
        }
    }
    
    checkIfLimitReached(serverName) {
        if (this.#ns.getPurchasedServers().length < this.#ns.getPurchasedServerLimit()) {
            return false;
        } else {
            this.logA.warn(`HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                Max number of servers already bought.`);
            return true;
        }
    }
    
    checkIfEnoughMoney(serverName, ramSize) {
        const serverCost = this.#ns.getPurchasedServerCost(ramSize);
        const availableMoney = this.#ns.getServerMoneyAvailable('home');
        if (serverCost < availableMoney) {
            return true;
        } else {
            this.logA.warn(`HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                    Not enough money ${availableMoney} / ${serverCost}.`);
            return false;
        }
    }
    
    validatePurchase(purchasedResponse= [], serverName) {
        if (purchasedResponse.length !== 0) {
            return purchasedResponse;
        } else {
            this.logA.error(`HYDRA_DAEMON - Cannot purchase new server ${serverName}. Unknown error.`);
        }
    }
    
    deleteServer(serverName = []) {
        if (serverName.length !== 0) {
            
            this.#ns.killall(serverName);
            const resp = this.#ns.deleteServer(serverName);
            
            if (resp === true) {
                this.logA.info(`HYDRA_DAEMON - Successfully deleted server ${serverName}.`);
            } else {
                this.logA.error(`HYDRA_DAEMON - Cannot delete server ${serverName}. Unknown error.`);
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