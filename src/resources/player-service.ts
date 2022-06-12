import {Log} from '/resources/helpers';
import {Service, ServiceName} from '/resources/service';
import {Player} from '/resources/player';

export async function main(ns) {
    /*ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();*/
    
    const player = new Player(ns);
    const service = new Service(ns, new Log(ns), ServiceName.Network, player);
    await service.start();
    
    ns.closeTail();
}