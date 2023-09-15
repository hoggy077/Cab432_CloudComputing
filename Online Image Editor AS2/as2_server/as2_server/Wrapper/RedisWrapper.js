const { createClient } = require("redis")


module.exports = class RedisWrapper
{
    constructor(settings, connectCallback, disconnectCallback, errorCallback, reconnectCallback){

        this.status = {
            isConnected: false,
            callbacks:{
                disconnect: ()=>{},
                connect: ()=>{},
                error: (error)=>{},
                reconnect: (msg) =>{}
            },
            client: createClient()
        }


        this.status.callbacks = {
            disconnect: disconnectCallback == undefined ? ()=>{} : disconnectCallback,
            connect: connectCallback == undefined ? ()=>{} : connectCallback,
            error: errorCallback == undefined ? (err)=>{} : errorCallback,
            reconnect: reconnectCallback == undefined ? (msg)=>{} : reconnectCallback
        }


        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onError = this.onError.bind(this)

        this.status.client = createClient(settings);
        this.status.client.on("error", this.onError).on("connect", this.onConnect).on("disconnect", this.onDisconnect)
    }


    //#region callbacks and events
    async onConnect(){
        this.status.isConnected = true;
        this.status.callbacks.connect()
    }

    async onDisconnect(){
        this.status.isConnected = false;
        this.status.callbacks.disconnect()
    }

    async onError(error){
        this.status.isConnected = false;
        this.status.callbacks.error(error)
    }

    async onReconnect(message){
        this.status.callbacks.reconnect(error)
    }

    //#endregion

    async tryConnect(){

        await this.status.client.connect();
    }

    async Disconnect(){
        await this.status.client.disconnect();
    }

    async performQuit(){
        await this.status.client.quit();
    }

    async hasKey(key){
        if(!this.status.isConnected)
            return undefined;

        return await this.status.client.exists(key);
    }


    async getValue(key){
        if(!this.status.isConnected)
            return undefined;

        return await this.status.client.get(key);
    }

    async setValue(key, value){
        if(!this.status.isConnected)
            return undefined;

        return await this.status.client.set(key, value);
    }

    async setExpirationAt(key, unix){
        await this.status.client.expireAt(key, unix);
    }
}