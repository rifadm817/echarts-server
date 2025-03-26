const express = require('express');
const cors = require('cors');
const { createCanvas } = require('canvas');
const echarts = require('echarts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/chart', (req, res) => {
  try {
    if (!req.query.config) {
      return res.status(400).send("Missing config parameter");
    }
    // The 'config' parameter should be a URL-encoded JSON string with your ECharts option.
    const configString = decodeURIComponent(req.query.config);
    const option = JSON.parse(configString);
    
    // Optionally set width and height via query parameters; defaults to 800x600.
    const width = parseInt(req.query.width) || 800;
    const height = parseInt(req.query.height) || 600;
    
    const canvas = createCanvas(width, height);
    const chart = echarts.init(canvas, null, { renderer: 'canvas', width, height });
    chart.setOption(option);
    
    // Convert the rendered chart to PNG and send as response
    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Chart generation error:', error);
    res.status(500).send("Error generating chart");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
