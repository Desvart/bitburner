import {getService, ServiceName} from '/resources/service';
import {hostname} from 'os';
import {Network} from '/resources/network';
import {Player} from '/resources/player';

export async function main(ns) {
    
    const flags = ns.flags([
        ['refreshrate', 1000],
    ]);
    
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    // noinspection InfiniteLoopJS
    while (true) {
        
        const player = getService<Player>(ns, ServiceName.Player);
        let network = getService<Network>(ns, ServiceName.Network);
        
        ns.clearLog();
        ns.print(`Player level  : ${player?.hacking.level}`);
        ns.print(`Player money  : ${player?.money}`);
        ns.print(`Servers count : ${network?.length}`);
        
        let test = '';
        for (let i = 0; i < network.length; i++) {
            test += network[i].id;
        }
        
        const test2 = network.map(serv => serv.id);
        ns.print(`Servers list  : ${network?.map(serv => serv.id)}`);
        
        await ns.sleep(flags.refreshrate);
    }
}