const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
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

const ws = fs.createWriteStream(datafile, {flags:'a'});
function add(data) {
    if (!(data in porque)) {
        ws.write(data + "\n");
        porque[data] = ""; 
    }
}

viewfile = '/home/elan/whyislifesohard/index.html';
const page = fs.readFileSync(viewfile, 'utf8');
console.log(page);

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

app.post('/', function(req, res) {
    data = get(req.body);
    if (data.length > 280) {
        res.status(400);
	res.send("too long");
    }

    add(data);
    res.status(200);
    res.send();
})

app.get('/random', function(req, res) {
    k = Object.keys(porque);
    res.send(k[k.length * Math.random() << 0]);
})

app.listen(3000, function() {
    console.log('life is hard on port 3000')
})
