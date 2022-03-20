import {Dog} from '/scratch/dog.js';

export async function main(ns:object) {
    let dog = new Dog('bark');
    dog.alert();
    console.log(`test 2 - ${dog.walk(5)}`);
    //test2
}