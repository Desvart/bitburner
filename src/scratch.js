import {Node} from './hacknet/model/node.ts';
import {NsAdapter} from './hacknet/adapters/ns-adapter.ts';
import {LogNsAdapter} from './resources/helper.ts';
import {Component} from './hacknet/model/component.ts';

export async function main(ns) {
    ns.tail(); ns.disableLog('ALL'); ns.clearLog();
    
    let node = new Node(new NsAdapter(ns), new LogNsAdapter(ns), 5);
    
    ns.print(node.upgrade(Component.Core, 1));
    
    
    
    
}