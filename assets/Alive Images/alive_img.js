let alive_imgs = ['img1.jpg' , 'img2.png' , 'img3.jpg' , 'img4.jpg']
let alive_img = Math.floor(Math.random()* alive_imgs.length)
const randomAliveImages = './assets/Alive Images/' + alive_imgs[alive_img]


module.exports = randomAliveImages
