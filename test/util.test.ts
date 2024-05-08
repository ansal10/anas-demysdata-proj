import {getEvenNumbersInChunks, sleep} from "../src/util";

describe('Test Util Functions', () => {
    it('should test sleep with 1 second', async () => {
        const start = Date.now();
        await sleep(1);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(1000);
    });

    it('should test sleep with -1 second, not causing any sleep', async () => {
        const start = Date.now();
        await sleep(-1);
        const end = Date.now();
        expect(end - start).toBeLessThanOrEqual(100);
    });
});

describe('Test getEvenNumbersInChunks', () => {
  it('should return 3 chunks of 6 even numbers', () => {
    const result = getEvenNumbersInChunks(2, 6, 2);
    expect(result).toEqual([[2, 4], [6, 8], [10, 12]]);
  });

    it('should return 3 chunks of 5 even numbers', () => {
        const result = getEvenNumbersInChunks(2, 5, 2);
        expect(result).toEqual([[2, 4], [6, 8], [10]]);
    });

    it('should return 1 chunk of 5 even numbers', () => {
        const result = getEvenNumbersInChunks(2, 5, 5);
        expect(result).toEqual([[2, 4, 6, 8, 10]]);
    });

    it('should return single chunk with chunk size 0', () => {
        const result = getEvenNumbersInChunks(2, 5, 0);
        expect(result).toEqual([[2,4,6,8,10]]);
    });
})