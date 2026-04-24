import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Force delete the existing admin to reset the password hash
    // This ensures the password moves to the correct table/column
    await db.delete(user).where(eq(user.email, "admin@burzt.com"));

    // 2. Create the fresh admin account
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
      message: "Admin account RE-CREATED successfully!",
      credentials: { 
        email: "admin@burzt.com", 
        password: "Admin@Burzt2024" 
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Seed failed",
      error: error.message
    }, { status: 500 });
  }
}