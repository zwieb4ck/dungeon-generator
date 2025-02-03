
export class PRNG {
    private m = 0x80000000;
    private a = 1103515245;
    private c = 12345;
    private state: number = 0;
    private secret: string = "";

    constructor(seed?: string, secret?: string) {
        this.secret = secret ? secret : "";
        this.updateSeed(seed);
    }

    public updateSeed(seed?: string) {
        if (seed) {
            this.state = this.generateConsistentNumberFromString(seed + this.secret);
        } else {
            this.state = this.generateConsistentNumberFromString(
                Math.floor(Math.random() * (this.m - 1)) + this.secret
            );
        }
    }

    public nextInt() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }

    public nextFloat() {
        return this.nextInt() / (this.m - 1);
    }

    public nextRange(start: number, end: number) {
        const rangeSize = end - start;
        const randomUnder1 = this.nextInt() / this.m;
        return start + Math.floor(randomUnder1 * rangeSize);
    }

    public choice<T>(array: T[]): T {
        return array[this.nextRange(0, array.length)];
    }

    public choiceMultipleUnique<T>(array: T[], amount: number): T[] {
        return array.sort(() => 0.5 - this.nextFloat()).slice(0, amount);
    }

    public generate() {
        return this.nextRange(1, 100000000000) / 100000000000;
    }

    public generateConsistentNumberFromString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        const seed = Math.abs(hash);
        return seed;
    }

    public percentageChance<T>(values: T[], chances: number[]) {
        for (var i = 0, pool: number[] = []; i < chances.length; i++) {
            for (var i2 = 0; i2 < chances[i]; i2++) {
                pool.push(i);
            }
        }
        return values[this.arrayShuffle(pool)['0']];
    };

    private arrayShuffle<T>(array: T[]) {
        for (let i = 0; i < array.length; i++) {
            let swap = Math.floor(this.nextFloat() * (i + 1));
            let temp = array[swap];
            array[swap] = array[i];
            array[i] = temp;
        }
        return array;
    };
}