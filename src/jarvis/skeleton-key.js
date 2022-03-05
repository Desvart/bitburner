import {Log} from '/helpers/helper.js';

export class SkeletonKey {
    #KEYS = [
        'BruteSSH.exe',
        'FTPCrack.exe',
        'relaySMTP.exe',
        'HTTPWorm.exe',
        'SQLInject.exe'];
    #ns;
    
    get availableKeysCount() { return this.#getAvailableKeys().length; }
    
    constructor(ns) {
        this.#ns = ns;
    }
    
    nuke(target) {
        this.#openPorts(target);
        this.#getRootAccess(target);
    }
    
    #openPorts(target) {
        const availableKeys = this.#getAvailableKeys();
        for (let key of availableKeys)
            switch (key) {
                case this.#KEYS[0]:
                    this.#ns.brutessh(target);
                    break;
                case this.#KEYS[1]:
                    this.#ns.ftpcrack(target);
                    break;
                case this.#KEYS[2]:
                    this.#ns.relaysmtp(target);
                    break;
                case this.#KEYS[3]:
                    this.#ns.httpworm(target);
                    break;
                case this.#KEYS[4]:
                    this.#ns.sqlinject(target);
                    break;
                default:
                    Log.error(this.#ns, `SKELETON_KEY - Key ${key} doesn't exists.`);
            }
    }
    
    #getAvailableKeys() {
        return this.#KEYS.filter(key => this.#ns.fileExists(key, 'home'));
    }
    
    #getRootAccess(target) {
        this.#ns.nuke(target);
        Log.success(this.#ns, `Node ${target} has been nuked successfuly.`);
    }
}