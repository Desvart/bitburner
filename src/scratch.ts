import {INs} from '/helpers';
import {getService, ServiceName} from '/services/service';
import {Player} from '/services/player';
import {Network} from '/services/network';

/* ALIASES
 * SCAN
 * MON
 * KILL
 * INIT
 * CONNECT
 */

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const files = ns.ls('home');
    ns.print(files.join('\n'));
    
}

// 4.75