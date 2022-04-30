var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Install {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
        this.hostname = ns.getHostname();
        this.packageName = this.identifyPackageName();
        this.fullPackage = this.identifyFileToDownload();
    }
    identifyPackageName() {
        const regexp = /^\/(.*)\/.*$/;
        return this.ns.getScriptName().match(regexp)[1];
    }
    identifyFileToDownload() {
        return this.ns.ls('home', this.packageName + '-').filter(f => !f.includes('-install'));
    }
    identifyMalwaresToDownload() {
        return this.ns.ls('home', 'malware-');
    }
    downloadPackage(hostname = this.hostname, packageName = this.packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullPackage = this.fullPackage;
            if (packageName === 'malwares') {
                // noinspection JSPotentiallyInvalidUsageOfClassThis
                fullPackage = this.identifyMalwaresToDownload();
            }
            const scpStatus = yield this.ns.scp(fullPackage, 'home', hostname);
            const capPackageName = packageName.toUpperCase();
            if (scpStatus === true) {
                const msg = `${capPackageName}-INSTALL - ${packageName} package successfully uploaded on ${hostname}`;
                this.log.success(msg);
            }
            else {
                this.log.warn(`${capPackageName}-INSTALL - Couldn't upload ${packageName} package on ${hostname}`);
            }
        });
    }
    precomputeStaticValues() {
        return undefined;
    }
    launchDaemon(hostname = this.hostname, numThreads = 1) {
        const daemonFile = `/${this.packageName}/${this.packageName}-daemon.js`;
        if (hostname === this.hostname) {
            this.closeTail();
            this.ns.spawn(daemonFile, numThreads, this.hostname);
        }
        else {
            this.ns.exec(daemonFile, hostname, numThreads, hostname);
        }
    }
    closeTail() {
        const doc = eval('document');
        let xpath = `//h6[starts-with(text(),'/${this.packageName}/')]/parent::*//button[text()='Close']`;
        doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
    }
}
//# sourceMappingURL=install.js.map