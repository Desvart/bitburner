import {DogInterface} from '/scratch/dog-interface.js';

export class Dog implements DogInterface {
    legsCount: number;
    hasTail: boolean;
    sound: string;
    
    constructor(sound: string) {
        this.sound = sound;
    }
    
    alert() {
        switch (this.sound) {
            case 'bark':{
                console.log('bark');
                break;
            }
            case 'meow':{
                console.log('meow');
                break;
            }
        }
    }
    
    walk(dist: number) {
        return dist * 2;
    }
}