const redis = require('redis');

const client = redis.createClient({ 
        socket:{
            host:'redis-container',
            port:6379
        }
    });
client.on('connect',()=>console.log("Connected to Redis"));
client.on('error',(err)=>console.log(`Error: ${err}`));
client.on('end',()=>console.log("Redis Connection End"));

module.exports = client;