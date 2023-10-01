const { fetchBlogStats,searchBlog } = require('./controller.js');

const router = require('express').Router();

// Fetch the blog Stats
router.get('/blog-stats',fetchBlogStats);

router.get('/blog-search',searchBlog);

module.exports = router;