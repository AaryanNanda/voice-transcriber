import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transcripts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.userId, session.user.id))
    .orderBy(desc(transcripts.createdAt));

  return NextResponse.json(result);
}