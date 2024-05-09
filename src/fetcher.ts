import {TODO_URL} from "./const";
import axios, {AxiosError} from "axios";
import {getEvenNumbersInChunks, sleep} from "./util";

export const fetchRequiredTodos = async (numberOfTodos: number, threads: number) => {
    const startTime = Date.now();
    const evenNumberChunks = getEvenNumbersInChunks(2, numberOfTodos, threads);
    const todoChunks: Array<Array<{id: number, title: string; completed: boolean}| undefined>> = [];
    for (const chunk of evenNumberChunks){
        const promises = chunk.map((num) => fetchTodoWithRetry(num))
        const results = await Promise.allSettled(promises);
        const todos = results.map((result) => result.status === 'fulfilled' ? result.value: undefined);
        todoChunks.push(todos);
    }
    const endTime = Date.now();
    console.log(`Time taken to fetch ${numberOfTodos} todos with eventthreads: ${threads} , Timetaken: ${(endTime - startTime)} milli seconds`);
    const todos = todoChunks.flat();
    for (const todo of todos){
        if (todo){
            console.log(`Todo ID: ${todo.id}, Title: ${todo.title}, Completed: ${todo.completed}`);
        }else{
            console.log('Failed to fetch todo');
        }
    }
    return todos;
}



export const fetchTodoWithRetry = async (todoIndex: number, retryLimit = 3): Promise<{id: number; title: string; completed: boolean}> => {
    const url = `${TODO_URL}/${todoIndex}`;
    let retries = 0;
    let delayInSeconds = 1;
    while (retries < retryLimit) {
        try {
            const response = await axiosGet(url);
            return response.data;
        }
            // @ts-ignore
        catch (error: AxiosError){
            // handle only 5XX error response
            if (error.response && error.response.status >= 500 && error.response.status < 600) {
                retries++;
                await sleep(delayInSeconds);
                delayInSeconds *= 2;
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed to fetch data after ${retryLimit} retries`);
}

export const axiosGet = async (url: string) => axios.get(url)