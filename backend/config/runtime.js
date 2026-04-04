const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/employeeDB";
const MONGO_URI_PLACEHOLDER = "your_mongodb_connection_string";

const normalizeEnvValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const hasHostedRuntime = () =>
  ["RENDER", "VERCEL", "RAILWAY_ENVIRONMENT", "FLY_APP_NAME"].some(
    (name) => normalizeEnvValue(process.env[name])
  );

export const isProductionLikeRuntime = () =>
  normalizeEnvValue(process.env.NODE_ENV) === "production" || hasHostedRuntime();

export const resolveMongoUri = () => {
  const configuredMongoUri = normalizeEnvValue(process.env.MONGO_URI);

  if (
    configuredMongoUri &&
    !configuredMongoUri.includes(MONGO_URI_PLACEHOLDER)
  ) {
    return {
      mongoUri: configuredMongoUri,
      usingLocalFallback: false,
    };
  }

  if (isProductionLikeRuntime()) {
    throw new Error(
      "MONGO_URI must be configured for the deployed server database. The current value is missing or still using the placeholder."
    );
  }

  return {
    mongoUri: DEFAULT_MONGO_URI,
    usingLocalFallback: true,
  };
};
