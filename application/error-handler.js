module.exports = function errorHandler(err,req,res,next){
    if(err.name == "ExternalServerError"){
        return res.status(err.status).json({
            success: false,
            error: err.message
        });
    }else if(err.name == "NoBlogPostsFound"){
        return res.status(err.status).json({
            success: false,
            error: err.message
        });
    }
    return res.status(500).json({
        success: false,
        error: "Internal Server Error"
    });
}