import {INs} from '/pkg.helpers';
import { Player } from '/services/player';
import {ServiceName, ServiceProvider} from '/services/service';
import {Network, Server} from '/services/network';

export async function main(ns: INs): Promise<void> {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
}


class toto