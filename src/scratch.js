import {Node} from './hacknet/model/server.ts';
import {NsAdapter} from './hacknet/adapters/hacknet-adapters.ts';
import {LogNsAdapter} from './resources/helpers.ts';
import {Component} from './hacknet/model/component.ts';

export function main(ns) {
    ns.tail(); ns.disableLog('ALL'); ns.clearLog();
    
    let node = new Node(new NsAdapter(ns), new LogNsAdapter(ns), 5);
    
    ns.print(node.upgrade(Component.Core, 1));
    
}