import crypto from "node:crypto";
import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "proofpass";

const missingVars = [
  !mongoUri ? "MONGODB_URI" : null,
  !process.env.TEST_ADMIN_EMAIL ? "TEST_ADMIN_EMAIL" : null,
  !process.env.TEST_ADMIN_PASSWORD ? "TEST_ADMIN_PASSWORD" : null,
  !process.env.TEST_ORGANIZER_EMAIL ? "TEST_ORGANIZER_EMAIL" : null,
  !process.env.TEST_ORGANIZER_PASSWORD ? "TEST_ORGANIZER_PASSWORD" : null,
].filter(Boolean);

if (missingVars.length > 0) {
  console.error(`Missing ${missingVars.join(", ")}.`);
  console.error("Add them to your environment or a local .env file before running this script.");
  process.exit(1);
}

const testUsers = [
  {
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
    profile: {
      full_name: "ProofPass Admin",
      role: "super_admin",
      approval_status: "approved",
      org_name: "ProofPass",
      org_type: "Corporate",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      purpose: "Platform administration and organizer review",
    },
  },
  {
    email: process.env.TEST_ORGANIZER_EMAIL,
    password: process.env.TEST_ORGANIZER_PASSWORD,
    profile: {
      full_name: "Demo Organizer",
      role: "organizer",
      approval_status: "approved",
      org_name: "Demo Events Collective",
      org_type: "Community / User Group",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      phone: "+91 9000000000",
      purpose: "Demo organizer account for local testing",
    },
  },
];

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

async function ensureUser(collections, definition) {
  const email = definition.email.toLowerCase();
  const now = new Date().toISOString();
  const passwordHash = await hash(definition.password, 12);
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
    console.log(`Created auth user: ${definition.email}`);
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
    console.log(`Updated auth user: ${definition.email}`);
  }

  const payload = {
    email,
    auth_user_id: user.id,
    updated_at: now,
    ...definition.profile,
  };

  const existingProfile = await collections.profiles.findOne({ email });
  if (existingProfile) {
    await collections.profiles.updateOne(
      { id: existingProfile.id },
      {
        $set: payload,
      },
    );
    console.log(`Updated profile: ${definition.email}`);
  } else {
    await collections.profiles.insertOne({
      id: crypto.randomUUID(),
      created_at: now,
      ...payload,
    });
    console.log(`Created profile: ${definition.email}`);
  }

  return {
    email: definition.email,
    password: definition.password,
    role: definition.profile.role,
  };
}

async function main() {
  const collections = await getCollections();
  const createdUsers = [];

  try {
    for (const definition of testUsers) {
      createdUsers.push(await ensureUser(collections, definition));
    }
  } finally {
    await collections.client.close();
  }

  console.log("");
  console.log("Test credentials ready:");
  for (const user of createdUsers) {
    console.log(`- ${user.role}: ${user.email} / ${user.password}`);
  }
}

main().catch((error) => {
  console.error("Failed to create test users.");
  console.error(error);
  process.exit(1);
});
