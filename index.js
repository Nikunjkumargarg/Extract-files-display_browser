require("dotenv").config({
  path: "config.env",
});
const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const userDatabase = require("./userDatabase");

const app = express();
const LOG_FOLDER = path.join("C:/Users/nikun/Desktop/logs");

app.use(
  session({
    secret: "integration_zrpl_embrace_changes",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 900000, // 1 minute
    },
  })
);

app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

function requireLogin(req, res, next) {
  if (!req.session.authenticated) {
    return res.redirect("/login");
  }
  next();
}

// Middleware to check session expiration
app.use((req, res, next) => {
  // Check if the session has expired
  if (req.session.cookie && req.session.cookie.expires <= Date.now()) {
    // Session has expired, redirect to login page
    return res.status(401).send("Session expired");
  }
  next();
});

// Serve the main page
app.get("/", requireLogin, (req, res) => {
  fs.readdir(LOG_FOLDER, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory");
    }
    let fileLinks = files
      .map((file) => {
        return `<li><a href="/download/${file}">${file}</a></li>`;
      })
      .join("");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Integration Hub Log Files</title>
          <link rel="stylesheet" href="/styles.css">
          <script>
              function redirectToLogin() {
                  window.location.href = "/login"; // Redirect to the login page
              }

              function startSessionTimeout() {
                  setTimeout(redirectToLogin, 900000); // Redirect after 15 minute (900000 milliseconds)
              }

              window.onload = startSessionTimeout;
          </script>
      </head>
      <body>
          <div class="container">
              <h1>Integration Hub Log Files</h1>
              <div class="file-list">
                  <ul>
                      ${fileLinks}
                  </ul>
              </div>
          </div>
      </body>
      </html>
    `);
  });
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(LOG_FOLDER, filename);
  res.download(filepath);
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const storedPassword = userDatabase.findByUsername(username);
  if (storedPassword && password === storedPassword) {
    req.session.authenticated = true;
    return res.redirect("/");
  }
  res.status(401).send("Unauthorized");
});

const port = 80;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
