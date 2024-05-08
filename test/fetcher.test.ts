import * as fetcher from '../src/fetcher';
import {axiosGet} from "../src/fetcher";


jest.setTimeout(30000)

describe('Test fetchTodoWithRetry', () => {

    it('should return todo with id 2', async () => {
        const axiosGetSpy = jest.spyOn(fetcher, 'axiosGet')
            .mockResolvedValue({data: {id: 2, title: 'mocked title', completed: false}} as any);
        const result = await fetcher.fetchTodoWithRetry(2);
        expect(result).toEqual({id: 2, title: 'mocked title', completed: false});
        expect(axiosGetSpy).toHaveBeenCalledTimes(1);
        axiosGetSpy.mockRestore();
    });

    it('should return todo with id 2 after 2 retries in case of 5XX error', async () => {
        const axiosGetSpy = jest.spyOn(fetcher, 'axiosGet')
            .mockRejectedValueOnce({response: {status: 500}} as any)
            .mockRejectedValueOnce({response: {status: 599}} as any)
            .mockResolvedValue({data: {id: 2, title: 'mocked title', completed: false}} as any);
        const result = await fetcher.fetchTodoWithRetry(2);
        expect(result).toEqual({id: 2, title: 'mocked title', completed: false});
        expect(axiosGetSpy).toHaveBeenCalledTimes(3);
        axiosGetSpy.mockRestore();
    })

    it('should throw error after 3 retries', async () => {
        jest.setTimeout(10000);
        const start = Date.now();
        const axiosGetSpy = jest.spyOn(fetcher, 'axiosGet')
            .mockRejectedValue({response: {status: 500}} as any);
        await expect(fetcher.fetchTodoWithRetry(2)).rejects.toThrow('Failed to fetch data after 3 retries');
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(7 * 1000);
        expect(axiosGetSpy).toHaveBeenCalledTimes(3);
        axiosGetSpy.mockRestore();
    })

    it('should not retry in case of 4XX error', async () => {
        const axiosGetSpy = jest.spyOn(fetcher, 'axiosGet')
            .mockRejectedValue({response: {status: 400}} as any);
        let axiosError;
        try {
            await fetcher.fetchTodoWithRetry(2);
        }catch (error: any){
            axiosError = error;
        }
        expect(axiosError.response.status).toBe(400);
        expect(axiosGetSpy).toHaveBeenCalledTimes(1);
        axiosGetSpy.mockRestore();
    });
})

describe('Test fetchRequiredTodos', () => {
    it('should fetch 10 todos with 5 threads', async () => {
        const axiosGetSpy = jest.spyOn(fetcher, 'fetchTodoWithRetry')
            .mockResolvedValue({id: Math.ceil(Math.random()*100), title: `mocked title ${Math.random()}`, completed: Math.random() > 0.5});
        const results = await fetcher.fetchRequiredTodos(10, 5);
        expect(axiosGetSpy).toHaveBeenCalledTimes(10);
        expect(results.length).toBe(10);
        axiosGetSpy.mockRestore();
    })

    it('should fetch 5 todos with 2 failures', async () => {
        const axiosGetSpy = jest.spyOn(fetcher, 'fetchTodoWithRetry')
            .mockResolvedValueOnce({id: 1, title: 'mocked title 1', completed: false})
            .mockResolvedValueOnce({id: 2, title: 'mocked title 2', completed: true})
            .mockRejectedValueOnce(new Error('Failed to fetch data after 3 retries'))
            .mockResolvedValueOnce({id: 4, title: 'mocked title 4', completed: false})
            .mockRejectedValueOnce(new Error('Failed to fetch data after 3 retries'))
        const results = await fetcher.fetchRequiredTodos(5, 3);
        expect(axiosGetSpy).toHaveBeenCalledTimes(5);
        expect(results.length).toBe(5);
        expect(results.filter(result => result).length).toBe(3);
        expect(results.filter(result => result===undefined).length).toBe(2);
        axiosGetSpy.mockRestore();
    });
})