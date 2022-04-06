import fs from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
const nslookup = promisify(dns.resolve4);


import ChromeLauncher from 'chrome-launcher';
import CDP from 'chrome-remote-interface';


class Chrome {
    #tmpProfilePath;
    #chrome;

    constructor() {
        return (async () => {
            this.#tmpProfilePath = path.join(tmpdir(), crypto.randomUUID());
            fs.mkdirSync(this.#tmpProfilePath, { recursive: true });
            this.#chrome = await ChromeLauncher.launch({
                userDataDir: this.#tmpProfilePath,
                // flag details:
                //      --headless, --disable-gpu : for headless chrome
                chromeFlags: [
                    '--headless', '--disable-gpu',
                ]
            })
            return this;
        })();
    }

    get port() {
        return this.#chrome.port;
    }

    async cleanup() {
        await this.#chrome.kill();
        fs.rmdirSync(this.#tmpProfilePath, {recursive: true});
    }
}


async function screenshot(url, outputPath) {
    try {
        await nslookup(url.hostname);
    } catch (err) {
        // domain not found, no need to do anything
        console.log('%s not found', url);
        return;
    }

    // TODO: cache the chrome and start a new session (guest session) every time
    const chrome = await new Chrome();
    const client = await CDP({port: chrome.port});

    try {

        const {Page, Network} = client;
        await Page.enable();
        await Network.enable();

        // // debugging
        // client.on('event', (message) => {
        //     console.log(message);
        // })

        // set a timeout for page load
        const TIMEOUT = 10; // second
        const {success, data} = await new Promise((resolve, reject) => {
            // set timeout
            const timeoutHandle = setTimeout(reject.bind(null, `failed to navigate to ${url}`), TIMEOUT * 1000);

            let reqID = null;
            client.on('event', ({method, params}) => {
                if (method === 'Network.requestWillBeSent' && params.documentURL == url) {
                    reqID = params.requestId;
                }
                if (method === 'Network.loadingFailed' && params.requestId === reqID) {
                    clearTimeout(timeoutHandle);
                    reject(`failed to load ${url}`);
                }
            });

            // do things
            (async (url) => {
                await Page.navigate({url});
                await Page.loadEventFired();
                const {data} = await Page.captureScreenshot();

                clearTimeout(timeoutHandle);
                resolve({success: true, data: 'data:image/png;base64,' + data})
            })(url).catch(reject);
        });

        console.log('screenshot %s', url);

        if (success) {
            fs.appendFileSync(outputPath, `${url}\n${data}\n`);
        }

    } catch (err) {
        console.log(err);
    } finally {
        await client.close();
        await chrome.cleanup();
    }
}


export default screenshot;

