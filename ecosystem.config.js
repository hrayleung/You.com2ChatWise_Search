module.exports = {
    apps: [{
      name: 'you.com2chatwise_search',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        // Read from current shell environment at start time
        YOU_API_KEY: process.env.YOU_API_KEY
      }
    }]
  };
  
