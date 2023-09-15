
const Settings = process.env.redisConfig ? JSON.parse(process.env.redisConfig) : {}
const isDisabled = "Disabled" in Settings && Settings.Disabled == true;
if (isDisabled)
    console.log("Redis cache Disabled");

const redisClient = require("redis").createClient(Settings);

exports.isConnected = false;

if (!isDisabled) {
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
}

exports.disconnect = () => redisClient.disconnect();
exports.connect = () => redisClient.connect();


exports.hasEntry = async function (Key) {
    if (isDisabled)
        return await false;

    var ex = await redisClient.exists(Key) == 0 ? false : true;
    return ex;
}

exports.getJsonEntry = async (Key) => JSON.parse(await redisClient.get(Key));
exports.getEntry = async (Key) => await redisClient.get(Key);


exports.setJsonEntry = async (Key, value) => {
    if (isDisabled)
        return;
    await redisClient.set(Key, JSON.stringify(value));
    console.log(`${Key} set`);
}
exports.setEntry = async (Key, value) => {
    if (isDisabled)
        return;
    await redisClient.set(Key, value);
    console.log(`${Key} set`)
}

exports.setExpireAt = async (Key, time) =>
{
    if (isDisabled)
        return;
    await redisClient.expireAt(Key, time)
    console.log(`${Key} expire set`)
};
exports.setExpire = async (Key, seconds) => {
    if (isDisabled)
        return;
    await redisClient.expire(Key, seconds);
    console.log(`${Key} expire set`)
}