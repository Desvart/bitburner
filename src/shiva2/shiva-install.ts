import {SHIVA_CONFIG} from '/shiva2/shiva-config';

export async function main(ns) {
    const target: string = ns.args[0];
    const runner: string = ns.args[1];
    
    const nsA = new ShivaInstallAdapter(ns);
    
    await uploadShivaOnRunner(nsA, runner);
    launchShivaSetup(nsA, target, runner);
}

async function uploadShivaOnRunner(nsA: ShivaInstallAdapter, runner: string) {
    await nsA.scp(SHIVA_CONFIG.SETUP_PACKAGE, runner);
    await nsA.scp(SHIVA_CONFIG.RUN_PACKAGE, runner);
}

function launchShivaSetup(nsA: ShivaInstallAdapter, target: string, runner: string) {
    nsA.spawn(SHIVA_CONFIG.SETUP_PACKAGE[0], target, runner);
}

class ShivaInstallAdapter {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    async scp(files: string[], target: string): Promise<void> {
        await this.ns.scp(files, 'home', target);
    }
    
    spawn(file: string, target: string, runner: string) {
        this.ns.spawn(file, 1, target, runner);
    }
    
}
