/**
 * NOTE:
 * Please read the README.md file provided in this template.
 */

// If you want to create OBJKT's with different seeds, you can access the creator and viewer wallet ids. This values will only be injected once the piece has been minted
// they will not work locally.
// if the user is not sync, the viewer comes in as false
const creator = new URLSearchParams(window.location.search).get('creator')
const viewer = new URLSearchParams(window.location.search).get('viewer')
const objkt = new URLSearchParams(window.location.search).get('objkt')

console.log('OBJKT created by', creator)
console.log('OBJKT viewed by', viewer)
console.log('OBJKT', objkt)

const CONTRACT_ADDRESS = 'KT1D1xoPkaoS9yaFD6L6cuwUGqdxPuFmA7pq';
let tzktApiUrl = 'https://api.tzkt.io';
let ipfsGatewayUrl = 'https://cache.teia.rocks/ipfs/';

async function fetchCIDFromContract() {
    try {
        const response = await fetch(`${tzktApiUrl}/v1/helpers/view/${CONTRACT_ADDRESS}/get_latest_version`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": "get_latest_version",
                "implementation": 0,
                "data": {},
                "kind": "on-chain"
            })
        });

        if (!response.ok) throw new Error('Failed to fetch contract view');
        let cid = await response.text();
        if (!cid) throw new Error('CID not found in contract view');
        cid = cid.trim().replace(/^"|"$/g, ''); // Remove whitespace and surrounding quotes
        if (!cid) throw new Error('CID is empty after processing');
        return cid;
    } catch (error) {
        console.error('Error fetching CID:', error);
        showErrorOverlay();
        throw error;
    }
}

async function redirectToIPFS() {
    try {
        const cid = await fetchCIDFromContract();

        let ipfsUrl = `${ipfsGatewayUrl}${cid}`;
        
        if (creator || viewer || objkt) {
            const queryParams = new URLSearchParams();
            if (creator) queryParams.append('creator', creator);
            if (viewer) queryParams.append('viewer', viewer);
            if (objkt) queryParams.append('objkt', objkt);
            ipfsUrl += `?${queryParams.toString()}`;
        }

        window.location.href = ipfsUrl;

    } catch (error) {
        console.error('Redirect failed:', error);
        showErrorOverlay();
    }
}

function showErrorOverlay() {
    document.getElementById('errorOverlay').style.display = 'block';
}

function retryRedirect() {
    tzktApiUrl = document.getElementById('tzktApi').value;
    ipfsGatewayUrl = document.getElementById('ipfsGateway').value;
    document.getElementById('errorOverlay').style.display = 'none';
    redirectToIPFS();
}

redirectToIPFS();