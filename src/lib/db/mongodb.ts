import { MongoClient, type Db } from "mongodb";

declare global {
  var __proofpassMongoClientPromise: Promise<MongoClient> | undefined;
}

function getDatabaseName(uri: string) {
  const explicitName = process.env.MONGODB_DB?.trim();
  if (explicitName) return explicitName;

  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname.replace(/^\//, "");
    return dbName || "proofpass";
  } catch {
    return "proofpass";
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;

  const clientPromise =
    global.__proofpassMongoClientPromise ??
    new MongoClient(uri, {
      ignoreUndefined: true,
    }).connect();

  global.__proofpassMongoClientPromise = clientPromise;

  const client = await clientPromise;
  return client.db(getDatabaseName(uri));
}
