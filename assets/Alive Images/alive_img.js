let alive_imgs = ['img1.mp3' , 'img2.mp3' , 'img3.mp3' , 'img4.mp3']
let alive_img = Math.floor(Math.random()* alive_imgs.length)
const randomAliveImages = './assets/Alive Images/' + alive_imgs[alive_img]


module.exports = randomAliveImages