import {Node} from './hacknetTS/node.js';
import {HacknetNsAdapter} from './hacknetTS/hacknet-ns-adapter.js';
import {LogNsAdapter} from './resources/helperTS.js';
import {Component} from './hacknetTS/component.js';

export async function main(ns) {
    ns.tail(); ns.disableLog('ALL'); ns.clearLog();
    
    let node = new Node(new HacknetNsAdapter(ns), new LogNsAdapter(ns), 5);
    
    ns.print(node.upgrade(Component.Core, 1));
    
    
  
    
}