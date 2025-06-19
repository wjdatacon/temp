const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let applications = [];

function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

function handler(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  if (req.method === 'GET') {
    if (pathname === '/') {
      serveStatic(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
    } else if (pathname === '/admin') {
      serveStatic(res, path.join(__dirname, 'public', 'admin.html'), 'text/html');
    } else if (pathname === '/public/script.js') {
      serveStatic(res, path.join(__dirname, 'public', 'script.js'), 'text/javascript');
    } else if (pathname === '/api/applications') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(applications));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (pathname === '/api/apply') {
        const data = JSON.parse(body);
        const id = Date.now().toString();
        applications.push({ id, ...data, status: 'submitted' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id }));
      } else if (pathname === '/api/verify') {
        const { id } = JSON.parse(body);
        const app = applications.find(a => a.id === id);
        if (app) {
          app.status = 'verified';
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } else if (pathname === '/api/schedule') {
        const { id, interviewDate } = JSON.parse(body);
        const app = applications.find(a => a.id === id);
        if (app) {
          app.status = 'scheduled';
          app.interviewDate = interviewDate;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } else if (pathname === '/api/result') {
        const { id, result } = JSON.parse(body);
        const app = applications.find(a => a.id === id);
        if (app) {
          app.status = 'interviewed';
          app.result = result;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
}

function startServer(port = 3000) {
  const server = http.createServer(handler);
  return new Promise(resolve => {
    server.listen(port, () => resolve(server));
  });
}

if (require.main === module) {
  startServer().then(server => {
    console.log('Server running on port', server.address().port);
  });
}

module.exports = { startServer };
