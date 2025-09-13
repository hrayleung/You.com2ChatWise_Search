# You.com to ChatWise Search Proxy

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A proxy server that converts [You.com Search API](https://api.ydc-index.io/) responses into [ChatWise](https://chatwise.app/) search extension compatible format.

## 🎯 Project Overview

This project implements a middleware proxy service that:
- Receives standard request format from ChatWise search extension
- Calls You.com Search API to retrieve search results
- Converts results to ChatWise expected response format
- Supports parallel processing of multiple search queries for improved performance

## 🏗️ Technical Architecture

- **Backend**: Node.js + Express.js
- **HTTP Client**: Axios
- **Deployment**: PM2 process management support
- **API**: RESTful API design

## 📋 API Specification

### Request Format

According to [ChatWise Custom Search Provider Documentation](https://docs.chatwise.app/zh/web-search), the proxy service accepts POST requests in the following format:

```json
{
  "queries": ["search query 1", "search query 2"],
  "max_results": 10,
  "exclude_domains": ["example.com"]
}
```

**Note**: Current implementation primarily handles the `queries` parameter. Support for `max_results` and `exclude_domains` parameters can be extended in future versions.

### Response Format

The proxy service returns JSON responses compliant with ChatWise specifications:

```json
{
  "results": [
    {
      "query": "search query 1",
      "links": [
        {
          "title": "Search result title",
          "url": "https://example.com",
          "content": "Search result description or summary content"
        }
      ]
    }
  ]
}
```

### You.com API Integration

This service calls the You.com Search API (`https://api.ydc-index.io/v1/search`):
- **Authentication**: API key passed via `X-API-Key` request header
- **Supported Result Types**: `web` and `news` search results
- **Result Merging**: Automatically merges and deduplicates multiple types of search results
- **Parallel Processing**: Uses `Promise.all` to process multiple queries in parallel for improved performance

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0+ (LTS version recommended)
- **You.com API Key**: Obtain from [You.com API](https://api.you.com)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone [<repository-url>](https://github.com/hrayleung/You.com2ChatWise_Search)
   cd chatwise-proxy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Set You.com API key
   export YOU_API_KEY=ydc-sk-your-api-key-here
   ```
   
   > ⚠️ **Security Warning**: Do not commit API keys to version control

4. **Start the Service**
   ```bash
   npm start
   ```
   
   The service will start at `http://localhost:1999`

### Testing the API

```bash
curl -X POST http://localhost:1999/search \
  -H 'Content-Type: application/json' \
  -d '{
    "queries": ["open source LLMs", "Node.js Express framework"]
  }'
```

**Expected Response Example**:
```json
{
  "results": [
    {
      "query": "open source LLMs",
      "links": [
        {
          "title": "Best Open Source Large Language Models in 2024",
          "url": "https://example.com/article1",
          "content": "This article provides a comprehensive overview of the most popular open source large language models..."
        }
      ]
    },
    {
      "query": "Node.js Express framework",
      "links": [
        {
          "title": "Express.js Official Documentation",
          "url": "https://expressjs.com",
          "content": "Express.js is a fast, minimalist web framework for Node.js..."
        }
      ]
    }
  ]
}
```

## 🚀 Production Deployment

### Using PM2 (Recommended)

PM2 is a production process manager for Node.js applications with built-in load balancer.

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**
   ```bash
   YOU_API_KEY=ydc-sk-your-api-key pm2 start ecosystem.config.js
   ```

3. **PM2 Management Commands**
   ```bash
   # View running processes
   pm2 list
   
   # View logs
   pm2 logs you.com2chatwise_search
   
   # Restart the service
   pm2 restart you.com2chatwise_search
   
   # Stop the service
   pm2 stop you.com2chatwise_search
   
   # Auto-start on system reboot
   pm2 startup
   pm2 save
   ```

### Environment Configuration

The `ecosystem.config.js` file reads the `YOU_API_KEY` from the environment at runtime:

```javascript
module.exports = {
  apps: [{
    name: 'you.com2chatwise_search',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
      YOU_API_KEY: process.env.YOU_API_KEY
    }
  }]
};
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 1999
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t chatwise-proxy .
docker run -d -p 1999:1999 -e YOU_API_KEY=ydc-sk-your-key chatwise-proxy
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YOU_API_KEY` | Yes | Your You.com API key (format: `ydc-sk-...`) |
| `PORT` | No | Server port (default: 1999) |
| `NODE_ENV` | No | Environment mode (development/production) |

### Port Configuration

To change the default port (1999), you can either:
- Set the `PORT` environment variable: `export PORT=3000`
- Modify the port directly in `server.js`

## 🔐 Security Best Practices

- **API Key Protection**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files for local development (already in `.gitignore`)
- **HTTPS**: Use HTTPS in production environments
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Input Validation**: The service validates input queries and returns appropriate error responses

## 🛠️ Troubleshooting

### Common Issues

1. **"API key is not configured" Error**
   - Ensure `YOU_API_KEY` environment variable is set
   - Verify the API key format starts with `ydc-sk-`
   - Check that the environment variable is available in your shell

2. **"Failed to fetch from You.com API" Error**
   - Verify your You.com API key is valid and active
   - Check your internet connection
   - Ensure You.com API service is accessible

3. **Port Already in Use**
   - Change the port using `PORT=3000 npm start`
   - Kill the process using the port: `lsof -ti:1999 | xargs kill`

4. **Empty Results**
   - Verify that You.com API is returning data for your queries
   - Check the API response format matches expectations
   - Review server logs for detailed error information

### Debugging

Enable detailed logging by setting:
```bash
export NODE_ENV=development
```

View real-time logs with PM2:
```bash
pm2 logs you.com2chatwise_search --lines 100
```

## 🔄 ChatWise Integration

### Setting up Custom Search Provider in ChatWise

1. Open ChatWise application
2. Navigate to Settings → Extensions → Web Search
3. Select "Custom Search Provider"
4. Configure the following:
   - **Endpoint URL**: `http://your-server:1999/search`
   - **Request Method**: POST
   - **Content Type**: application/json
   - **Request Format**: Use the JSON format specified in this README

### Testing the Integration

After setup, test by asking ChatWise to search for information. The queries should be forwarded to your proxy service and return You.com search results.

## 📊 Performance Considerations

- **Parallel Processing**: Multiple queries are processed simultaneously using `Promise.all`
- **Memory Usage**: Minimal memory footprint with efficient result processing
- **Response Time**: Typical response time depends on You.com API latency (usually < 2 seconds)
- **Scalability**: Can handle multiple concurrent requests; consider load balancing for high traffic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Links

- [You.com API Documentation](https://api.you.com)
- [ChatWise Official Website](https://chatwise.app)
- [ChatWise Custom Search Documentation](https://docs.chatwise.app/zh/web-search)
- [Express.js Documentation](https://expressjs.com)
- [PM2 Documentation](https://pm2.keymetrics.io)

---

**Project Name**: `you.com2chatwise_search`  
**Version**: 1.0.0  
**Maintainer**: Add your information here
