import {INs, Log} from '/resources/helpers';

export class Install {
    protected readonly ns: INs;
    protected readonly log: Log;
    readonly hostname: string;
    protected readonly packageName: string;
    protected readonly fullPackage: string[];
    
    constructor(ns: INs, log: Log) {
        this.ns = ns;
        this.log = log;
        this.hostname = ns.getHostname();
        this.packageName = this.identifyPackageName();
        this.fullPackage = this.identifyFileToDownload();
    }
    
    private identifyPackageName(): string {
        const regexp: RegExp = /^\/(.*)\/.*$/;
        return this.ns.getScriptName().match(regexp)[1];
    }
    
    private identifyFileToDownload(): string[] {
        return this.ns.ls('home', this.packageName + '-').filter(f => !f.includes('-install'));
    }
    
    async downloadPackage(hostname: string = this.hostname): Promise<void> {
        const scpStatus = await this.ns.scp(this.fullPackage, 'home', hostname);
        
        const capPackageName = this.packageName.toUpperCase();
        if (scpStatus === true) {
            const msg = `${capPackageName}-INSTALL - ${this.packageName} package successfully uploaded on ${hostname}`;
            this.log.success(msg);
        } else {
            this.log.warn(
                `${capPackageName}-INSTALL - Couldn't upload ${this.packageName} package on ${hostname}`);
        }
    }
    
    precomputeStaticValues(): Promise<void> {
        return undefined;
    }
    
    launchDaemon(hostname: string = this.hostname, numThreads: number = 1): void {
        const daemonFile = `/${this.packageName}/${this.packageName}-daemon.js`;
        
        if (hostname === this.hostname) {
            this.closeTail();
            this.ns.spawn(daemonFile, numThreads, this.hostname);
        } else {
            this.ns.exec(daemonFile, hostname, numThreads, hostname);
        }
    }
    
    closeTail(): void {
        const doc = eval('document');
        let xpath = `//h6[starts-with(text(),'/${this.packageName}/')]/parent::*//button[text()='Close']`;
        doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
    }
}