const express = require('express')
const app = express()
const port = 3001

app.get('/', async (req, res) => {
    try {
        const puppeteer = require('puppeteer')

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--unlimited-storage', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366x657']
        });

        const page = await browser.newPage();

        await page.goto(decodeURIComponent(req.query.url), {waitUntil: ['load'], timeout: 30000});

        page.setViewport({
            width: 3600,
            height: 2400
        });        

        const selector = '.tweet[data-tweet-id="' + req.query.id + '"]';
        const padding = typeof req.query.padding !== 'undefined';

        const rect = await page.evaluate((selector, padding) => {
            const element = document.querySelector(selector);
            if (!element)
                return null;

            if(padding === true)
            {
                element.style.width = '1350px';
                element.style.height = '621px';
                element.querySelector('.content:first-child, .clearfix:first-child').style.marginTop = '96px';
            }
            else
            {
                element.style.width = '1350px';
                element.style.height = '525px'
            }

            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector, padding);

        if (!rect)
            throw Error(`Could not find element that matches selector: ${selector}.`);

        buffer = await page.screenshot({
            clip: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            }
        });

        await browser.close();

        res.type('image/png');
        res.send(buffer);
    }
    catch(er)
    {
        console.log(er);
        if(typeof browser !== 'undefined') {
            await browser.close();
        }
        res.send('error');
    }
});

app.listen(port, () => console.log(`Listening on port ${port}!`))
