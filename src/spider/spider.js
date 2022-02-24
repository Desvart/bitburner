import {Log}	        from '/helper.js';
import {Network}        from '/network.js';
import {SpiderConfig} 	from '/src/config/config.js';

export class Spider {
    network;
    availableContracts;
    #snapshotFile;
    #ns;

    constructor(ns) {
        this.#ns            = ns;
        this.#snapshotFile  = SpiderConfig.snapshotFile;
        this.network        = this.#loadNetwork();
    }


    #loadNetwork() {

        if (this.#ns.getPlayer().hacking === 1) {
		    this.#ns.rm(this.#snapshotFile);
            Log.warn(this.#ns, 'SPIDER - Network snapshot deleted.');
        }

		let network = new Network(this.#ns);

/*		if (this.#ns.fileExists(this.#snapshotFile, 'home') === true) {
            network.restore(JSON.parse(this.#ns.read(this.#snapshotFile)));
			//let networkToRetrieve   = JSON.parse(this.#ns.read(this.#snapshotFile));
			//network.nodesNameList 	= networkToRetrieve.nodesNameList;
			//network.nodesCount		= networkToRetrieve.nodesCount;
			//network.nodesList		= networkToRetrieve.nodesList;
		}
        */
		
		return network;
	}


    async patrol() {
        //this.#updateAdminStatus();
        await this.#backupNetwork();
        this.#updateAvailableContracts();
    }


    #updateAdminStatus() {
        if (this.network.isFullyOwned === false) {
            for (let node of this.network.nodesList) {
                node.hasAdminRights = this.#ns.getServer(node.hostname).hasAdminRights;
            }
            Log.info(this.#ns, 'SPIDER - Admin status updated.');
        } else {
            Log.info(this.#ns, 'SPIDER - Network fully owned.');
        }
    }


    async #backupNetwork() {
        await this.#ns.write(this.#snapshotFile, JSON.stringify(this.network), 'w');
        Log.info(this.#ns, 'SPIDER - Network backuped.');
    }


    #updateAvailableContracts() {
     	let contractsList = [];
		for (let node of this.network.nodesList) {
			const foundContractList = this.#ns.ls(node.hostname, 'cct');
			for (let contract of foundContractList)
				contractsList.push([contract, node.hostname]);
		}

		this.availableContracts = contractsList;
        Log.info(this.#ns, 'SPIDER - Contracts list updated.\n');
    }

}