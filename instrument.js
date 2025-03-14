// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://4eca8821c70f94b26caa948800690cd2@o4507530822418432.ingest.us.sentry.io/4507536310730752",
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.4, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.9,
});