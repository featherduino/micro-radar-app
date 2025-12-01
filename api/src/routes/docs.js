const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");

const openApiSpec = {
  openapi: "3.0.1",
  info: {
    title: "Macro Radar API",
    version: "1.0.0",
    description:
      "REST API powering Macro Radar dashboard. All endpoints are prefixed with `/api` and return JSON unless stated otherwise.",
  },
  servers: [{ url: "/api" }],
  tags: [
    { name: "System", description: "Health and operational endpoints" },
    { name: "Data", description: "Market data endpoints backed by Postgres" },
    { name: "NSE", description: "Live NSE quotes and symbol helpers" },
    { name: "Reports", description: "LLM-generated market reports" },
    { name: "Integrations", description: "Third-party pass-throughs" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description: "Verifies database connectivity and returns the current timestamp.",
        responses: {
          200: {
            description: "Database reachable",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          500: { description: "Database unreachable" },
        },
      },
    },
    "/dates": {
      get: {
        tags: ["Data"],
        summary: "Available dates",
        description: "Returns up to 30 distinct `as_of_date` values (latest first).",
        responses: {
          200: {
            description: "Array of dates",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/DateItem" },
                },
              },
            },
          },
        },
      },
    },
    "/overview": {
      get: {
        tags: ["Data"],
        summary: "Sector overview",
        description: "Sector-level rollups for a given date.",
        parameters: [
          {
            in: "query",
            name: "date",
            required: true,
            schema: { type: "string", format: "date" },
            description: "Trading date (YYYY-MM-DD)",
          },
        ],
        responses: {
          200: {
            description: "Array of sector rows",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/OverviewRow" },
                },
              },
            },
          },
          400: { description: "Missing date" },
        },
      },
    },
    "/heatmap": {
      get: {
        tags: ["Data"],
        summary: "Sector heatmap metrics",
        description: "Returns heatmap metrics for a given date.",
        parameters: [
          {
            in: "query",
            name: "date",
            required: true,
            schema: { type: "string", format: "date" },
            description: "Trading date (YYYY-MM-DD)",
          },
        ],
        responses: {
          200: {
            description: "Array of heatmap rows",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HeatmapRow" },
                },
              },
            },
          },
          400: { description: "Missing date" },
        },
      },
    },
    "/top-symbols": {
      get: {
        tags: ["Data"],
        summary: "Top 25 symbols",
        description: "Ranked symbols for a given date ordered by score.",
        parameters: [
          {
            in: "query",
            name: "date",
            required: true,
            schema: { type: "string", format: "date" },
            description: "Trading date (YYYY-MM-DD)",
          },
        ],
        responses: {
          200: {
            description: "Array of symbols",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TopSymbol" },
                },
              },
            },
          },
          400: { description: "Missing date" },
        },
      },
    },
    "/nseequity": {
      get: {
        tags: ["NSE"],
        summary: "Symbols list",
        description: "List of distinct symbols currently present in top_symbols.",
        responses: {
          200: {
            description: "Array of symbols",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Symbol" },
                },
              },
            },
          },
        },
      },
    },
    "/nse/quote": {
      get: {
        tags: ["NSE"],
        summary: "Live NSE quote",
        description:
          "Fetches live quote data for one or more NSE symbols via stock-nse-india. Returns an object for a single symbol or an array for multiple.",
        parameters: [
          {
            in: "query",
            name: "symbol",
            schema: { type: "string" },
            description: "Single NSE symbol (alternative to symbols)",
          },
          {
            in: "query",
            name: "symbols",
            schema: { type: "string" },
            description: "Comma-separated list of NSE symbols",
          },
        ],
        responses: {
          200: {
            description: "Quote data",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/Quote" },
                    {
                      type: "array",
                      items: { $ref: "#/components/schemas/Quote" },
                    },
                  ],
                },
              },
            },
          },
          400: { description: "Missing symbol(s)" },
        },
      },
    },
    "/reports": {
      get: {
        tags: ["Reports"],
        summary: "Fetch market reports",
        description:
          "Returns the latest 15 reports by default. Provide a date to fetch a specific report.",
        parameters: [
          {
            in: "query",
            name: "date",
            schema: { type: "string", format: "date" },
            description: "Report date (YYYY-MM-DD)",
          },
        ],
        responses: {
          200: {
            description: "Array of reports",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Report" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Reports"],
        summary: "Generate report",
        description:
          "Creates or returns a cached HTML market report for the given date using OpenAI.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["date"],
                properties: {
                  date: { type: "string", format: "date", description: "Report date" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Generated or existing report",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Report" },
              },
            },
          },
          400: { description: "Missing date" },
          500: { description: "Report generation failed" },
        },
      },
    },
    "/n8n-chat": {
      get: {
        tags: ["Integrations"],
        summary: "Proxy to n8n webhook (GET)",
        description: "Pass-through to `N8N_CHAT_WEBHOOK_URL`. Forwards query/body as-is.",
        responses: {
          200: { description: "Upstream response (JSON or binary)" },
          500: { description: "Proxy error" },
        },
      },
      post: {
        tags: ["Integrations"],
        summary: "Proxy to n8n webhook (POST)",
        description: "Pass-through to `N8N_CHAT_WEBHOOK_URL`. Forwards query/body as-is.",
        responses: {
          200: { description: "Upstream response (JSON or binary)" },
          500: { description: "Proxy error" },
        },
      },
      put: {
        tags: ["Integrations"],
        summary: "Proxy to n8n webhook (PUT)",
        description: "Pass-through to `N8N_CHAT_WEBHOOK_URL`. Forwards query/body as-is.",
        responses: {
          200: { description: "Upstream response (JSON or binary)" },
          500: { description: "Proxy error" },
        },
      },
      patch: {
        tags: ["Integrations"],
        summary: "Proxy to n8n webhook (PATCH)",
        description: "Pass-through to `N8N_CHAT_WEBHOOK_URL`. Forwards query/body as-is.",
        responses: {
          200: { description: "Upstream response (JSON or binary)" },
          500: { description: "Proxy error" },
        },
      },
      delete: {
        tags: ["Integrations"],
        summary: "Proxy to n8n webhook (DELETE)",
        description: "Pass-through to `N8N_CHAT_WEBHOOK_URL`. Forwards query/body as-is.",
        responses: {
          200: { description: "Upstream response (JSON or binary)" },
          500: { description: "Proxy error" },
        },
      },
    },
  },
  components: {
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          ok: { type: "boolean", example: true },
          now: { type: "string", format: "date-time", example: "2024-06-12T10:45:10.123Z" },
        },
      },
      DateItem: {
        type: "object",
        properties: {
          as_of_date: { type: "string", format: "date", example: "2024-06-12" },
        },
      },
      OverviewRow: {
        type: "object",
        properties: {
          sector_norm: { type: "string", example: "FINANCIALS" },
          bullish_score: { type: "number", example: 0.72 },
          bearish_score: { type: "number", example: 0.18 },
          avg_change_pct: { type: "number", example: 0.9 },
          avg_volspike: { type: "number", example: 1.1 },
        },
      },
      HeatmapRow: {
        type: "object",
        properties: {
          sector_norm: { type: "string", example: "ENERGY" },
          score: { type: "number", example: 0.64 },
          rsi: { type: "number", example: 58 },
          change_pct: { type: "number", example: 1.2 },
          volspike: { type: "number", example: 0.8 },
        },
      },
      TopSymbol: {
        type: "object",
        properties: {
          sector_norm: { type: "string", example: "TECH" },
          symbol: { type: "string", example: "INFY" },
          sentiment: { type: "string", example: "bullish" },
          score: { type: "number", example: 0.91 },
          change_pct: { type: "number", example: 1.7 },
          volspike: { type: "number", example: 1.3 },
          rsi: { type: "number", example: 62 },
        },
      },
      Symbol: {
        type: "object",
        properties: {
          symbol: { type: "string", example: "RELIANCE" },
        },
      },
      Quote: {
        type: "object",
        properties: {
          symbol: { type: "string", example: "RELIANCE" },
          companyName: { type: "string", example: "Reliance Industries Limited" },
          industry: { type: "string", nullable: true, example: "Refining & Marketing" },
          sector: { type: "string", nullable: true, example: "ENERGY" },
          macro: { type: "string", nullable: true, example: "Commodities" },
          lastPrice: { type: "number", nullable: true, example: 2901.25 },
          change: { type: "number", nullable: true, example: 23.05 },
          pChange: { type: "number", nullable: true, example: 0.8 },
          open: { type: "number", nullable: true, example: 2875.0 },
          dayHigh: { type: "number", nullable: true, example: 2915.0 },
          dayLow: { type: "number", nullable: true, example: 2868.4 },
          prevClose: { type: "number", nullable: true, example: 2878.2 },
          volume: { type: "number", nullable: true, example: 3540021 },
          lastUpdateTime: { type: "string", nullable: true, example: "12-Jun-2024 15:29:59" },
          weekHigh: { type: "number", nullable: true, example: 2968.0 },
          weekLow: { type: "number", nullable: true, example: 2305.2 },
          peRatio: { type: "number", nullable: true, example: 27.1 },
          sectorPe: { type: "number", nullable: true, example: 23.4 },
        },
      },
      Report: {
        type: "object",
        properties: {
          id: { type: "integer", example: 42 },
          report_date: { type: "string", format: "date", example: "2024-06-12" },
          comparison_date: { type: "string", format: "date", example: "2024-06-11" },
          html: { type: "string", description: "Full HTML report" },
          metadata: { type: "object", description: "Input data used to generate the report" },
          model: { type: "string", example: "gpt-4o-mini" },
          created_at: { type: "string", format: "date-time", example: "2024-06-12T11:00:00Z" },
        },
      },
    },
  },
};

router.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    explorer: true,
    customSiteTitle: "Macro Radar API Docs",
    customJs: [],
  })
);
router.get("/docs.json", (req, res) => res.json(openApiSpec));

module.exports = router;
