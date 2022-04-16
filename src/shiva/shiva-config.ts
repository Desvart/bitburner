export const SHIVA_CONFIG: {
    INSTALL_PACKAGE: string[],
    RUN_PACKAGE: string[],
    PAUSE_BETWEEN_BLOCKS: number,
    HACK_RATIO: number,
    SERVER_ROOT_NAME: string,
    DISPLAY_TAIL: boolean,
} = {
    INSTALL_PACKAGE: [
        '/shiva/hydra-daemon.js',
        '/shiva/shiva-daemon.js',
        '/shiva/leecher.js',
        '/malwares/hack.js',
        '/malwares/weaken.js',
        '/malwares/grow.js',
        '/resources/helper.js',
        '/shiva/shiva-config.js'],
    RUN_PACKAGE: [
        '/shiva/hydra-daemon.js',
        '/shiva/shiva-daemon.js',
        '/shiva/leecher.js',
        '/malwares/hack.js',
        '/malwares/weaken.js',
        '/malwares/grow.js',
    ],
    PAUSE_BETWEEN_BLOCKS: 200, // ms
    HACK_RATIO: 75 / 100,
    SERVER_ROOT_NAME: 'pServ-',
    DISPLAY_TAIL: false,
};