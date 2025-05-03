# 🖥️ Intranet Movie Stream

A super lightweight Node.js-based intranet movie streaming app built to stream videos from your PC to any device connected to the same Wi-Fi network — like your Smart TV, phone, or tablet — with no extra software or hardware.

## 🎯 Why?

Screen sharing doesn't offer good frame rates or reliability when watching movies. I needed something simple, fast, and effective. So I built this.

## ⚙️ Features

* Streams video files (MP4, MKV, etc.) directly from a folder.
* Auto directory listing with:
    * File size
    * Last modified time
    * File type
    * Search and sort functionality.
* Works on your local Wi-Fi — no internet required.

## 🛠️ Installation

### 1. Install Node.js

If you don’t have Node.js installed:

* Go to [https://nodejs.org](https://nodejs.org)
* Download the LTS version for your OS
* Install it using the setup wizard

To verify installation, open your terminal or command prompt and run:

```bash
node -v
npm -v
2. Clone this Repository
Bash

git clone [https://github.com/yourusername/intranet-movie-stream.git](https://github.com/yourusername/intranet-movie-stream.git)
cd intranet-movie-stream
3. Install Dependencies
Bash

npm install
4. Set the Movie Directory
In the server.js file, find this line:

JavaScript

const BASE_DIR = 'G:\\movies';
Change 'G:\\movies' to the folder path where your movies are stored. Use double backslashes \\ on Windows or regular forward slashes / on macOS/Linux.

5. Run the Server
Bash

node server.js
You’ll see:

Bash

📺 Video server running at http://localhost:3000
📺 Watch on Smart TV
Make sure your Smart TV is connected to the same Wi-Fi network as your computer.

On your TV's browser, type your computer's IP address followed by :3000.

For example:

[http://192.168.1.100:3000](http://192.168.1.100:3000)
You can get your local IP using ipconfig (Windows) or ifconfig / ip a (Linux/macOS).

Browse and play!

🚀 Lightweight by Design
No database, no backend frameworks — just raw Node.js and Express. Loads instantly. Serves what you need.

📬 Contribute
Want to add features like:

Resume playback
Internal subtitle extraction
Chromecast support?
Feel free to fork, PR, or open an issue. Let’s build something cool together.

👉 GitHub Repo: https://github.com/yourusername/intranet-movie-stream

🏷️ Tags
nodejs • local-streaming • smart-tv • intranet-app • lightweight-media-server
