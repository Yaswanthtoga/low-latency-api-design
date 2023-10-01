const axios = require("axios");
const _ = require('lodash');
const redisClient = require('./redisClient.js');

// Error Formatter
const errorFormatter = (error,name)=>{
    const err = new Error(error.response.statusText);
    err.name = name;
    err.status = error.response.status;
    return err;
}

// Fetch Blog Posts Data
const fetchPosts = async () => {
    const options = {
        headers: {
            'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
    };
    const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';

    try {
        const response = await axios.get(url, options);
        return response.data;
    } catch (error) {
        const serviceError = errorFormatter(error,"ExternalServiceError");
        throw serviceError;
    }
}

// Fetching Posts with caching
const fetchBlogPosts = async ()=>{
    let result;
    try {
        
        await redisClient.exists("blogposts").then(async(exists)=>{
            if(exists){
                await redisClient.get("blogposts").then((data)=>{result=JSON.parse(data)}).catch((err)=>{throw err});
            }else{
                const data = await fetchPosts();
                await redisClient.setEx("blogposts",300,JSON.stringify(data)).then(()=>console.log("Cached")).catch((err)=>{throw err});
                result = data;
            }
        }).catch((err)=>{throw err});

        return result;
    } catch (error) {
        throw error;
    }
}

// Blog Statistics Info Data
const blogStats = async (blogPosts)=>{
    if (blogPosts.length==0) {
        const blogsError = new Error('No blog posts found');
        blogsError.name = "NoBlogPostsFound";
        blogsError.status = 404;
        throw blogsError;
    }

    try {
        let stats;
        await redisClient.exists("blogstats").then(async (exists)=>{
            if(exists){
                await redisClient.get("blogstats").then((data)=>{
                    stats =  JSON.parse(data);
                }).catch((err)=>{throw err});
            }else{
                const totalBlogs = blogPosts?.blogs?.length;
                const blogWithLongestTitle = _.maxBy(blogPosts?.blogs, 'title.length');
                const blogsWithPrivacyTitle = _.filter(blogPosts?.blogs, post => _.includes(post.title.toLowerCase(), 'privacy'));
                const uniqueBlogTitles = _.uniqBy(blogPosts?.blogs, 'title');
            
                const data = {
                    totalBlogs,
                    blogWithLongestTitle,
                    blogsWithPrivacyTitle,
                    uniqueBlogTitles
                };

                await redisClient.setEx("blogstats",300,JSON.stringify(data)).then(()=>console.log("Cached")).catch((err)=>{throw err});
                stats = data;
            }
        }).catch((err)=>{throw err});

        return stats;
    } catch (error) {
        throw errorFormatter(error,"ExternalServiceError");
    }
}

// Search Blogs
const getSearchedBlogs = async (query)=>{
    try {
        const blogPosts = await fetchBlogPosts();
        if(!query)return blogPosts;
        const searchResults = _.filter(blogPosts.blogs, blog =>
            _.includes(_.toLower(blog.title), _.toLower(query))
        );

        return searchResults;
    } catch (error) {
        throw errorFormatter(error,"ExternalServiceError");
    }
}

module.exports = {
    fetchBlogPosts,
    blogStats,
    getSearchedBlogs
}