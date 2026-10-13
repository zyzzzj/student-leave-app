const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg4NzY0ODAxLCJleHAiOjE3ODkzNjk2MDF9.JxnByJNTWax9OzqJ9nAik9JK9wF4k6Y4WT59pKh92oc';

const data = '';
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/leave/approve/8',
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.write(data);
req.end();