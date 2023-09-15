const AuthKey = process.env.DEV_Key || null;
const AuthRegex = /Bearer (.*)/


exports.VerifyAuth = (req, res, next) => {
    if (AuthKey == null)
        res.sendStatus(401);

    var reqAuth = req.headers.authorization;
    /*if (typeof reqAuth != 'undefined')
    {
        if (AuthRegex.test(reqAuth))
        {
            var result = reqAuth.match(AuthRegex)[1];
            if (result != null && result == AuthKey)
                next();
        }
    }*/

    /*
    I evaluate AuthKey first to avoid overhead of trying to read the header just to deny it anyway.
    Code below was a guard clause rewrite to allow error specific results and readibility.
    */

    if (typeof reqAuth == 'undefined') {
        res.status(401).json({ error: "Bearer token not included in request" });
        return;
    }

    if (!AuthRegex.test(reqAuth)) {
        res.status(401).json({ error: "Bearer token format is incorrect" });
        return;
    }

    var result = reqAuth.match(AuthRegex)[1]
    if (result == null) {
        res.status(403).json({ error: "Bearer token failed to process. Included key is missing or failed to proccess." });
        return;
    }

    if (result != AuthKey) {
        res.status(403).json({ error: "Bearer token doesn't match" });
        return;
    }

    next();
};

