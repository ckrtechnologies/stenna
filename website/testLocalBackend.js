import fetch from 'node-fetch';

async function test() {
    try {
        const response = await fetch("http://localhost:5010/api/v1/wallpapers/slug/PT10611");
        const data = await response.json();
        console.log("Local Backend Response ID:", data.id);
        console.log("Local Backend Response Object:", data);
    } catch (e) {
        console.error("Local backend call failed:", e);
    }
}

test();
