var PORT = process.env.PORT || 8008;

var express = require('express'),
  http = require('http'),
  expressLayouts = require('express-ejs-layouts'),
  app = express(),
  router = express.Router(),
  server = http.createServer(app);

app.use(expressLayouts);
app.use('/app', express.static(__dirname + '/app'));
app.all("/*", function(req, res, next) {
  res.render('home/home');
});

app.set('views', './views');
app.set('view engine', 'ejs');
app.set('layout', 'layout');
server.listen(PORT);

router.get('/', function (req, res) {
  res.render('home/home');
});

app.use('/', router);

