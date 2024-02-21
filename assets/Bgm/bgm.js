let bgms = ['bgm1.mp3' , 'bgm2.mp3' , 'bgm3.mp3' , 'bgm4.mp3' , 'bgm5.mp3']
let bgm = Math.floor(Math.random()* bgms.length)
const randomBgm = './assets/Bgm/' + bgms[bgm]


module.exports = randomBgm