import {INs, Log} from '/resources/helpers';
import {Install} from '/resources/install';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const install = new Install(ns, new Log(ns));
    await install.downloadPackage();
    install.launchDaemon();
}