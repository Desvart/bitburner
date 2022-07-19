import {Service, ServiceName} from '/services/service';
import {Player} from '/services/player';

export async function main(ns) {
    const player = new Player(ns);
    const service = new Service(ns, ServiceName.Player, player);
    await service.start();
}