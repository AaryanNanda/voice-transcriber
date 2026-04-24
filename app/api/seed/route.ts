import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/db/schema";

export async function GET() {
  try {
    // Check if admin already exists
    const existing = await db.select().from(user);
    
    if (existing.length > 0) {
      return NextResponse.json({
        message: "Users already exist in DB",
        users: existing.map(u => ({ id: u.id, name: u.name, email: u.email, username: u.username }))
      });
    }

    // Create admin
    await auth.api.signUpEmail({
      body: {
        name: "Admin",
        email: "admin@burzt.com",
        password: "Admin@Burzt2024",
        username: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      credentials: { username: "admin", password: "Admin@Burzt2024" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}