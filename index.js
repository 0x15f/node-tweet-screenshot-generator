import screenshotTweet from "screenshot-tweet";

const express = require('express')
const app = express()
const port = 3001

app.get('/', async (req, res) => {
	buffer = await screenshotTweet(req.query.url);

    res.type('image/png');
    res.send(buffer);
});

app.listen(port, () => console.log(`Listening on port ${port}!`))
