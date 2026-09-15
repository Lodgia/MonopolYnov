// Serves the OpenAPI spec and a Swagger UI page for it, so the API docs are
// browsable straight from the running server with no extra tooling.
import { CORS_HEADERS } from "./http.ts";

const specPath = new URL("./openapi.yaml", import.meta.url);

export async function serveOpenApiSpec(): Promise<Response> {
  const yaml = await Deno.readTextFile(specPath);
  return new Response(yaml, {
    headers: { "Content-Type": "text/yaml; charset=utf-8", ...CORS_HEADERS },
  });
}

const SWAGGER_UI_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Game server API docs</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.yaml",
        dom_id: "#swagger-ui",
      });
    </script>
  </body>
</html>`;

export function serveDocsPage(): Response {
  return new Response(SWAGGER_UI_HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8", ...CORS_HEADERS },
  });
}
