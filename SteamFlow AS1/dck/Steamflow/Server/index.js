//Page hosting
const express = require("express");
const application = express();
const path = require("path");


//this will do nothing in production, enviroment variables will be baked into the docker compose
require("dotenv").config();
const PORT = process.env.PORT || 8080;


//mixed api
const joint = require("./routers_n_utils/Joint");
const steam = require("./routers_n_utils/steam");
const youtube = require("./routers_n_utils/youtube");
application.use(joint.route);
application.use(steam.route);
application.use(youtube.route);

const DynamoDB = joint.dynamoRef;


application.use(express.static(path.join(__dirname, '../client/build/')));
application.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/','index.html'));
})

async function Launch() {
    try {
        console.log("Attempting to validate DynamoDB...");
        await DynamoDB.Validate();
    }
    catch (err) {
        throw err;
    }


    //--change to build before submission
    application.listen(PORT, () => {
        console.log(`Application listening on ${PORT}`);
    });
}

Launch();