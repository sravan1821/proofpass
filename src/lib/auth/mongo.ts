import { randomUUID } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { type Filter, type OptionalId } from "mongodb";
import { getMongoDb } from "@/lib/db/mongodb";

type AuthUser = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

type PasswordResetToken = {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

let indexesPromise: Promise<void> | null = null;
let bootstrapAdminPromise: Promise<void> | null = null;

async function ensureIndexes() {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      const db = await getMongoDb();
      if (!db) return;

      await db.collection<AuthUser>("auth_users").createIndex({ email: 1 }, { unique: true });
      await db.collection("profiles").createIndex({ email: 1 }, { unique: true });
      await db.collection("profiles").createIndex({ auth_user_id: 1 }, { unique: true, sparse: true });
      await db.collection<PasswordResetToken>("password_reset_tokens").createIndex({ token: 1 }, { unique: true });
      await db.collection<PasswordResetToken>("password_reset_tokens").createIndex({ expires_at: 1 });
    })();
  }

  await indexesPromise;
}

export async function ensureBootstrapAdmin() {
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();

  if (!bootstrapEmail || !bootstrapPassword) {
    return;
  }

  if (!bootstrapAdminPromise) {
    bootstrapAdminPromise = (async () => {
      await ensureIndexes();
      const db = await getMongoDb();
      if (!db) return;

      const authUsers = db.collection<AuthUser>("auth_users");
      const profiles = db.collection("profiles");
      const now = new Date().toISOString();
      const passwordHash = await hash(bootstrapPassword, 12);

      let user = await authUsers.findOne({ email: bootstrapEmail });
      let authUserId: string;

      if (!user) {
        const newUser: OptionalId<AuthUser> = {
          id: randomUUID(),
          email: bootstrapEmail,
          password_hash: passwordHash,
          created_at: now,
          updated_at: now,
        };

        await authUsers.insertOne(newUser);
        authUserId = newUser.id;
      } else {
        await authUsers.updateOne(
          { id: user.id },
          {
            $set: {
              password_hash: passwordHash,
              updated_at: now,
            },
          },
        );
        authUserId = user.id;
      }

      const profilePayload = {
        auth_user_id: authUserId,
        email: bootstrapEmail,
        full_name: process.env.BOOTSTRAP_ADMIN_FULL_NAME?.trim() || "ProofPass Admin",
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

      const existingProfile = await profiles.findOne({
        $or: [{ auth_user_id: authUserId }, { email: bootstrapEmail }],
      });

      if (existingProfile) {
        await profiles.updateOne(
          { id: existingProfile.id },
          {
            $set: profilePayload,
          },
        );
      } else {
        await profiles.insertOne({
          id: randomUUID(),
          created_at: now,
          ...profilePayload,
        });
      }
    })();
  }

  await bootstrapAdminPromise;
}

export async function findAuthUserByEmail(email: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<AuthUser>("auth_users").findOne({
    email: email.toLowerCase(),
  });
}

export async function findAuthUserById(id: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<AuthUser>("auth_users").findOne({ id });
}

export async function verifyPassword(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail === process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()) {
    await ensureBootstrapAdmin();
  }

  const user = await findAuthUserByEmail(normalizedEmail);
  if (!user) return null;

  const matches = await compare(password, user.password_hash);
  return matches ? user : null;
}

export async function createAuthUser(email: string, password: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return { user: null, error: "Service unavailable." };

  const normalizedEmail = email.toLowerCase();
  const existing = await db.collection<AuthUser>("auth_users").findOne({ email: normalizedEmail });
  if (existing) {
    return { user: null, error: "An account with this email already exists." };
  }

  const now = new Date().toISOString();
  const user: OptionalId<AuthUser> = {
    id: randomUUID(),
    email: normalizedEmail,
    password_hash: await hash(password, 12),
    created_at: now,
    updated_at: now,
  };

  await db.collection<AuthUser>("auth_users").insertOne(user);
  return { user: user as AuthUser, error: null };
}

export async function updateAuthUserPassword(userId: string, password: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return { error: "Service unavailable." };

  await db.collection<AuthUser>("auth_users").updateOne(
    { id: userId },
    {
      $set: {
        password_hash: await hash(password, 12),
        updated_at: new Date().toISOString(),
      },
    },
  );

  return { error: null };
}

export async function findProfile(filter: Filter<Record<string, unknown>>) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection("profiles").findOne(filter);
}

export async function insertProfile(profile: Record<string, unknown>) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return { error: "Service unavailable." };

  const payload = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ...profile,
  };

  await db.collection("profiles").insertOne(payload);
  return { error: null };
}

export async function createPasswordResetToken(email: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return { resetUrl: null, error: "Service unavailable." };

  const user = await findAuthUserByEmail(email);
  if (!user) {
    return { resetUrl: null, error: null };
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

  await db.collection<PasswordResetToken>("password_reset_tokens").insertOne({
    id: randomUUID(),
    token,
    user_id: user.id,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });

  return {
    resetUrl: `/forgot-password?token=${token}`,
    error: null,
  };
}

export async function consumePasswordResetToken(token: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  if (!db) return { userId: null, error: "Service unavailable." };

  const now = new Date().toISOString();
  const record = await db.collection<PasswordResetToken>("password_reset_tokens").findOne({
    token,
  });

  if (!record || record.expires_at < now) {
    return { userId: null, error: "This reset link is invalid or has expired." };
  }

  await db.collection<PasswordResetToken>("password_reset_tokens").deleteOne({ id: record.id });
  return { userId: record.user_id, error: null };
}
