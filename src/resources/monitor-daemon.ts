import {INs} from '/resources/helpers';
import Player from '/resources/player';

const FLAGS: [string, number | boolean][] = [
    ['refreshRate', 1000],
    ['help', false]
];

export async function main(ns) {
    /*ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();*/
    
    const flags = ns.flags(FLAGS);
    
    if (flags.help) {
        ns.tprint(`This script monitors the player characteristics and the services status.`);
        ns.tprint(`USAGE: run ${ns.getScriptName()}`);
        return;
    }
    
    await new Monitor(ns).start(flags.refreshRate);
}

class Monitor {
    
    private headerHook: any;
    private valueHook: any;
    private running: boolean;
    private network: string[];
    
    constructor(private ns: INs) {
        
        this.ns.atExit(this.tearDown.bind(this));
        
        const doc = eval('document');
        this.headerHook = doc.getElementById('overview-extra-hook-0');
        this.valueHook = doc.getElementById('overview-extra-hook-1');
        this.network = this.retrieveNetwork();
    }
    
    async start(refreshRate: number) {
        this.running = true;
        while (this.running) {
            try {
                const elementsToMonitorAsArray = [...await this.getElementsToMonitor()];
                this.headerHook.innerText = elementsToMonitorAsArray.map(n => n[0]).join( ' \n')
                this.valueHook.innerText = elementsToMonitorAsArray.map(n => n[1]).join( '\n')
            } catch (err) {
                this.ns.print('ERROR: Update Skipped: ' + String(err));
            }
            await this.ns.asleep(refreshRate);
        }
        this.tearDown();
    }
    
    async getElementsToMonitor(): Promise<Map<string, string>> {
        let elementsToMonitorMap = new Map<string, string>();
    
        const player: Player = new Player(this.ns);
        elementsToMonitorMap.set('----------', '----------');
        elementsToMonitorMap.set('Ports key', `${player.portsKeyCount}/5`);
        elementsToMonitorMap.set('TOR', player.software.tor ? '✅' : '🔴');
        elementsToMonitorMap.set('Formulas', player.software.formulas ? '✅' : '🔴');
        elementsToMonitorMap.set('Market WSE', player.market.wse.wse && player.market.wse.fourSigma ? '✅' : '🔴');
        elementsToMonitorMap.set('Market API', player.market.api.tix && player.market.api.fourSigma ? '✅' : '🔴');
        elementsToMonitorMap.set('__________', '__________');
        
        for (const serviceFile of this.getServiceList()) {
            const serviceName: string = this.getServiceNameFromServiceFile(serviceFile);
            const serviceStatus: boolean = this.checkIfScriptRunning(serviceFile);
            elementsToMonitorMap.set(serviceName, serviceStatus ? '✅' : '🔴');
        }
        return elementsToMonitorMap;
    }
    
    getServiceList(): string[] {
        return this.ns.ls('home', '-service.js');
    }
    
    getServiceNameFromServiceFile(serviceFile): string {
        const regExp = /\/resources\/(.*)-service.js/;
        const serviceName = eval('regExp.exec(serviceFile)[1]');
        return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }
    
    checkIfScriptRunning(serviceFile: string): boolean {
        return this.network
        .filter(hostname => this.ns.ps(hostname)
        .filter(process => process.filename === serviceFile)
            .length > 0)
            .length > 0;
    }
    
    private retrieveNetwork(): string[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let maxLoop = 999;
        
        while (nodesToScan.length > 0 && maxLoop-- > 0) {
            
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.ns.scan(nodeName);
            
            for (const connectedNodeName of connectedNodeNames)
                if (!discoveredNodes.includes(connectedNodeName))
                    nodesToScan.push(connectedNodeName);
            
            discoveredNodes.push(nodeName);
        }
        
        return discoveredNodes;
    }
    
    tearDown() {
        this.running = false;
        this.headerHook.innerText = '';
        this.valueHook.innerText = '';
        this.ns.closeTail();
    }
}