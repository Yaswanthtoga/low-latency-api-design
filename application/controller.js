const axios = require('axios');
const { fetchBlogPosts, blogStats, getSearchedBlogs } = require('./middlewares.js');


// Fetch Blog Statistics
const fetchBlogStats = async (req,res,next)=>{
    try {
        const blogPosts = await fetchBlogPosts();
        await blogStats(blogPosts).then((data)=>res.status(200).json({data})).catch((err)=>{throw err});
    } catch (error) {
        next(error);
    }
}

// Searching Queries for Blog
const searchBlog = async(req,res,next)=>{
    try {
        const { query } = req.query;
        const data = await getSearchedBlogs(query);

        return res.status(200).json({data});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    fetchBlogStats,
    searchBlog
}
