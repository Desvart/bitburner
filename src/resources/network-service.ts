import {Log} from '/resources/helpers';
import {Service, ServiceName} from '/resources/service';
import {Network} from '/resources/network';

export async function main(ns) {
    /*ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();*/
    
    const network = new Network(ns);
    const service = new Service(ns, new Log(ns), ServiceName.Network, network);
    await service.start();
    
    ns.closeTail();
}