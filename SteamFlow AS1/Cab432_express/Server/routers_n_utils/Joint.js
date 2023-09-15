const express = require("express");
const router = express.Router();

const Redis = require("../Wrappers/RedisWrapper");
const Funcs = require("./cleanUp");
const { DateTime } = require("luxon");


router.get("/api/v1/games/:appid", async (req, res) => {
    //this needs to cache and return from cache


    //first check if its cached

    console.log(`${req.params.appid} targeted`);

    var cached = await Redis.hasEntry(req.params.appid);
    if (cached) {
        console.log(`${req.params.appid} cached`);
        var r = await Redis.getJsonEntry(req.params.appid);
        if(!("status" in r.Youtube))
            Redis.setExpire(req.params.appid, 3 * 60 * 60);//3 hour expire
        res.status(200).json(r);
        return;
    }

    console.log(`${req.params.appid} not cached`);

    

    //Validate its an app
    var S_result = await Funcs.isAppValid(req, res);
    if (S_result == null)
        return;

    console.log(`${req.params.appid} steam resolved valid`);



    //Its not cached, so...

    //The below responces were replaced with these objects so when loading the page it would respond by showing the error rather than failing to load
    var Yt_result = await Funcs.search({ q: S_result[req.params.appid].data.name, key: process.env.YOUTUBE_Key, maxResults: 10, part: "snippet" });

    if (Yt_result.status != 200) {
        Yt_result = { status: Yt_result.status, data: { error: "Unknown error has occured", api: "youtube" } };
        return;
    }

    if (Yt_result.status == 403) {
        Yt_result = { status: 403, data: { error: "Forbidden or Query capacity reached", api: "youtube" } };
        return;
    }

    if (Yt_result.status == 400) {
        Yt_result = { status: 400, data: { error: "Bad Request made. Invalid parameter met", api: "youtube" } };
        return;
    }

    if (Yt_result.status == 404) {
        Yt_result = { status: 404, data: { error: "Youtube unreachable", api: "youtube" } };
        return;
    }

    console.log(`${req.params.appid} Yt passed`);

    var EndRes = await Funcs.joinObjects(Yt_result.data, S_result, req.params.appid);

    console.log(`${req.params.appid} joined result passed`);

    EndRes.cached = false;
    res.status(200).json(EndRes);

    EndRes.cached = true;
    Redis.setJsonEntry(req.params.appid, EndRes);


    if (Yt_result.status == 200) {
        Redis.setExpire(req.params.appid, 3 * 60 * 60);//Cache for 3 hours default
    }
    else {
        //Cache for the remaining time for quota reset
        var dtn = DateTime.now().setZone("America/Los_Angeles"); //Time in PT, the YT servers quota reset daily, so this will cache till reset of quota
        var target = dtn.plus({ days: 1 }).minus({ hours: dtn.hour, minutes: dtn.minute, seconds: dtn.second, milliseconds: dtn.millisecond });
        dtn = (target - dtn) / 1000;//convert to seconds
        Redis.setExpire(req.params.appid, Math.ceil(dtn));
    }
});

router.get("/api/v1/featured/", async (req, res) => {
    var cached = await Redis.hasEntry("featured");
    if (cached) {
        res.status(200).json(await Redis.getJsonEntry("featured"));
        return;
    }



    var FeatureList = await Funcs.getFeatured();
    if (FeatureList == null)
        res.json({});

    res.json(FeatureList);
    Redis.setJsonEntry("featured", FeatureList);
    var dtn = DateTime.now();
    var target = dtn.plus({ days: 1 }).minus({ hours: dtn.hour, minutes: dtn.minute, seconds: dtn.second, milliseconds: dtn.millisecond });
    dtn = (target - dtn) / 1000;//convert to seconds
    Redis.setExpire("featured", Math.ceil(dtn));
});

router.get("/api/v1/wishlist/:id", async (req, res) => {
    var result = await Funcs.getWishlist(req, res);
    if (result == null)
        return;

    res.json(result);
});


exports.dynamoRef = require("../Wrappers/DynamoDB");
router.get("/api/v1/views", async (req, res) => {
    if ("update" in req.query && req.query.update == 'true') {
        
        try {
            await exports.dynamoRef.setEntry(await exports.dynamoRef.getEntry() + 1);
        }
        catch (err) {
            throw err;
        }
    }

    var count = null;
    await exports.dynamoRef.getEntry().then((success) => {
        count = success
    }).catch((fail) => {
        console.log(fail);
        res.status(500).json({ error: "Internal error has occured relating to DynamoDB", api: "DynamoDB" })
    });
    res.status(200).json(count);
})


exports.route = router