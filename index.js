const express = require('express')
const app = express()
const port = 3001

app.get('/', async (req, res) => {
	const puppeteer = require('puppeteer')

	const browser = await puppeteer.launch({
		headless: true,
		args: ['--unlimited-storage', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
	});

	const page = await browser.newPage();

	await page.goto(decodeURIComponent(req.query.url), {waitUntil: ['load'], timeout: 30000});

    const selector = '.tweet[data-tweet-id="' + req.query.id + '"]';

    const rect = await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element)
            return null;
        const {x, y, width, height} = element.getBoundingClientRect();
        return {left: x, top: y, width, height, id: element.id};
    }, selector);

    if (!rect)
        throw Error(`Could not find element that matches selector: ${selector}.`);

    buffer = await page.screenshot({
        clip: {
            x: rect.left,
            y: rect.top,
            width: rect.width * 2,
            height: rect.height * 2
        }
    });

    res.type('image/png');
    res.send(buffer);
});

app.listen(port, () => console.log(`Listening on port ${port}!`))
