import {INs} from '/resources/helpers';
import {getService, ServiceName} from '/resources/service';
import {Deployer} from '/resources/deployer';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    await new ServiceStatus(ns).start();
}

class ServiceStatus {
    
    private headerHook: any;
    private valueHook: any;
    private running: boolean;
    private deployer: Deployer;
    
    constructor(private ns: INs) {
        
        this.ns.atExit(this.tearDown.bind(this));
        
        const doc = eval('document');
        this.headerHook = doc.getElementById('overview-extra-hook-0');
        this.valueHook = doc.getElementById('overview-extra-hook-1');
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
    
            this.deployer = await getService<Deployer>(this.ns, ServiceName.Deployer);
            const serviceStatus: boolean = this.deployer.checkIfScriptRunning(serviceFile);
            
            serviceStatusMap.set(serviceName, serviceStatus ? '✅' : '🔴');
        }
        return serviceStatusMap;
    }
    
    getServiceList(): string[] {
        return this.ns.ls('home', '-service.js');
    }
    
    getServiceNameFromServiceFile(serviceFile): string {
        const regExp = /\/resources\/(.*)-service.js/;
        const serviceName = regExp.exec(serviceFile)[1];
        return serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    }
    
    tearDown() {
        this.running = false;
        this.headerHook.innerText = '';
        this.valueHook.innerText = '';
        this.ns.closeTail();
    }
}