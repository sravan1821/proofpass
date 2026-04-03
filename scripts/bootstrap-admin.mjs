import crypto from "node:crypto";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "proofpass";

const missingVars = [
  !mongoUri ? "MONGODB_URI" : null,
  !process.env.BOOTSTRAP_ADMIN_EMAIL ? "BOOTSTRAP_ADMIN_EMAIL" : null,
  !process.env.BOOTSTRAP_ADMIN_PASSWORD ? "BOOTSTRAP_ADMIN_PASSWORD" : null,
].filter(Boolean);

if (missingVars.length > 0) {
  console.error(`Missing ${missingVars.join(", ")}.`);
  console.error("Add them to your environment or a local .env file before running this script.");
  process.exit(1);
}

async function getCollections() {
  const client = await new MongoClient(mongoUri, { ignoreUndefined: true }).connect();
  const db = client.db(databaseName);

  await db.collection("auth_users").createIndex({ email: 1 }, { unique: true });
  await db.collection("profiles").createIndex({ email: 1 }, { unique: true });
  await db.collection("profiles").createIndex({ auth_user_id: 1 }, { unique: true, sparse: true });

  return {
    client,
    authUsers: db.collection("auth_users"),
    profiles: db.collection("profiles"),
  };
}

async function ensureAdmin(collections) {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const fullName = process.env.BOOTSTRAP_ADMIN_FULL_NAME || "ProofPass Admin";
  const now = new Date().toISOString();
  const passwordHash = await hash(password, 12);

  let user = await collections.authUsers.findOne({ email });

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    };

    await collections.authUsers.insertOne(user);
    console.log(`Created admin auth user: ${email}`);
  } else {
    await collections.authUsers.updateOne(
      { id: user.id },
      {
        $set: {
          password_hash: passwordHash,
          updated_at: now,
        },
      },
    );
    console.log(`Updated admin auth user: ${email}`);
  }

  const profilePayload = {
    email,
    auth_user_id: user.id,
    full_name: fullName,
    role: "super_admin",
    approval_status: "approved",
    org_name: "ProofPass",
    org_type: "Corporate",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    purpose: "Platform administration and organizer review",
    updated_at: now,
  };

  const existingProfile = await collections.profiles.findOne({ email });
  if (existingProfile) {
    await collections.profiles.updateOne(
      { id: existingProfile.id },
      {
        $set: profilePayload,
      },
    );
    console.log(`Updated admin profile: ${email}`);
  } else {
    await collections.profiles.insertOne({
      id: crypto.randomUUID(),
      created_at: now,
      ...profilePayload,
    });
    console.log(`Created admin profile: ${email}`);
  }
}

async function main() {
  const collections = await getCollections();

  try {
    await ensureAdmin(collections);
  } finally {
    await collections.client.close();
  }

  console.log("Admin bootstrap complete.");
  console.log("Remove BOOTSTRAP_ADMIN_PASSWORD from the deployment environment after first use.");
}

main().catch((error) => {
  console.error("Failed to bootstrap admin.");
  console.error(error);
  process.exit(1);
});
