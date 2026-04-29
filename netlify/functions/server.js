import server from "../../dist/server/server.js";

export default async (req, context) => {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["host"] || "localhost";
  const url = new URL(req.url, `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, typeof value === "string" ? value : value.join(", "));
    }
  }

  const webRequest = new Request(url.toString(), {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
  });

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
};
