const express = require('express');
const morgan = require('morgan');
const apiRoutes = require('./routes.js');
const errorHandler = require('./error-handler.js');
const client = require('./redisClient.js');

const app = express();

// Middlewares
app.use(morgan("combined"));
app.use("/api",apiRoutes);
app.use(errorHandler);

app.listen(8000,async (err)=>{
    if(err)console.log(err);
    else{
        console.log("Server started at 8000");
        await client.connect()
            .then(()=>('connected to redis'))
            .catch((err)=>console.log(`Error: ${err}`));
    }
})