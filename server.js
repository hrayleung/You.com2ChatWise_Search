const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 1999;

app.use(express.json());

app.post('/search', async (req, res) => {
  const { queries } = req.body;

  if (!queries || !Array.isArray(queries) || queries.length === 0) {
    return res.status(400).json({ error: '`queries` array is missing or empty' });
  }

  const apiKey = process.env.YOU_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  try {
    // 使用 Promise.all 并行处理所有查询
    const searchPromises = queries.map(async (userQuery) => {
      // 为每个查询调用 You.com API
      const youResponse = await axios.get('https://api.ydc-index.io/v1/search', {
        headers: { 'X-API-Key': apiKey },
        params: { query: userQuery },
      });

      const youResults = youResponse.data.results || {};
      let combinedResults = [];

      if (youResults.web && Array.isArray(youResults.web)) {
        combinedResults = combinedResults.concat(youResults.web);
      }
      if (youResults.news && Array.isArray(youResults.news)) {
        combinedResults = combinedResults.concat(youResults.news);
      }

      // 按照 ChatWise 文档要求，格式化 links 数组
      const links = combinedResults.map(item => ({
        title: item.title,
        url: item.url,
        // ！！！注意：字段名是 "content"，不是 "description"
        content: item.description || (item.snippets && item.snippets.join('\n')) || '',
      }));

      // 返回符合 ChatWise 单个查询结果的格式
      return {
        query: userQuery,
        links: links,
      };
    });

    // 等待所有查询完成
    const results = await Promise.all(searchPromises);

    // 构建最终的、完全符合文档的响应
    const chatwiseResponse = {
      results: results,
    };

    res.status(200).json(chatwiseResponse);

  } catch (error) {
    console.error('Error during proxy request:', error.message);
    res.status(500).json({ error: 'Failed to fetch from You.com API' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
