import {HacknetDaemon} from '/hacknet/hacknet-daemon.js';


export async function main(ns) {
    ns.tail(); ns.disableLog('ALL'); ns.clearLog();
    
    const target = 'foodnstuff';
    ns.rm('/helpers/helper.js', target);
    ns.rm('/config/config.js', target);
    ns.rm('/hacknet/hacknet-daemon.js', target);
    ns.rm('/hacknet/hacknet-farm.js', target);
    ns.rm('/hacknet/hacknet-node.js', target);
    
    
    await new HacknetDaemon(ns, target).deploy().then(obj => obj.activate());
    
  
    
}