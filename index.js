const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var porque = {};
datafile = '/home/elan/whyislifesohard/porque.txt';

const fs = require('fs');
const readline = require('readline');
async function loadLineByLine() {
    const rs = fs.createReadStream(datafile);
    const rl = readline.createInterface({
        input: rs,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        porque[line] = "";
    }
}

loadLineByLine();

const ws = fs.createWriteStream(datafile, {
    flags: 'a'
});

function add(data) {
    if (!(data in porque)) {
        ws.write(data);
        ws.write("\n");
        porque[data] = "";
    }
}

const page = fs.readFileSync('/home/elan/whyislifesohard/index.html', 'utf8');
app.get('/', function(req, res) {
    res.send(page);
})

const turbo = fs.readFileSync('/home/elan/whyislifesohard/turbo.html', 'utf8');
app.get('/turbo', function(req, res) {
    res.send(turbo);
})

captchaSecret = process.env.CAPTCHA_SECRET
const request = require('request');
app.post('/', function(req, res) {
    data = req.body.m.trim();
    captcha = req.body.t;

    if (data.length > 234) {
        res.status(400);
        res.send("too long\n");
        return;
    }

    if (Object.keys(porque).length > 10000) {
        res.status(500);
        res.send("too full\n");
        return;
    }

    if (data.includes("<")) {
        res.status(406);
        res.send("too nasty\n");
        return;
    }

    request.post({
            url: "https://www.google.com/recaptcha/api/siteverify",
            form: {
                secret: captchaSecret,
                response: captcha
            }
        },
        function(err, httpResponse, body) {
            if (!err) {
                const resp = JSON.parse(body);
                if (resp.success && resp.score > 0.7) {
                    add(data);
                    res.status(200);
                    res.send();
                } else {
                    res.status(418);
                    res.send("the gods were not happy\n");
                }
            } else {
                res.status(418);
                res.send("the gods are busy\n")
            }
        })
})

app.get('/random', function(req, res) {
    k = Object.keys(porque);
    res.send(k[k.length * Math.random() << 0]);
})

app.get('/recent', function(req, res) {
    k = Object.keys(porque);
    res.send(k[k.length - 1]);
})

password = process.env.PASSWORD
app.get('/all', function(req, res) {
    if (req.query.password == password) {
        k = Object.keys(porque);
        res.send(k)
        return
    }

    res.status(401)
    res.send("patience grasshopper\n")
})

app.get('/search/:term', function(req, res) {
    res.send('return array of items containing term\n');
})

app.get('/top/:n', function(req, res) {
    res.send('return top n items\n');
})

app.listen(3000, function() {
    console.log('life is hard on port 3000')
})
