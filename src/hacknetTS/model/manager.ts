import {Farm} from '/hacknetTS/model/farm.js';
import {config} from '/hacknetTS/model/config.js';
import {HacknetNsAdapter} from '/hacknetTS/hacknet-ns-adapter.js';
import {LogNsAdapter} from '/resources/helperTS.js';

export class Manager {
    private farm: Farm;
    private readonly nsA: HacknetNsAdapter;
    private readonly logA: LogNsAdapter;
    
    constructor(nsA: HacknetNsAdapter, logA: LogNsAdapter) {
        this.nsA = nsA;
        this.logA = logA;
        this.farm = new Farm(nsA, logA);
    }
    
    kill(): void {
        this.nsA.kill(config.DAEMON_FILE, config.LOCATION, '--operate');
    }
}