export class Player {
    constructor(ns) {
        this.ns = ns;
    }
    get data() {
        return this.ns.getPlayer();
    }
    get money() {
        return this.data.money;
    }
    get hacking() {
        return {
            level: this.data.hacking,
            multipliers: {
                chance: this.data.hacking_chance_mult,
                exp: this.data.hacking_exp_mult,
                grow: this.data.hacking_grow_mult,
                money: this.data.hacking_money_mult,
                level: this.data.hacking_mult,
                speed: this.data.hacking_speed_mult,
            },
        };
    }
    get hacknet() {
        return {
            multipliers: {
                coreCost: this.data.hacknet_node_core_cost_mult,
                levelCost: this.data.hacknet_node_level_cost_mult,
                production: this.data.hacknet_node_money_mult,
                purchaseCost: this.data.hacknet_node_purchase_cost_mult,
                ramCost: this.data.hacknet_node_ram_cost_mult,
            },
        };
    }
    get market() {
        return {
            api: {
                tix: this.data.hasTixApiAccess,
                fourSigma: this.data.has4SDataTixApi,
            },
            wse: {
                wse: this.data.hasWseAccount,
                fourSigma: this.data.has4SData,
            },
        };
    }
    get portsKeyCount() {
        return this.ns.ls('home').filter(file => [
            'BruteSSH.exe',
            'FTPCrack.exe',
            'relaySMTP.exe',
            'HTTPWorm.exe',
            'SQLInject.exe',
        ].includes(file)).length;
    }
    get software() {
        return {
            tor: this.data.tor,
            ssh: this.ns.ls('home').some(file => file === 'BruteSSH.exe'),
            ftp: this.ns.ls('home').some(file => file === 'FTPCrack.exe'),
            smtp: this.ns.ls('home').some(file => file === 'relaySMTP.exe'),
            http: this.ns.ls('home').some(file => file === 'HTTPWorm.exe'),
            sql: this.ns.ls('home').some(file => file === 'SQLInject.exe'),
            formulas: this.ns.ls('home').some(file => file === 'Formulas.exe'),
        };
    }
}
//# sourceMappingURL=player.js.map