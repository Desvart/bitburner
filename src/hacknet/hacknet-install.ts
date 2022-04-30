import {INs, Log} from '/resources/helpers';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const install = new Install(ns, new Log(ns));
    await install.downloadPackage();
    install.precomputeStaticValues();
    install.launchDaemon();
}

class Install {
    private readonly ns: INs;
    private readonly log: Log;
    private readonly hostname: string;
    private readonly packageName: string;
    private readonly fullPackage: string[];
    private readonly precomputedValues: Array<string|number|boolean>|undefined;
    
    constructor(ns: INs, log: Log) {
        this.ns = ns;
        this.log = log;
        this.hostname = ns.getHostname();
        this.packageName = this.identifyPackageName();
        this.fullPackage = this.identifyFileToDownload();
        this.precomputedValues = this.precomputeStaticValues();
    }
    
    private identifyPackageName(): string {
        const regexp: RegExp = /^\/(.*)\/.*$/;
        return this.ns.getScriptName().match(regexp)[1];
    }
    
    private identifyFileToDownload() {
        return this.ns.ls('home', this.packageName + '-').filter(f => !f.includes('-install'));
    }
    
    async downloadPackage() {
        const scpStatus = await this.ns.scp(this.fullPackage, 'home', this.hostname);
        
        const capPackageName = this.packageName.toUpperCase();
        if (scpStatus === true) {
            const msg = `${capPackageName}-INSTALL - ${this.packageName} package successfully uploaded on ${this.hostname}`;
            this.log.success(msg);
        } else {
            this.log.warn(`${capPackageName}-INSTALL - Couldn't upload ${this.packageName} package on ${this.hostname}`);
        }
    }
    
    precomputeStaticValues() {
        return undefined;
    }
    
    launchDaemon() {
        const daemonFile = `/${this.packageName}/${this.packageName}-daemon.js`;
        this.closeTail();
        this.ns.spawn(daemonFile, 1);
    }
    
    closeTail() {
        const doc = eval('document');
        const installFile = `/${this.packageName}/${this.packageName}-install.js`;
        let xpath = `//h6[text()='${installFile} ']/parent::*//button[text()='Close']`;
        doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
    }
}