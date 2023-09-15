const SteamPaths = require("./steam").paths;
const YTPaths = require("./youtube").paths;


exports.isAppValid = async function (req, res) {
    //#region Steam validate key
    if (req.params.appid <= 0) {
        //steam provides a 400 if the id is out of bounds
        res.status(400).json({ error: "AppID provided is out of the bounds accepted.", api: "steam" });
        return null;
    }

    var app = await SteamPaths.appdetails({ appids: req.params.appid, l: "english" });
    if (app.status == 200) {
        //steam provides a 200 with a false find otherwise
        var found = app.data[req.params.appid.toString()]["success"];
        if (!found) {
            res.sendStatus(404);
            return null;
        }
        return app.data;
    }
    else
        res.sendStatus(app.status);//this will be anything but 200 if we hit quota or steams down
    return null;
    //#endregion
}


//DEPRECATED
//Do not use this function
//Getting all featured in the new page layout only requires the featured object, and not the additional data
//So DO NOT call this, or risk wasting a chunk of your YT quota
exports.JointFeatured = async function (req, res) {
    //Get featured, reduce it to appids only, request details per app,
    var featuredapps = await SteamPaths.featured();
    var resulting = []
    for (let index = 0; index < featuredapps.featured_win.length; index++) {
        //resulting[index] = await SteamPaths.appdetails({ appids: featuredapps.featured_win[index].id });
        var steam = await SteamPaths.appdetails({ appids: featuredapps.featured_win[index].id });
        var Yt_result = await Funcs.search({ q: S_result[req.params.appid].data.name, key: process.env.YOUTUBE_Key });
        resulting[index] = await joinObjects(steam, Yt_result);
    }
    return resulting;
}


exports.getFeatured = async function (req, res) {
    var FeaturedGames = await SteamPaths.featured();
    if (FeaturedGames.status != 200) {
        res.status(503).json({ status: 503, data: { error: "Service is unavailable", api: "Steam" } });
        return null;
    }
    return FeaturedGames.data;
}

exports.getWishlist = async function (req, res) {
    var FeaturedGames = await SteamPaths.wishlist({ steamID: req.params.id });

    if (FeaturedGames.status == 200)//user exists at this ID AND is publicly accessible
        return FeaturedGames.data;

    if (FeaturedGames.status == 500) {
        //steam will only send 500 on this endpoint. No joke, it has no other error for this.
        res.status(500).json({ status: 500, data: { error: "Steam user does not exist", api: "Steam" } });
    }

    if (FeaturedGames.status == 404) {
        //just in case steam goes down, this will cover it
        res.status(404).json({ status: 404, data: { error: "Steam is currently unreachable at this endpoint", api: "Steam" } });
    }

    return null;
}


exports.search = async function (query) {
    return await YTPaths.search(query);
}

exports.joinObjects = async function (youtubeResult, steamResult, appid) {
    var steamGameInfo = steamResult[appid]["data"];
    steamGameInfo["Youtube"] = youtubeResult;
    return steamGameInfo;
}