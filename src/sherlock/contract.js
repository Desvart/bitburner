export class Contract
{
    _ns;
    name;
    location;
    type;
    data;
    //get remainingTentatives() { return this.#ns.codingcontract.getNumTriesRemaining(this.name, this.location); }
    solution;
    reward;

    constructor(ns, name, location) {
        this._ns        = ns;
        this.name       = name;
        this.location   = location;
        this.type       = ns.codingcontract.getContractType(name, location);
        this.data       = ns.codingcontract.getData(name, location);
        this.solution   = null;
        this.reward     = null;
    }
}