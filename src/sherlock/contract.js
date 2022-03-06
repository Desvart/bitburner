export class Contract {
    name;
    location;
    type;
    data;
    solution;
    reward;
    
    constructor(ns, name, location) {
        this.name = name;
        this.location = location;
        this.type = ns.codingcontract.getContractType(name, location);
        this.data = ns.codingcontract.getData(name, location);
    }
}