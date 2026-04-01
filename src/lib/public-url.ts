function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getConfiguredPublicBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim() || "";

  return configuredUrl ? normalizeBaseUrl(configuredUrl) : null;
}

export function buildPublicUrl(path: string, runtimeOrigin?: string | null) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const configuredBaseUrl = getConfiguredPublicBaseUrl();

  if (configuredBaseUrl) {
    return `${configuredBaseUrl}${normalizedPath}`;
  }

  if (runtimeOrigin) {
    return `${normalizeBaseUrl(runtimeOrigin)}${normalizedPath}`;
  }

  return normalizedPath;
}

export function isLocalhostLikeUrl(value: string) {
  try {
    const url = value.startsWith("http") ? new URL(value) : new URL(value, "http://localhost");
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}
