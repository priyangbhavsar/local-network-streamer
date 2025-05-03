const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Set the base directory for your movie files
const BASE_DIR = 'G:\\movies';

app.get('/{*any}', (req, res) => {
  const urlPath = decodeURIComponent(req.path); // Decoding URL
  const fullPath = path.join(BASE_DIR, '/' + urlPath); // Preventing path escape

  // Check if the full path is within the allowed directory
  if (!fullPath.startsWith(BASE_DIR)) {
    return res.status(403).send('Access denied');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err) return res.status(404).send('Not found');


    if (stats.isDirectory()) {
        // If it's a directory, list the contents
        fs.readdir(fullPath, (err, files) => {
          if (err) return res.status(500).send('Error reading directory');
  
          const fileList = files.map(file => {
            const filePath = path.join(urlPath, file);
            return `<li><a href="${filePath}">${file}</a></li>`;
          }).join('');
  
          const html = `
            <h2>Contents of ${urlPath}</h2>
            <ul>${fileList}</ul>
          `;
          return res.send(html);
        });
    } else if (stats.isFile()) {
        const fileSize = stats.size;
        const range = req.headers.range;

        // If no range is provided, send the entire video
        if (!range) {
        const html = `
            <h2>Playing: ${path.basename(fullPath)}</h2>
            <video width="100%" height="auto" controls autoplay>
            <source src="${urlPath}" type="video/mp4">
            </video>
        `;
        return res.send(html);
    }

    
    

    // Parse the range (start and end byte positions)
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // If start is beyond the file size, return a 416 error (Range Not Satisfiable)
    if (start >= fileSize) {
      return res.status(416).send('Range Not Satisfiable');
    }

    // Calculate the chunk size
    const chunkSize = (end - start) + 1;

    // Create a file stream for the requested range
    const file = fs.createReadStream(fullPath, { start, end });

    // Set the response headers for partial content (206 status code)
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    // Send the response with 206 status (Partial Content)
    res.writeHead(206, head);

    // Pipe the file stream to the response (i.e., send video in chunks)
    file.pipe(res);
    }
  });
});

// Start the server on the specified port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📺 Video server running at http://localhost:${PORT}`);
});
