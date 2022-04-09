import {HacknetAdapters} from '/hacknet/hacknet-adapters.js';
import {LogNsAdapter} from '/resources/helpers.js';
import {Farm} from '/hacknet/farm.js'
import {HACKNET_CONFIG} from '/hacknet/hacknet-config';

export async function main(ns) {
    
    ns.disableLog('ALL');
    if (HACKNET_CONFIG.DISPLAY_TAIL === true) {
        ns.tail();
        ns.clearLog();
    }
    
    const nsA: HacknetAdapters = new HacknetAdapters(ns);
    const logA: LogNsAdapter = new LogNsAdapter(ns);
    await new Farm(nsA, logA).operate();
    
}