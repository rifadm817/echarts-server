const express = require('express');
const cors = require('cors');
const echarts = require('echarts');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// PNG endpoint (for reference)
app.get('/chart', async (req, res) => {
  try {
    if (!req.query.config) return res.status(400).send("Missing config parameter");
    const configString = decodeURIComponent(req.query.config);
    const option = JSON.parse(configString);
    const width = parseInt(req.query.width, 10) || 800;
    const height = parseInt(req.query.height, 10) || 600;
    
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(width, height);
    const chart = echarts.init(canvas, null, { renderer: 'canvas', width, height });
    chart.setOption(option);
    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating PNG chart:', error);
    res.status(500).send("Error generating PNG chart");
  }
});

// SVG endpoint using Puppeteer for a full browser environment
app.get('/chart-svg', async (req, res) => {
  try {
    if (!req.query.config) return res.status(400).send("Missing config parameter");
    const configString = decodeURIComponent(req.query.config);
    const option = JSON.parse(configString);
    const width = parseInt(req.query.width, 10) || 800;
    const height = parseInt(req.query.height, 10) || 600;

    // Launch Puppeteer with no-sandbox options (common for server deployments)
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // HTML template that loads ECharts and renders the chart using the SVG renderer.
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <script src="https://fastly.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
      </head>
      <body>
        <div id="chart" style="width:${width}px; height:${height}px;"></div>
        <script>
          var chart = echarts.init(document.getElementById('chart'), null, { renderer: 'svg' });
          chart.setOption(${JSON.stringify(option)});
          // Signal that rendering is complete
          window.chartRendered = true;
        </script>
      </body>
      </html>
    `;
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.chartRendered === true, { timeout: 3000 });

    // Extract pure SVG markup from the chart container
    const svg = await page.evaluate(() => {
      const svgEl = document.getElementById('chart').querySelector('svg');
      return svgEl ? svgEl.outerHTML : "";
    });
    await browser.close();
    
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error generating SVG chart with Puppeteer:', error);
    res.status(500).send("Error generating SVG chart");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});