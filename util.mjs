import fetch from 'node-fetch';


function randBetween(small, big){
    // result: float
    // small <= result <= big
    return Math.floor(Math.random() * (big - small)) + small
}


async function getTopLevelDomain() {
    const raw = await fetch('https://data.iana.org/TLD/tlds-alpha-by-domain.txt').then(resp => resp.text());
    return raw.trim().split(/\r?\n/).filter(line => !line.startsWith('#'));
}


async function getListOfTestDomain(url) {
    const domain = url.hostname;
    const prefix = domain.slice(0, domain.lastIndexOf('.'));
    const tlds = await getTopLevelDomain();
    return tlds.map(tld => {
        const u = new URL(url);
        u.hostname = prefix + '.' + tld;
        return u;
    });
}


export {
    randBetween,
    getTopLevelDomain,
    getListOfTestDomain,
};
