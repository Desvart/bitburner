import {Log} from '/helpers';
import {Service, ServiceName} from '/services/service';
import {Network} from '/services/network';

export async function main(ns) {
    const network = new Network(ns);
    const service = new Service(ns, new Log(ns), ServiceName.Network, network);
    await service.start();
}