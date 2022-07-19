import {ServiceProvider} from '/services/service';
import {IJob, INs} from '/utils/interfaces';
import {Job} from '/services/deployer';
import {debug} from 'util';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const network = ServiceProvider.getNetwork(ns);
    const player = ServiceProvider.getPlayers(ns);
    const deployer = ServiceProvider.getDeployer(ns);
    
    const target = network.getNode('joesguns');
    const home = network.getNode('home');
    debugger
    const batchReqModel = target.getModelBatch(player, home.cores);
    
    ns.print({batchReqModel});
    
    // hwgw.batchBuilder(0, target); // warmup
    // hwgw.batchBuilder(moneyRatio, target);
    // hwgw.batchBuilder(amountToSteal, target);
    // hwgw.batchBuilder(batchReq);
    
    // manager.execute(batchReq); // Oneshot
    // manager.warmup(target); // Oneshot
    // manager.execute(job); // Oneshot
    // manager.execute(amountToSteal, target); // Oneshot
    // manager.run(batchReq); // Loop
    // manager.run(moneyRatio, target); // Loop
    
    
    
    const batch = deployer.threads2Batch(batchReqModel, 'joesguns', 500);
    
    printBatch(ns, batch);
}

function printBatch(ns2: INs, batch: Array<IJob>) {
    for (let job of batch) {
        const {ns, ...jobCpy} = job;
        ns2.print({jobCpy});
        ns2.print('0');
    }
}