function bitrateToMB(bitrate , durationinMS){
    const durationToSec = durationinMS / 1000
    return (bitrate * durationToSec) / 8 / 1024 / 1024
}

module.exports = {
    bitrateToMB
}