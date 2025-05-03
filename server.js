const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const BASE_DIR = 'G:\\movies';

app.get('/{*any}', (req, res) => {
  const urlPath = decodeURIComponent(req.path);
  const fullPath = path.join(BASE_DIR, urlPath);

  if (!fullPath.startsWith(BASE_DIR)) {
    return res.status(403).send('Access denied');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err) return res.status(404).send('Not found');

    if (stats.isDirectory()) {
      fs.readdir(fullPath, (err, files) => {
        if (err) return res.status(500).send('Error reading directory');

        const fileDetails = files.map(file => {
          const filePath = path.join(fullPath, file);
          const stat = fs.statSync(filePath);
          return {
            name: file,
            url: path.join(urlPath, file).replace(/\\/g, '/'),
            isDirectory: stat.isDirectory(),
            size: stat.size,
            mtime: stat.mtime
          };
        });

        const fileList = fileDetails.map(file => `
          <tr>
            <td><a href="${file.url}">${file.name}</a></td>
            <td>${file.isDirectory ? 'Folder' : 'File'}</td>
            <td>${file.isDirectory ? '-' : (file.size / (1024 * 1024)).toFixed(2)} MB</td>
            <td>${file.mtime.toLocaleString()}</td>
          </tr>
        `).join('');

        const html = `
          <html>
          <head>
            <title>Directory: ${urlPath}</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 8px; }
              th { cursor: pointer; background: #f4f4f4; }
              input { margin: 10px 0; width: 100%; padding: 8px; }
            </style>
            <script>
              function sortTable(n) {
                const table = document.getElementById("fileTable");
                let rows, switching = true, dir = "asc", switchcount = 0;
                while (switching) {
                  switching = false;
                  rows = table.rows;
                  for (let i = 1; i < (rows.length - 1); i++) {
                    let shouldSwitch = false;
                    const x = rows[i].getElementsByTagName("TD")[n];
                    const y = rows[i + 1].getElementsByTagName("TD")[n];
                    const xVal = x.textContent || x.innerText;
                    const yVal = y.textContent || y.innerText;
                    if (dir === "asc" && xVal.toLowerCase() > yVal.toLowerCase()) {
                      shouldSwitch = true;
                      break;
                    }
                    if (dir === "desc" && xVal.toLowerCase() < yVal.toLowerCase()) {
                      shouldSwitch = true;
                      break;
                    }
                  }
                  if (shouldSwitch) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    switchcount++;
                  } else if (switchcount === 0 && dir === "asc") {
                    dir = "desc";
                    switching = true;
                  }
                }
              }

              function filterTable() {
                const input = document.getElementById("searchBox");
                const filter = input.value.toLowerCase();
                const table = document.getElementById("fileTable");
                const trs = table.getElementsByTagName("tr");
                for (let i = 1; i < trs.length; i++) {
                  const rowText = trs[i].textContent.toLowerCase();
                  trs[i].style.display = rowText.includes(filter) ? "" : "none";
                }
              }
            </script>
          </head>
          <body>
            <h2>Contents of ${urlPath}</h2>
            <input type="text" id="searchBox" placeholder="Search..." onkeyup="filterTable()" />
            <table id="fileTable">
              <thead>
                <tr>
                  <th onclick="sortTable(0)">Name</th>
                  <th onclick="sortTable(1)">Type</th>
                  <th onclick="sortTable(2)">Size</th>
                  <th onclick="sortTable(3)">Modified</th>
                </tr>
              </thead>
              <tbody>
                ${fileList}
              </tbody>
            </table>
          </body>
          </html>
        `;
        return res.send(html);
      });

    } else if (stats.isFile()) {
      const fileSize = stats.size;
      const range = req.headers.range;

      if (!range) {
        const baseName = path.basename(fullPath, path.extname(fullPath));
        const vttPath = path.join(path.dirname(fullPath), baseName + '.vtt');
        const hasSubtitles = fs.existsSync(vttPath);

        const html = `
        <html>
        <head>
          <title>Playing: ${path.basename(fullPath)}</title>
        </head>
        <body>
          <h2>Playing: ${path.basename(fullPath)}</h2>
          <video width="100%" height="auto" controls autoplay>
            <source src="${urlPath}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </body>
        </html>
      `;
        return res.send(html);
      }

      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        return res.status(416).send('Range Not Satisfiable');
      }

      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(fullPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📺 Video server running at http://localhost:${PORT}`);
});
