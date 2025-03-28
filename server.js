const express = require('express');
const cors = require('cors');
const { createCanvas } = require('canvas');
const echarts = require('echarts');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// PNG endpoint: Renders a chart as a PNG image
app.get('/chart', (req, res) => {
  try {
    if (!req.query.config) {
      return res.status(400).send("Missing config parameter");
    }
    const configString = decodeURIComponent(req.query.config);
    const option = JSON.parse(configString);
    
    const width = parseInt(req.query.width, 10) || 800;
    const height = parseInt(req.query.height, 10) || 600;
    
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

// SVG endpoint: Renders a chart as a pure SVG image (static, no animations)
app.get('/chart-svg', (req, res) => {
  try {
    if (!req.query.config) {
      return res.status(400).send("Missing config parameter");
    }
    const configString = decodeURIComponent(req.query.config);
    const option = JSON.parse(configString);
    
    const width = parseInt(req.query.width, 10) || 800;
    const height = parseInt(req.query.height, 10) || 600;
    
    // Create a virtual DOM for SVG rendering using jsdom
    const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="chart" style="width:${width}px; height:${height}px;"></div></body></html>`, { pretendToBeVisual: true });
    // Set globals so ECharts can find window and document
    global.window = dom.window;
    global.document = dom.window.document;
    
    const chartDiv = dom.window.document.getElementById('chart');
    
    // Initialize ECharts with the SVG renderer
    const chart = echarts.init(chartDiv, null, { renderer: 'svg', width, height });
    chart.setOption(option);
    
    // Extract the pure <svg> markup from the container
    const container = chart.getDom();
    const svgNode = container.querySelector('svg');
    const pureSvg = svgNode ? svgNode.outerHTML : "";
    
    res.set('Content-Type', 'image/svg+xml');
    res.send(pureSvg);
  } catch (error) {
    console.error('Error generating SVG chart:', error);
    res.status(500).send("Error generating SVG chart");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});