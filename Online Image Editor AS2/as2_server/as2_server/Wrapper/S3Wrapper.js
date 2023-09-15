const AWS = require("aws-sdk");
const fs = require("fs");

module.exports = class S3Wrapper{
    constructor(settings, onVerify, onError){

        this.status = {
            isVerified: false,
            client: new AWS.S3({region:"ap-southeast-2"}),
            bucketName: settings.bucketName,
            callbacks:{
                error: onError == undefined ? (err)=>{} : onError,
                verify: onVerify == undefined ? ()=>{} : onVerify
            }
        }

        this.verifyBucket = this.verifyBucket.bind(this);

    }

    async verifyBucket(){
        this.status.client.listBuckets((err,data)=>{
            if(err){
                this.status.callbacks.error(err)
                return;
            }

            var res = data.Buckets.find((b)=> b.Name == this.status.bucketName);
            if(res === undefined){
                this.status.callbacks.error(`Bucket with name ${this.status.bucketName} couldn't be found`)
            }
            else{
                this.status.isVerified = true;
                this.status.callbacks.verify();
            }
        })
        return;
    }


    async uploadImage(checksum, imgFile, tags){

        if(!this.status.isVerified)
            return undefined;


        return await this.status.client.upload({
            Bucket: this.status.bucketName,
            Key: `${checksum}.png`,
            Body: imgFile.hasOwnProperty("data") ? imgFile.data : imgFile,
            Tagging: tags
        }).promise();
    }


    async hasObject(key){
        return new Promise(async (resolve,reject)=>{
            await this.status.client.listObjectsV2({
                Bucket: this.status.bucketName
            }, (err, data)=>{
                if(err){
                    this.status.callbacks.error(err)
                    resolve(false);
                }
    
                var res = data.Contents.find((b)=> b.Key == key);
                if(res === undefined){
                    resolve(false);
                }
                else{
                    resolve(true);
                }
            })
        })

        // var result = false;
        // await this.status.client.listObjectsV2({
        //     Bucket: this.status.bucketName
        // }, (err, data)=>{
        //     if(err){
        //         this.status.callbacks.error(err)
        //         return;
        //     }

        //     var res = data.Contents.find((b)=> b.Key == key);
        //     if(res === undefined){
        //         return;
        //     }
        //     else{
        //         result = true;
        //     }
        // });
        // return result;
    }

    async getURL(key){
        return new Promise(async (resolve, reject)=>{
            var t = await this.hasObject(key);
            if(t){
                var url = await this.status.client.getSignedUrl("getObject", 
                {
                    Bucket: this.status.bucketName,
                    Key: key
                });
                resolve(url.split("?")[0]);
                return;
            }
            resolve(undefined);
        });
    }
}