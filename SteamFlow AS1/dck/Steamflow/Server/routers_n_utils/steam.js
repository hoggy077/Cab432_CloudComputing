const express = require("express");
const router = express.Router();
const Token = require("./TokenMiddleware");



const axios = require("axios").default;
const Steam_BaseUnlistedAPI = "https://store.steampowered.com/";
//const Steam_BaseListedAPI = "https://api.steampowered.com/";


exports.paths = {
    //Unlisted Backend
    wishlist: async (parameters) => {
        //Not Cached
        var r = {};
        if (!("steamID" in parameters)) {
            r.status = 400;
            return r;
        }

        //this will only get 1 page of wishlist. The quantity per page is unknown or else I would poll through each page for the complete list
        await axios.get(`${Steam_BaseUnlistedAPI}wishlist/profiles/${parameters.steamID}/wishlistdata`).then((response) => {
            r = response;
            r.status = response.status;
        }).catch((error) => {
            r = error;
            r.status = error.response.status;
            //500 means the user couldn't be accessed, either they dont exist, or they're account isn't public
        });
        return r;
    },
    featured: async (parameters) => {
        //Cached - Expire at midnight
        var r = null;
        await axios.get(`${Steam_BaseUnlistedAPI}api/featured/`).then((response) => {
            r = response;
            r.status = response.status;
        }).catch((error) => {
            r = error;
            r.status = error.response.status;
        })
        return r;
    },
    appdetails: async (parameters) => {
        //this isn't cached, the joint object from all api's are cached
        var r = {};
        if (!("appids" in parameters)) {
            r.status = 400;
            return r;
        }

        await axios.get(`${Steam_BaseUnlistedAPI}api/appdetails`, { params: parameters }).then((response) => {
            r = response;
            r.status = response.status;
        }).catch((error) => {
            r = error;
            r.status = error.response.status;
        })
        return r;
    },
}



router.get("/api/v1/steam/:endpoint", Token.VerifyAuth, async (req, res) => {
    if (req.params.endpoint in exports.paths) {
        var result = await exports.paths[req.params.endpoint](req.query);
        if (result.status == 200) {
            res.status(200).json(result.data);
            return;
        }
        else {
            res.sendStatus(result.status);
        }
    }
    else
        res.sendStatus(404);
});

router.get("/api/v1/steam/wishlist/:steamid", Token.VerifyAuth, async (req, res) => {
    try {
        var r = {};
        if (typeof req.params.steamid == undefined || req.params.steamid < 0) {
            r = { status: 400, data: { error: "SteamID has been excluded from URL", api: "Steam" } }
            res.status(400).json(r);
            return;
        }

        r = await exports.paths.wishlist({ steamID: req.params.steamid });

        if (r.status != 200) {
            //couldn't reach user wishlist
            res.status(r.status).json({ status: 400, data: { error: "Steam account couldn't be accessed. Please ensure your account and game details are public and try again.", api: "Steam" } });
        }
        else {
            //reached it
            //console.log(r);
            res.status(200).json(r.data);
        }
    }
    catch (err) {
        res.sendStatus(500);
    }
});

exports.route = router