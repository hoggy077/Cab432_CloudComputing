const express = require("express");
const router = express.Router();
const Token = require("./TokenMiddleware");

const axios = require("axios").default;
const Youtube_BaseAPI = "https://www.googleapis.com/youtube/v3/";

const YoutubeAPI_Key = process.env.YOUTUBE_Key || null;


if (YoutubeAPI_Key == null)
    throw new Exception("Youtube API Key missing from enviroment");



exports.paths = {
    search: async (parameters) => {
        //200 is fine, 403 is forbidden/quota exceeded
        var r = {
            data: {}
        }
        if (!("key" in parameters)) {
            //missing Key
            r.status = 400;
            return r;
        }

        if (!("q" in parameters)) {
            //missing query
            r.status = 400;
            return r;
        }

        await axios.get(`${Youtube_BaseAPI}search/`, { params: parameters }).then((response) => {
            r = response;
            r.status = response.status;
        }).catch((error) => {
            r = error;
            r.status = error.response.status;
        })

        return r;
    }
}



router.get("/api/v1/youtube/:endpoint", Token.VerifyAuth, async (req, res) => {
    if (req.params.endpoint in exports.paths) {
        req.query.key = YoutubeAPI_Key;
        req.query.part = "snippet";
        var result = await exports.paths[req.params.endpoint](req.query);
        res.status(result.status).json(result.data);
    }
    else
        res.sendStatus(404);
});


exports.route = router