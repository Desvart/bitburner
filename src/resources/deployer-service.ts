import {Deployer} from '/resources/deployer';
import {Log} from '/resources/helpers';
import {Service, ServiceName} from '/resources/service';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const deployer = new Deployer(ns, new Log(ns));
    const service = new Service(ns, new Log(ns), ServiceName.Deployer, deployer);
    await service.run();
    
    ns.closeTail();
}