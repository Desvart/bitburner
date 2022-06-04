import {INs} from '/resources/helpers';
import {getService, ServiceName} from '/resources/service';
import {Server} from '/resources/network';
import {Deployer, Job} from '/resources/deployer';

/** @param {NS} ns **/
export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const a = undefined;
    
    if (a)
        ns.print('a = undefined');
    else
        ns.print('a = terst');
    
    if (a === undefined)
        ns.print('a === undefined');
    
}