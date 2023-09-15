const Express = require("express");
const bodyParser = require("body-parser");
const app = Express();

const path = require("path");
const Jimp = require("jimp");
const Checksum = require("checksum");
const cors = require("cors")
const fs = require("fs");



//Utility shit
const settings = require("./LaunchSettings");
const ColorConsole = require("./Wrapper/ColorConsole");
const fileUpload = require("express-fileupload");
const { DateTime } = require("luxon")
//ColorConsole.writeLine(ColorConsole.Colors.Underscore, path.join(__dirname, settings.buildPath));


//Persistence
const RedisWrapper = require("./Wrapper/RedisWrapper");
const Redis = new RedisWrapper(settings.redisSettings, //onConnect, onDisconnect, onError, onReconnect
async ()=>{
    ColorConsole.write(ColorConsole.Colors.FgRed,"Redis ")
    ColorConsole.writeLine(ColorConsole.Colors.FgWhite,"| Connected")
}, undefined, async (error)=>{
    ColorConsole.write(ColorConsole.Colors.FgRed,"Redis ")
    ColorConsole.writeLine(ColorConsole.Colors.FgWhite,"| Error has occured")
    ColorConsole.writeLine(ColorConsole.Colors.FgRed, error)
    Redis.Disconnect();
})

const S3Wrapper = require("./Wrapper/S3Wrapper")
const S3 = new S3Wrapper(settings.S3Settings, ()=>{
    ColorConsole.write(ColorConsole.Colors.FgRed,"S3 ")
    ColorConsole.writeLine(ColorConsole.Colors.FgWhite,"| Verified Bucket")
}, (error_msg)=>{
    ColorConsole.write(ColorConsole.Colors.FgRed,"S3 ")
    ColorConsole.writeLine(ColorConsole.Colors.FgWhite,"| Error occured"),
    ColorConsole.writeLine(ColorConsole.Colors.FgRed, error_msg)
});





//When file uploaded
// 1. Store to S3 Bucket 1 (temporary storage), return related images url to frontend
// 2. Store checksum of uploaded image into elasticache as key, store url as value

//When compiling
// 1. Get images from S3 bucket 1
// 2. Compile based on layering and effects
// 3. upload to S3 bucket 2 (Library)
// 4. make some resized final versions
// 5. zip them together
// 6. serve url to user to download.

//step 6 should happen through server and not s3, use dynamic urls


function getEstimateS3Expire(){
    //S3 runs on utc
    //rounded up to midnight (Upload time + 1 day)
    var target = DateTime.now().setZone('utc');
    target = target.plus({ days: 2 }).set({hour: 0, minute: 0, second: 0, millisecond: 0});
    return target.toUnixInteger()
    //this adds 2 days and rounds down to the same time
}



app.post("/api/v1/upload",fileUpload({ createParentPath: true }), async (req, res)=>{
    var files = req.files;
    var Image_Data = {
        "Checksum": Checksum(Object.values(files)[0].data),
        "Url": undefined
    }

    //Server is running with Cache
    if(!settings.cacheless){

        //Check cache
        if(await Redis.hasKey(Image_Data.Checksum)){
            Image_Data.Url = await Redis.getValue(Image_Data.Checksum);
            res.json(Image_Data);
            return;
        }

        //check s3
        if(await S3.getURL(`${Image_Data.Checksum}.png`) !== undefined){
            Image_Data.Url = await S3.getURL(`${Image_Data.Checksum}.png`);

            await Redis.setValue(Image_Data.Checksum, Image_Data.Url);
            await Redis.setExpirationAt(Image_Data.Checksum, getEstimateS3Expire())

            res.json(Image_Data);
            return;
        }


        //Not cached
        //Store in S3
        var url = await S3.uploadImage(Image_Data.Checksum, Object.values(files)[0],"UserDefined=1");
        Image_Data.Url = url.Location;

        //Cache image url on S3
        await Redis.setValue(Image_Data.Checksum, url.Location);
        await Redis.setExpirationAt(Image_Data.Checksum, getEstimateS3Expire())

        res.json(Image_Data);
        return;
    }
    

    //Server is running Cacheless
    if(await S3.hasObject(`${Image_Data.Checksum}.png`)){
        //S3 has a matching checksum
        var url = await S3.getURL(`${Image_Data.Checksum}.png`);
        Image_Data.Url = url;

        res.json(Image_Data);
	return;
    }

    Image_Data.Url = await S3.uploadImage(Image_Data.Checksum, Object.values(files)[0], "UserDefined=1");
    res.json(Image_Data);
})


