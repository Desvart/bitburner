import {Log}	        from '/helpers/helper.js';
import {Network}      from '/spider/network.js';
import {SpiderConfig} from '/config/config.js';

export class Spider {
    network;
    availableContracts;
    _snapshotFile;
    _ns;

    constructor(ns) {
        this._ns            = ns;
        this._snapshotFile  = SpiderConfig.snapshotFile;
        this.network        = this.#loadNetwork();
    }


    #loadNetwork() {

        if (this._ns.getPlayer().hacking === 1) {
		    this._ns.rm(this._snapshotFile);
            Log.warn(this._ns, 'SPIDER - Network snapshot deleted.');
        }

		let network = new Network(this._ns);

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
                node.hasAdminRights = this._ns.getServer(node.hostname).hasAdminRights;
            }
            Log.info(this._ns, 'SPIDER - Admin status updated.');
        } else {
            Log.info(this._ns, 'SPIDER - Network fully owned.');
        }
    }


    async #backupNetwork() {
        await this._ns.write(this._snapshotFile, JSON.stringify(this.network), 'w');
        Log.info(this._ns, 'SPIDER - Network backuped.');
    }


    #updateAvailableContracts() {
     	let contractsList = [];
		for (let node of this.network.nodesList) {
			const foundContractList = this._ns.ls(node.hostname, 'cct');
			for (let contract of foundContractList)
				contractsList.push([contract, node.hostname]);
		}

		this.availableContracts = contractsList;
        Log.info(this._ns, 'SPIDER - Contracts list updated.\n');
    }

}