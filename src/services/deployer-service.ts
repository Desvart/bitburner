import {Deployer} from '/services/deployer';
import {Log} from '/pkg.helpers';
import {Service, ServiceName} from '/services/service';

export async function main(ns) {
    const deployer = new Deployer(ns);
    const service = new Service(ns, ServiceName.Deployer, deployer);
    await service.start();
    
    ns.closeTail();
}