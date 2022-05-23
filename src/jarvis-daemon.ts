import {INs, Log} from '/resources/helpers';
import {Server} from '/jarvis/server';
import {getService, ServiceName} from '/resources/service';
import {Network} from '/resources/network';

/** @param {NS} ns **/
export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const log = new Log(ns);
    const jarvis = new Jarvis(ns, log);
    
    await jarvis.startService(ServiceName.Network);
    
    
    
    //ns.closeTail();
}


class Jarvis {
    private network: Network;
    constructor(private ns: INs, private log: Log) {
    }
    
    async startService(serviceName: ServiceName): Promise<void> {
        
        const serviceFile = `/resources/${ServiceName[serviceName].toLowerCase()}-service.js`;
        this.ns.run(serviceFile, 1);
        
        this.network = await getService(this.ns, serviceName);
    }
    
}