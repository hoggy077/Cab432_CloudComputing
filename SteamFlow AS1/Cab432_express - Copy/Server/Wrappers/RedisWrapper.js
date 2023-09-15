
const Settings = process.env.redisConfig ? JSON.parse(process.env.redisConfig) : {}

const redisClient = require("redis").createClient(Settings);
redisClient.on("error", (err) => {
    console.log(err);
    throw err;
}).on("connect", () => {
    exports.isConnected = true;
    console.log("Redis client connected.");
}).on("disconnect", () => {
    exports.isConnected = false;
    console.log("Redis client disconnected.")
});


redisClient.connect();
exports.isConnected = false;



exports.disconnect = () => redisClient.disconnect();
exports.connect = () => redisClient.connect();


exports.hasEntry = async function (Key) {
    var ex = await redisClient.exists(Key) == 0 ? false : true;
    return ex;
}

exports.getJsonEntry = async (Key) => JSON.parse(await redisClient.get(Key));
exports.getEntry = async (Key) => await redisClient.get(Key);


exports.setJsonEntry = async (Key, value) => await redisClient.set(Key, JSON.stringify(value));
exports.setEntry = async (Key, value) => await redisClient.set(Key, value);

exports.setExpireAt = async (Key, time) => await redisClient.expireAt(Key, time);
exports.setExpire = async (Key, seconds) => await redisClient.expire(Key, seconds);