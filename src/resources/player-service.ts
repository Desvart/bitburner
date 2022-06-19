import {Log} from '/resources/helpers';
import {Service, ServiceName} from '/resources/service';
import {Player} from '/resources/player';

export async function main(ns) {
    const player = new Player(ns);
    const service = new Service(ns, new Log(ns), ServiceName.Player, player);
    await service.start();
}