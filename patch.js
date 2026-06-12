const fs = require('fs');
let indexJs = fs.readFileSync('index.js', 'utf8');
if (!indexJs.includes('404 Logger')) {
  indexJs = indexJs.replace("app.get('/health'", "app.use((req, res, next) => { res.on('finish', () => { if (res.statusCode === 404) console.log('404 Logger:', req.method, req.originalUrl); }); next(); });\n\napp.get('/health'");
  fs.writeFileSync('index.js', indexJs);
}
