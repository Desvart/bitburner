import {Manager} from '/hacknet/manager.js';

export async function main(ns) {

    const flags = ns.flags([
        ['deploy', false],
        ['operate', false],
    ]);
    
    console.debug({flags});
    
    const manager = new Manager(ns);
    
    if (flags.deploy === true) {
        manager.kill();
        manager.setupInfra();
        await manager.deploy();
        manager.activate();
    }
    
    if (flags.operate === true) {
        console.debug('test');
        await manager.operate();
    }
}