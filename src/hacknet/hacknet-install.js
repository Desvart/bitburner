var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/resources/helpers';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const install = new Install(ns, new Log(ns));
        yield install.downloadPackage();
        install.precomputeStaticValues();
        install.launchDaemon();
    });
}
class Install {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
        this.hostname = ns.getHostname();
        this.packageName = this.identifyPackageName();
        this.fullPackage = this.identifyFileToDownload();
        this.precomputedValues = this.precomputeStaticValues();
    }
    identifyPackageName() {
        const regexp = /^\/(.*)\/.*$/;
        return this.ns.getScriptName().match(regexp)[1];
    }
    identifyFileToDownload() {
        return this.ns.ls('home', this.packageName + '-').filter(f => !f.includes('-install'));
    }
    downloadPackage() {
        return __awaiter(this, void 0, void 0, function* () {
            const scpStatus = yield this.ns.scp(this.fullPackage, 'home', this.hostname);
            const capPackageName = this.packageName.toUpperCase();
            if (scpStatus === true) {
                const msg = `${capPackageName}-INSTALL - ${this.packageName} package successfully uploaded on ${this.hostname}`;
                this.log.success(msg);
            }
            else {
                this.log.warn(`${capPackageName}-INSTALL - Couldn't upload ${this.packageName} package on ${this.hostname}`);
            }
        });
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
//# sourceMappingURL=hacknet-install.js.map