require("dotenv").config();


var args = {}

process.argv.forEach((v,i)=>{
    if(v.split("=").length == 2){
        args[v.split("=")[0]] = v.split("=")[1]
    }
})


module.exports = {
    exposedPort: process.env.exposedPort || args.exposedPort || 8080,
    buildPath: process.env.buildPath || args.buildPath || "../client/build",
    redisSettings: JSON.parse(process.env.redisSettings || args.redisSettings || "{\"socket\":{\"port\":6379,\"host\":\"tp-n10820151-as2.km2jzi.ng.0001.apse2.cache.amazonaws.com\"}}"),
    S3Settings: JSON.parse(process.env.S3Settings || args.S3Settings || "{\"bucketName\":\"tp-n10810251-as2\"}"),
    cacheless: process.env.cacheless || args.cacheless || false
}

console.log(module.exports)
