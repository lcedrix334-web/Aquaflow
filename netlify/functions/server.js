import server from "./server-dist/server.js";

export default async (req, context) => {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"] || "localhost";
  const url = new URL(req.url, protocol + "://" + host);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, typeof value === "string" ? value : value.join(", "));
    }
  }

  const init = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  const webRequest = new Request(url.toString(), init);
  const response = await server.fetch(webRequest);

  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const config = {
  path: "/*",
  included_files: ["server-dist/**"],
};
