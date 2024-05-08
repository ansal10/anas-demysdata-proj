#!/usr/bin/env node

import assert from "assert";
import {program} from "commander";
import {fetchRequiredTodos} from "./fetcher";


program
    .command('todo')
    .description('Fetches first N even number Todos')
    .argument('<number>', 'Todos to fetch')
    .option('-t --threads <number>', 'Number of APIs to fetch in parallel', '5')
    .action(async (n, options) => {
        try {
            assert(Number(n) > 0, 'Number should be greater than 0');
            assert(Number(n) < 100, 'Number should be lesser than 100');
            assert(Number(options.threads) > 0, 'Number of threads should be greater than 0');
            assert(Number(options.threads) <= 20, 'Number of threads should be lesser than or equal 20');
            await fetchRequiredTodos(Number(n), Number(options.threads));
        }catch (e: any){
            console.log(`Error: ${e.message}`);
        }
    })

program.parse();