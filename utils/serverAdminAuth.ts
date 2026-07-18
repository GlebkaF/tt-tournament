function parseBasicAuth(
  authHeader: string
): { username: string; password: string } | null {
  if (!authHeader.startsWith("Basic ")) return null;

  try {
    const credentials = Buffer.from(
      authHeader.slice("Basic ".length).trim(),
      "base64"
    ).toString("utf-8");
    const separator = credentials.indexOf(":");
    if (separator < 0) return null;

    return {
      username: credentials.slice(0, separator),
      password: credentials.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function isAdminAuthorized(req: Request): boolean {
  const credentials = parseBasicAuth(req.headers.get("Authorization") ?? "");

  return (
    !!credentials &&
    credentials.username === process.env.BASIC_AUTH_USERNAME &&
    credentials.password === process.env.BASIC_AUTH_PASSWORD
  );
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
