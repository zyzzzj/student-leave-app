const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/leave/list?page=1&pageSize=10',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test_token'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应:', body);
  });
});

req.on('error', (error) => {
  console.error('错误:', error.message);
});

req.end();