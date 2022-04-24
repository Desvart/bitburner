import {MALWARES_CONFIG} from '/malwares/malwares-config';

export const SHIVA_CONFIG: {
    INSTALL_PACKAGE: string[],
    SETUP_PACKAGE: string[],
    RUN_PACKAGE: string[],
    SERVER_ROOT_NAME: string,
    PAUSE_BETWEEN_BLOCKS: number,
    HACK_RATIO: number,
    BLACK_LIST: string[],
} = {
    INSTALL_PACKAGE: [
        root() + 'shiva-install.js',
        root() + 'shiva-config.js',
        ...MALWARES_CONFIG.INSTALL_PACKAGE,
    ],
    SETUP_PACKAGE: [
        root() + 'shiva-setup.js',
        root() + 'host-const.txt',
        root() + 'server-stat.js',
        '/resources/helpers.js',
    ],
    RUN_PACKAGE: [
        root() + 'shiva-daemon.js',
        ...MALWARES_CONFIG.RUN_PACKAGE,
        root() + 'server-stat.js',
    ],
    SERVER_ROOT_NAME: 'pServ-',
    PAUSE_BETWEEN_BLOCKS: 200, // ms
    HACK_RATIO: 75 / 100,
    BLACK_LIST: ['home', 'darkweb', 'CSEC', 'The-Cave', 'run4theh111z', 'I.I.I.I', 'avmnite-02h', '.', 'w0r1d_d43m0n'],
};

function root(): string {
    return '/shiva2/';
}