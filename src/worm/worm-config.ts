import {MALWARES_CONFIG} from '/malwares/malwares-config';

export const WORM_CONFIG: {
    INSTALL_PACKAGE: string[],
    RUN_PACKAGE: string[],
} = {
    INSTALL_PACKAGE: [
        root() + 'worm-install.js',
        root() + 'worm-daemon.js',
        root() + 'worm-config.js',
        root() + 'host-const.txt',
        '/resources/helpers.js',
        ...MALWARES_CONFIG.INSTALL_PACKAGE,
    ],
    RUN_PACKAGE: [
        root() + 'worm-daemon.js',
        ...MALWARES_CONFIG.RUN_PACKAGE,
    ],
};

function root(): string {
    return '/worm/';
}