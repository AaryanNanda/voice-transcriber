import postgres from "postgres";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL);

async function createAdminUser() {
  try {
    console.log("Checking for existing admin user...");

    // Check if admin already exists
    const existing = await client`
      SELECT id, name, email, username FROM "user"
      WHERE username = 'admin'
    `;

    if (existing.length > 0) {
      console.log("✅ Admin user already exists:", existing[0]);
      return;
    }

    console.log("Creating admin user...");

    // Create user
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await client`
      INSERT INTO "user" (id, name, email, "email_verified", username, "display_username", "created_at", "updated_at")
      VALUES (${userId}, 'Admin', 'admin@burzt.com', true, 'admin', 'admin', ${now}, ${now})
    `;

    // Create account with password
    await client`
      INSERT INTO account (id, "account_id", "provider_id", "user_id", password, "created_at", "updated_at")
      VALUES (${crypto.randomUUID()}, 'admin', 'credential', ${userId}, 'Admin@Burzt2024', ${now}, ${now})
    `;

    console.log("✅ Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: Admin@Burzt2024");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createAdminUser();