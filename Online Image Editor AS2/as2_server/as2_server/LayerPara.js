const Jimp = require("jimp");


module.exports = new Promise(async (resolve)=>{
    //Bottom layer going to top layer

    var layer = ImgData.layers[layerIndex];
    console.log(layer)

    //Start by resizing to its edited size
    var layerImage = await Jimp.read(layer.Url);
    layerImage.resize(layer.rect.width, layer.rect.height);

    //apply all the effects
    layer.effect.forEach(async effects => {
        await EffectMap[effects.name](layerImage, effects.s)
    });

    //layer into the base image
    baseImage.composite(layerImage, layer.rect.left, layer.rect.top)
    resolve();
})