import { Log } from '../helpers/helper.js'

export class SkeletonKey {
	_KEYS = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
  get availableKeysCount() { return this.#getAvailableKeys().length; }
  _ns;

	constructor(ns) {
		this._ns = ns;
	}


	nuke(target) {
		this.#openPorts(target);
		this.#getRootAccess(target);
	}


	#openPorts(target) {
		let availableKeys = this.#getAvailableKeys();
		for (let key of availableKeys)
			switch (key) {
				case this._KEYS[0]: this._ns.brutessh(target);  break;
				case this._KEYS[1]: this._ns.ftpcrack(target);  break;
				case this._KEYS[2]: this._ns.relaysmtp(target); break;
				case this._KEYS[3]: this._ns.httpworm(target);  break;
				case this._KEYS[4]: this._ns.sqlinject(target); break;
				default: Log.error(this._ns, `SKELETON_KEY - Key ${key} doesn't exists.`);
			}
	}


	#getAvailableKeys() {
		return this._KEYS.filter(key => this._ns.fileExists(key, 'home'));
	}


	#getRootAccess(target) {
		this._ns.nuke(target);
        Log.success(this._ns, `Node ${target} has been nuked successfuly.`)
	}	
}