const EffectMap = {
    "blur" : async (img, s) =>{
        await img.blur(s.value)
    },
    "dither" : async (img, s) =>{
        await img.dither565()
    },
    "invert" : async (img, s) =>{
        await img.invert()
    },
    "brighten" : async (img, s) =>{
        await img.color([{apply: 'brighten', params: [s.value]}]);
    },
    "greyscale" : async (img, s) =>{
        await img.color([{apply: 'greyscale', params: [s.value]}]);
    },
}

const jsonParse = bodyParser.json();
const { Worker } = require("worker_threads");
app.put("/api/v1/compile",jsonParse, async (req, res) => {
    var ImgData = req.body;

    var baseImage = new Jimp(ImgData.width, ImgData.height);

    for(var layerIndex = ImgData.layers.length - 1; layerIndex >= 0; layerIndex--)
    {
        //Bottom layer going to top layer

        var layer = ImgData.layers[layerIndex];
        
        //Start by resizing to its edited size
        var layerImage = await Jimp.read(layer.Url);
        layerImage.resize(layer.rect.width, layer.rect.height);

        //apply all the effects
        layer.effect.forEach(async effects => {
            await EffectMap[effects.name](layerImage, effects.s)
        });

        //layer into the base image
        baseImage.composite(layerImage, layer.rect.left, layer.rect.top)
    }

    // //{
    // //width,
    // //height,
    // //layers: [
    //     //{
    //         //hash:checksum
    //         //Url:""
    //         //rect:{l,t,w,h}
    //         //effects:[
    //              {
                        //name
                        //s
    //              }             
    //         //]
    //     //}
    // //]
    // //}


    //Save to s3 as UserCompiled


    var finalChecksum = Checksum(baseImage.bitmap.data);
    //await baseImage.writeAsync(`./tempCompiled/${finalChecksum}.png`)

    //var stream = fs.createReadStream(`./tempCompiled/${finalChecksum}.png`);
    var url = await S3.uploadImage(finalChecksum, await baseImage.getBufferAsync(Jimp.PNG_FILTER_AUTO), "UserCompiled=1");
    res.send(url.Location);
    //stream.close();
    //await fs.unlinkSync(`./tempCompiled/${finalChecksum}.png`);

})




app.use(cors())

app.use(Express.static(path.join(__dirname, settings.buildPath)));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, settings.buildPath, '/index.html'));
})



function WaitFor(Predicate, timeout){
    return new Promise(async (resolve, reject)=>{
        if(timeout !== undefined){
            var dt = Date.now();
            while(Date.now() - dt < timeout){
                if(Predicate())
                    resolve();
                await Sleep(10);
            }
            reject(new Error("WaitFor timed out"));
        }
        else{
            while(true){
                if(Predicate())
                    resolve();
                await Sleep(10);
            }
        }
    });
}

function Sleep(time){
    return new Promise(resolve => setTimeout(resolve, time))
}




async function LaunchServer() {
    try {

        ColorConsole.writeLine(ColorConsole.Colors.FgWhite, "-".repeat(40));

        //Validate elasticache
        if(!settings.cacheless){
            Redis.tryConnect();
        }


        //Validate s3
        await S3.verifyBucket();
        await WaitFor(() => S3.status.isVerified);


        ColorConsole.writeLine(ColorConsole.Colors.FgWhite, "-".repeat(40));

        //add any other pre-launch tests


        app.listen(settings.exposedPort, () => {
            ColorConsole.write(ColorConsole.Colors.FgWhite, "Listening on port: ");
            ColorConsole.writeLine(ColorConsole.Colors.FgGreen, settings.exposedPort);
            ColorConsole.writeLine(ColorConsole.Colors.FgWhite, "-".repeat(40));
        });
    }
    catch (err) {
        throw err;
    }
}

LaunchServer();
