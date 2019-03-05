const express = require('express')
const app = express()
const port = 3000

app.get('/', async (req, res) => {
	try {
		const puppeteer = require('puppeteer')

		const browser = await puppeteer.launch({
			headless: true,
			args: ['--unlimited-storage', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();

		await page.goto(decodeURIComponent(req.query.url), {waitUntil: ['networkidle0', 'load'], timeout: 3000000});

		var doc_type = typeof req.query.filetype === 'undefined' ? 'pdf' : req.query.filetype;
		if(doc_type === 'pdf')
		{
			console.log('Generating PDF..')

			const options = { 
				printBackground: true,
				landscape: typeof req.query.landscape !== 'undefined',
				pageRanges: typeof req.query.pageRanges === 'undefined' ? '' : req.query.pageRanges,
				format: typeof req.query.format === 'undefined' ? 'A4' : req.query.format,
				displayHeaderFooter: false,//typeof req.query.displayHeaderFooter === 'undefined' ? false : true,
				headerTemplate: typeof req.query.headerTemplate === 'undefined' ? req.query.headerTemplate : '',
				footerTemplate: typeof req.query.footerTemplate === 'undefined' ? req.query.footerTemplate : '', 
				scale: typeof req.query.scale === 'undefined' ? 1 : parseFloat(req.query.scale),
				preferCSSPageSize: true
			};

			if(typeof req.query.width !== 'undefined')
			{
				options.width = req.query.width;
			}

			if(typeof req.query.height !== 'undefined')
			{
				options.height = req.query.height;
			}

			if(typeof req.query.margin !== 'undefined')
			{
				options.margin = {
					top: typeof req.query.margin.top === 'undefined' ? '' : req.query.margin.top,
					bottom: typeof req.query.margin.bottom === 'undefined' ? '' : req.query.margin.bottom,
					left: typeof req.query.margin.right === 'undefined' ? '' : req.query.margin.left,
					right: typeof req.query.margin.left === 'undefined' ? '' : req.query.margin.right
				}
			}

			buffer = await page.pdf(options);
			await browser.close();

			console.log('Generated PDF!')

		    res.type('application/pdf');
		    res.send(buffer);
		}
		else
		{
			console.log('Generating PNG...');

			const options = {
				type: 'png',
				omitBackground: true
			};

			if(typeof req.query.fullPage !== 'undefined')
			{
				options.fullPage = true;
			}

			if(typeof req.query.clip !== 'undefined' && typeof req.query.clip.x !== 'undefined' && typeof req.query.clip.y !== 'undefined' && typeof req.query.clip.width !== 'undefined' && typeof req.query.clip.height !== 'undefined')
			{
				options.clip = {
					x: parseFloat(req.query.clip.x),
					y: parseFloat(req.query.clip.y),
					width: parseFloat(req.query.clip.width),
					height: parseFloat(req.query.clip.height)
				};
			}

			if(typeof req.query.script !== 'undefined')
			{
				const text = Buffer.from(decodeURIComponent(req.query.script), 'base64').toString('ascii');
				await page.evaluate((text) => {
					eval(text);
				}, text);
			}

			buffer = await page.screenshot(options);

			res.type('image/png');
			res.send(buffer);
		}
	}
	catch(er) {
		console.log(er)
		res.send('error')
	}
});

app.listen(port, () => console.log(`Listening on port ${port}!`))
