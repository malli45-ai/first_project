const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');


const app = express();
app.use(bodyParser.json());


const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/urlshortener';


let collection;


async function start() {
const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db();
collection = db.collection('urls');


await collection.createIndex({ short: 1 }, { unique: true });


app.post('/shorten', async (req, res) => {
const { url } = req.body;
if (!url) return res.status(400).json({ error: 'url required' });
const short = nanoid(7);
const doc = { short, url, createdAt: new Date() };
await collection.insertOne(doc);
res.json({ short, shortUrl: `${req.protocol}://${req.get('host')}/${short}` });
});


app.get('/:short', async (req, res) => {
const short = req.params.short;
const doc = await collection.findOne({ short });
if (!doc) return res.status(404).send('Not found');
res.redirect(doc.url);
});


app.listen(port, () => console.log(`URL app listening on ${port}`));
}


start().catch(err => {
console.error('Failed to start app', err);
process.exit(1);
});