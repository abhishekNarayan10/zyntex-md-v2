async function ping() {

    const start = Date.now();
    await axios.get("https://google.com");
    const end = Date.now();
    const ping = end - start;
    const res = [{
        'r' : ping
    }]
    
}

module.exports = {ping}