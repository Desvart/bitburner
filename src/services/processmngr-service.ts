import {Service, ServiceName} from '/services/service';
import { ProcessMngr } from '/services/processmngr';

export async function main(ns) {
    const processMngr = new ProcessMngr(ns);
    const service = new Service(ns, ServiceName.ProcessMngr, processMngr);
    await service.start();
}