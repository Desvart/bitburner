import {Deployer} from '/services/deployer';
import {Log} from '/helpers';
import {Service, ServiceName} from '/services/service';

export async function main(ns) {
    /*ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();*/
    
    const deployer = new Deployer(ns, new Log(ns));
    const service = new Service(ns, new Log(ns), ServiceName.Deployer, deployer);
    await service.start();
    
    ns.closeTail();
}