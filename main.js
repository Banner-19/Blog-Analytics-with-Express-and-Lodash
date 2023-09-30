const express = require('express');
const axios = require('axios');
const analyzeBlogData = require('./analyticsMiddleware');

const app = express();

app.get('/',function(req,res){
	res.send('<h1>Site is working</h1>');
});

// Middleware to fetch data from the third-party blog API
app.use('/api/blog-stats', async (req, res, next) => {
  try {
    //API link
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });
    const blogData=response.data.blogs;
    console.log(blogData);
    req.blogData = blogData; 
    next();
    
    // Check if blogData.posts is a JSON string and parse it to an object
    if (blogData && typeof blogData.posts === 'string') {
      blogData.posts = JSON.parse(blogData.posts);
    }

    // Check if blogData.posts is an array after parsing
    if (blogData && Array.isArray(blogData.posts)) {
      req.blogData = blogData;
      next();
    } else {
      console.error('Invalid or missing posts array in API response:', blogData);
      res.status(500).json({ error: 'Invalid or missing posts array in API response' });
    }    

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data from the blog API' });
  }
});

// Middleware for blog analytics
app.use('/api/blog-stats', (req, res, next) => {
  // Use memoized function to get cached or compute new analytics data
  res.locals.blogAnalytics = analyzeBlogData(req.blogData);
  next();
});

// Blog search endpoint
app.get('/api/blog-search', (req, res) => {
  const query = req.query.query.toLowerCase(); // Convert the query to lowercase for case-insensitive search

  // Perform custom search logic on the blogData.posts array
  const searchResults = req.blogData.posts.filter(blog => {
    // Check if the blog title or content contains the query string
    const titleMatch = blog.title ? blog.title.toLowerCase().includes(query) : '';
    const contentMatch = blog.content ? blog.content.toLowerCase().includes(query) : '';
    return titleMatch || contentMatch;
  });

  // Respond to the client with the search results

  res.json({ results: searchResults });
});

// API endpoint to get blog statistics
app.get('/api/blog-stats', (req, res) => {
  // Respond with cached or computed analytics data
  res.json(res.locals.blogAnalytics);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
