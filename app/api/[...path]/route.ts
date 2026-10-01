import { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api-base-url";

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const search = request.nextUrl.search || "";
  const target = `${API_BASE_URL}/api/${path.join("/")}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  // The browser's Accept-Encoding often includes "zstd", which Node's fetch
  // (undici) does not auto-decompress. If Cloudflare picks zstd for the
  // upstream response, we'd forward the still-compressed bytes to the browser
  // as if they were plain JSON. Restrict to encodings undici decodes for us.
  headers.set("accept-encoding", "gzip, deflate, br");

  // Individual screens call fetch("/api/...") without attaching a token, so
  // inject it here from the login cookie rather than touching every call site.
  if (!headers.has("authorization")) {
    const token = request.cookies.get("admin_token")?.value;
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    (init as RequestInit & { body: ArrayBuffer; duplex: "half" }).body =
      await request.arrayBuffer();
    (init as RequestInit & { duplex: "half" }).duplex = "half";
  }

  const upstream = await fetch(target, init);

  // `fetch` has already decoded the body, so the upstream's transfer/length/
  // encoding headers no longer describe what we're about to send. Forwarding
  // them (e.g. a stale `content-encoding: br` from Cloudflare) makes the browser
  // try to decompress plain JSON — "Unexpected end of JSON input".
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
