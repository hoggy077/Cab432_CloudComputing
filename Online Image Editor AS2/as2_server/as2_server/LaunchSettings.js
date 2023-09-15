require("dotenv").config();


var args = {}

process.argv.forEach((v,i)=>{
    if(v.split("=").length == 2){
        args[v.split("=")[0]] = v.split("=")[1]
    }
})


module.exports = {
    exposedPort: process.env.exposedPort || args.exposedPort || 8080,
    buildPath: process.env.buildPath || args.buildPath || "../../as2_client/build",
    redisSettings: JSON.parse(process.env.redisSettings || args.redisSettings || "{}"),
    S3Settings: JSON.parse(process.env.S3Settings || args.S3Settings || "{}"),
    cacheless: process.env.cacheless || args.cacheless || false
}

console.log(module.exports)
