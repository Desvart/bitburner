import {Log, nowStr} from '/helpers/helper.js';
import {HacknetConfig, JarvisConfig, ShivaConfig} from '/config/config.js';
import {HacknetDaemon} from '/hacknet/hacknet-daemon.js';
import {Network} from '/network/network.js';
import {NetworkNode} from '/network/server.js';
import {Hydra} from '/hydra/hydra-daemon.js';
import {HacknetNode} from './hacknet/hacknet-node.js';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const child = new Child(ns,5);
    child.foo2(6);
    child.foo(7);
    
    ns.print(`Child.a: ${child.a}`);
    
  
    /*
      for (let i = 1; i <= 20; i++) {
        ns.print(`${i} - ${Math.pow(2, i)} GB of RAM = ${ns.getPurchasedServerCost(Math.pow(2, i)) / 1e6} M\$`);
      }
    */
    
    // ns.purchaseServer('pserv-Shiva3', Math.pow(2, 15));
}

class Parent {
    constructor(ns, a) {
        this.ns = ns;
        this['a'] = a;
    }
    
    foo(b) {
        this.ns.print({b});
        this.ns.print(`this.a: ${this['a']}`);
    }
}

class Child extends Parent {
    constructor(ns, c) {
        super(ns, c);
    }
    
    foo2(d) {
        this.ns.print({d});
        this.ns.print(`this.a (in child): ${this['a']}`);
    }
    
}