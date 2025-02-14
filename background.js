
let portFromFrontend;

function handleError(e) {
    console.error(e)
    portFromFrontend.postMessage({
        log: `In background script, error: ${e}`,
    });
}

async function query(text, apiUrl, apiToken) {
    const response = await fetch(`${apiUrl}/api/media?search=${text}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    }).catch(handleError)
    const data = await response.json();
    console.log(data)
    portFromFrontend.postMessage({
        data: data?.data
    });
}

async function requestImage(src) {
    const blob = await fetch(src)
        .then(response => response.blob())
    portFromFrontend.postMessage({
        data: blob
    });
}

function connected(p) {
    portFromFrontend = p;
    portFromFrontend.onMessage.addListener((m) => {
        switch(m.action) {
            case 'query':
                query(m.text, m.gifableUrl, m.gifableApiToken);
                break;
            case 'image':
                requestImage(m.text);
                break;
        }
        
    });
}

browser.runtime.onConnect.addListener(connected);
console.log('gifable: background-init')
