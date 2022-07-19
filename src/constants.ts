export const CONSTANTS: {
    hackRatio: number;
    hackBalanceFactor: number;
    bitNodeMult: {
        ScriptHackMoney: number;
        ServerWeakenRate: number;
    }
    ServerBaseGrowthRate: number;
    ServerMaxGrowthRate: number;
    HackServerFortifyAmount: number;
    hackRam: number;
    growRam: number;
    weakRam: number;
}
= {
    hackRatio: 0.1,
    hackBalanceFactor: 240, // from Bitburner source code calculatePercentMoneyHacked
    bitNodeMult: {
        ScriptHackMoney: 1, // not always correct, but correct for BN1.x TODO FIX afterward
        ServerWeakenRate: 1, // not always correct, but correct for BN1.x TODO FIX afterward
    },
    ServerBaseGrowthRate: 1.03, // from Bitburner source code Constants
    ServerMaxGrowthRate: 1.035, // from Bitburner source code Constants
    HackServerFortifyAmount: 0.002, // from Bitburner source code Constants
    hackRam: 1.7;
    growRam: 1.75;
    weakRam: 1.75;
}