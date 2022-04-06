import screenshot from "./screenshot.mjs";
import { getListOfTestDomain } from "./util.mjs";

async function main() {
    const targetURL = new URL('https://zapper.fi');
    // const targetURL = new URL('https://opensea.io');
    // const targetURL = new URL('https://uniswap.org');
    // const targetURL = new URL('https://gate.io');
    // const targetURL = new URL('https://dydx.exchange');
    const testURLList = await getListOfTestDomain(targetURL);

    const batchSize = 300;
    for (let i = 0; i < testURLList.length; i += batchSize) {
        const arr = [];
        for (let j = i; j < Math.min(i + batchSize, testURLList.length); ++j) {
            arr.push(screenshot(testURLList[j], `${targetURL.hostname}.txt`));
        }
        await Promise.all(arr);
    }
}


main();
