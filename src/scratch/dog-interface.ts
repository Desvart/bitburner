export interface DogInterface {
    legsCount: number;
    hasTail: boolean;
    sound: string;
    
    alert(): void;
    walk(dist: number): number;
}