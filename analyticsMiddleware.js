const _ = require('lodash');

// Memoize the analyzeBlogData function with a cache expiration time of 10 minutes (600000 milliseconds)
const memoizedAnalyzeBlogData = _.memoize(
  function (blogData) {
    const totalBlogs = blogData.length;

  // Find the blog with the longest title
  const blogWithLongestTitle = _.maxBy(blogData, 'title');

  // Determine the number of blogs with specific keywords in the title or content
  const keyword = 'privacy';
  const blogsWithKeyword = blogData.filter(blog => {
    const title = blog.title ? blog.title.toLowerCase().includes(keyword) : '';
    const content = blog.content ? blog.content.toLowerCase().includes(keyword) : '';

    return title || content;
  });

  // Create an array of unique blog titles
  const uniqueBlogTitles = _.uniq(blogData.map(blog => blog.title));

  return {
    totalBlogs,
    blogWithLongestTitle,
    numberOfBlogsWithKeyword: blogsWithKeyword.length,
    uniqueBlogTitles,
  };
    return analyticsData;
  },
  undefined,
  blogData => JSON.stringify(blogData), // Use a custom resolver to cache results based on the blogData object
  600000 // Cache expiration time in milliseconds (10 minutes)
);

module.exports = memoizedAnalyzeBlogData;
