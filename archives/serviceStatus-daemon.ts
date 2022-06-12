import {INs} from '/resources/helpers';

export async function main(ns) {
    /*ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();*/
    
    await new ServiceStatus(ns).start();
}

class ServiceStatus {
    
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
    
    async start() {
        this.running = true;
        while (this.running) {
            try {
                const serviceStatusAsArray = [...await this.getAllServiceStatus()];
                this.headerHook.innerText = serviceStatusAsArray.map(n => n[0]).join( ' \n')
                this.valueHook.innerText = serviceStatusAsArray.map(n => n[1]).join( '\n')
            } catch (err) {
                this.ns.print('ERROR: Update Skipped: ' + String(err));
            }
            await this.ns.asleep(1000);
        }
        this.tearDown();
    }
    
    async getAllServiceStatus(): Promise<Map<string, string>> {
        let serviceStatusMap = new Map<string, string>();
        for (const serviceFile of this.getServiceList()) {
            const serviceName: string = this.getServiceNameFromServiceFile(serviceFile);
            const serviceStatus: boolean = this.checkIfScriptRunning(serviceFile);
            serviceStatusMap.set(serviceName, serviceStatus ? '✅' : '🔴');
        }
        return serviceStatusMap;
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