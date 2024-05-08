import assert from "assert";

export const sleep = (seconds: number) => {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export const getEvenNumbersInChunks = (start: number, totalNumbers: number, chunkSize: number) => {
    const evenNumberChunks: Array<number[]> = [];
    for (let count=0; count < totalNumbers; count++ ){
        if (evenNumberChunks.length === 0 || evenNumberChunks[evenNumberChunks.length - 1].length === chunkSize){
            evenNumberChunks.push([]);
        }
        evenNumberChunks[evenNumberChunks.length - 1].push(start + (2 * count));
    }
    return evenNumberChunks;
}