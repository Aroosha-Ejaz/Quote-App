const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;

// For local development, allow Vite ports.
// For deployment, FRONTEND_URL will be provided by Render.
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

const NOTES_FILE = path.join(__dirname, "notes.txt");

// Create notes.txt if it doesn't exist
if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, "", "utf8");
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

  // CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    FRONTEND_URL
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Browser preflight request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Test backend
  if (
    req.method === "GET" &&
    req.url === "/"
  ) {
    sendJSON(res, 200, {
      success: true,
      message: "Quote App backend is running",
    });

    return;
  }

  // GET notes
  if (
    req.method === "GET" &&
    req.url === "/api/notes"
  ) {
    try {

      const notes = fs
        .readFileSync(NOTES_FILE, "utf8")
        .split("\n")
        .map((note) => note.trim())
        .filter(Boolean);

      sendJSON(res, 200, {
        success: true,
        notes: notes,
      });

    } catch (error) {

      console.error(error);

      sendJSON(res, 500, {
        success: false,
        message: "Could not read notes",
      });
    }

    return;
  }

  // POST note
  if (
    req.method === "POST" &&
    req.url === "/api/notes"
  ) {

    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {

      try {

        const data = JSON.parse(body);

        if (
          !data.note ||
          !data.note.trim()
        ) {

          sendJSON(res, 400, {
            success: false,
            message: "Note cannot be empty",
          });

          return;
        }

        fs.appendFileSync(
          NOTES_FILE,
          data.note.trim() + "\n",
          "utf8"
        );

        sendJSON(res, 201, {
          success: true,
          message: "Note saved successfully",
        });

      } catch (error) {

        console.error(error);

        sendJSON(res, 400, {
          success: false,
          message: "Invalid JSON data",
        });
      }
    });

    return;
  }

  // Route not found
  sendJSON(res, 404, {
    success: false,
    message: "Route not found",
  });
});

// IMPORTANT:
// 0.0.0.0 is required for cloud deployment.
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
});