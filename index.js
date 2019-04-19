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

    convertcsv();
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
const turbo = fs.readFileSync('/home/elan/whyislifesohard/turbo.html', 'utf8');

function get(data) {
    if (Object.keys(data).length == 1) {
        k = Object.keys(data)[0];
        v = data[k];
        if (k.length > v.length) {
            return k;
        }
        return v.trim();
    } else {
        winner = "";
        for (var k in data) {
            if (k.length > winner.length) {
                winner = k;
            } else {
                winner = v;
            }
        }
        return winner.trim();
    }
}

app.get('/', function(req, res) {
    res.send(page);
})

app.get('/turbo', function(req, res) {
    res.send(turbo);
})

app.post('/', function(req, res) {
    data = get(req.body);
    if (data.length > 280) {
        res.status(400);
        res.send("too long");
        return;
    }

    if (Object.keys(porque).length > 10000) {
        res.status(500);
        res.send("too full");
        return;
    }

    ld = data.toLowerCase();
    if (ld.includes("<") || ld.includes("&lt;")) {
        res.status(406);
        res.send("too nasty");
        return;
    }

    add(data);
    res.status(200);
    res.send();
})

app.get('/random', function(req, res) {
    k = Object.keys(porque);
    res.send(k[k.length * Math.random() << 0]);
})

app.get('/recent', function(req, res){
    k = Object.keys(porque);
    res.send(k[k.length-1]);
})

app.get('/all', function(req, res) {
    if (req.query.password == "12345") {
        k = Object.keys(porque);
        res.send(k)
    }

    res.status(401)
    res.send("what is the password")
})

app.get('/search/:term', function(req, res) {
    res.send('return array of items containing term');
})

app.get('/top/:n', function(req, res) {
    res.send('return top n items');
})

app.listen(3000, function() {
    console.log('life is hard on port 3000')
})
