function getTrimmedEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function requireEnv(name: string) {
  const value = getTrimmedEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAppUrl() {
  return requireEnv("APP_URL").replace(/\/+$/, "");
}
