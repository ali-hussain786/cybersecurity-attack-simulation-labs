const http = require("http");

const options = {
  hostname: "127.0.0.1",
  port: process.env.PORT || 5000,
  path: "/api/health",
  method: "GET",
  timeout: 3000,
};

const request = http.request(options, (response) => {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    process.exit(0);
  }

  process.exit(1);
});

request.on("error", () => {
  process.exit(1);
});

request.on("timeout", () => {
  request.destroy();
  process.exit(1);
});

request.end();
