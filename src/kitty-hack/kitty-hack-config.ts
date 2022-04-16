export const KITTY_HACK_CONFIG: {
    INSTALL_PACKAGE: string[],
    RUN_PACKAGE: string[],
    HOSTNAME: string,
} = {
    INSTALL_PACKAGE: [
        root() + 'kitty-hack-daemon.js',
        root() + 'kitty-hack-config.js',
        root() + 'kitty-hack-adapters.js',
        '/resources/helpers.js',
    ],
    RUN_PACKAGE: [
        root() + 'kitty-hack-daemon.js',
    ],
    HOSTNAME: 'n00dles',
};

function root(): string {
    return '/kitty-hack/';
}