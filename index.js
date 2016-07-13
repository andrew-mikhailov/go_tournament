var PORT = process.env.PORT || 8008;

var express = require('express'),
  http = require('http'),
  expressLayouts = require('express-ejs-layouts'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  server = http.createServer(app);

app.use(expressLayouts);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/app', express.static(__dirname + '/app'));

app.set('views', './views');
app.set('view engine', 'ejs');
app.set('layout', 'layout');
server.listen(PORT);

router.get('/', function (req, res) {
  res.render('home/home');
});

router.post('/tournament', function (req, res, next) {
  fs.writeFile("tournament.json", JSON.stringify(req.body.data), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });

  res.send({status: "OK"});
});

router.get('/tournament', function (req, res, next) {
  fs.readFile("tournament.json", function(err, data) {
    if(err) return console.log(err);
    res.end(data);
  });
});

app.use('/', router);
