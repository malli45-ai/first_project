const express = require('express');
const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/urlshortener';

let collection;

// ✅ Rate Limiting (basic protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
});
app.use(limiter);

// ✅ URL validation
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ✅ Normalize URL (avoid duplicates)
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return url;
  }
}

// ✅ Async wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

async function start() {
  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db();
  collection = db.collection('urls');

  await collection.createIndex({ short: 1 }, { unique: true });
  await collection.createIndex({ url: 1 });

  // ✅ Health check (important for DevOps / Kubernetes)
  app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
  });

  // ✅ Create short URL
  app.post('/shorten', asyncHandler(async (req, res) => {
    let { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    url = normalizeUrl(url);

    // Check if URL already exists
    const existing = await collection.findOne({ url });
    if (existing) {
      return res.json({
        short: existing.short,
        shortUrl: `${req.protocol}://${req.get('host')}/${existing.short}`
      });
    }

    const short = nanoid(7);

    try {
      await collection.insertOne({
        short,
        url,
        createdAt: new Date(),
        clicks: 0
      });

      return res.json({
        short,
        shortUrl: `${req.protocol}://${req.get('host')}/${short}`
      });

    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'Collision, retry' });
      }
      throw err;
    }
  }));

  // ✅ Redirect + analytics
  app.get('/:short', asyncHandler(async (req, res) => {
    const { short } = req.params;

    const doc = await collection.findOne({ short });

    if (!doc) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Increment click count
    await collection.updateOne(
      { short },
      { $inc: { clicks: 1 } }
    );

    return res.redirect(doc.url);
  }));

  // ✅ Global error handler
  app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(port, () => {
    console.log(`🚀 URL Shortener running on port ${port}`);
  });
}

start().catch(err => {
  console.error('❌ Failed to start app:', err);
  process.exit(1);
});