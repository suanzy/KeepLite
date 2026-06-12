# KeepLite

A lightweight, self-hosted replacement for Google Keep. Designed for data sovereignty, low memory environments, and real-time collaboration.

## Features
* **Real-time Collaboration:** Edit a single note simultaneously with other users via WebSockets.
* **Drag-and-Drop Checkboxes:** Reorganize tasks dynamically using SortableJS.
* **Local Image Support:** Paste or upload images directly into notes.
* **100% Local Data:** Text is stored in a single SQLite file; images are stored in standard local directories. 

## Prerequisites
* Node.js (v18 or higher)
* Git

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suanzy/KeepLite.git
   cd open-keep-clone
   ```
2. **Install dependencies:**
	```bash
	npm install
	```

3. **Start the application:**
	For production:
	```bash
	node server.js
	```
	
	For active development (auto-restarts)
	```bash
	npm run dev
	```

4. **Access the application:**
Open your browser and navigate to `http://localhost:3000`.

## Data Backup Strategy
All user data is strictly confined to two directories:
1. `data/database.sqlite` (Notes and text)
2. `public/uploads/` (Images)
To back up your notes securely, you only need to sync the data/ and public/uploads/ directories using your preferred CLI synchronization tool.

## Mobile Quick Capture (Progressive Web App)
To mimic native widget functionality on a mobile device:
1. Navigate to the application URL on your mobile browser.
2. Select "Add to Home Screen" from the browser menu.
3. The application will function as a standalone, full-screen app for immediate quick capture.
