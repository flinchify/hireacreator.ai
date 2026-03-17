import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.slug FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string; // "avatar" or "cover"

  if (!file) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  // Validate file type
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "invalid_type", message: "Only JPEG, PNG, WebP, and GIF images are allowed." }, { status: 400 });
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large", message: "Maximum file size is 5MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${type}/${user.id}-${Date.now()}.${ext}`;

  try {
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Update user profile
    const sql2 = getDb();
    if (type === "avatar") {
      await sql2`UPDATE users SET avatar_url = ${blob.url}, updated_at = NOW() WHERE id = ${user.id}`;
    } else if (type === "cover") {
      await sql2`UPDATE users SET cover_url = ${blob.url}, updated_at = NOW() WHERE id = ${user.id}`;
    }

    return NextResponse.json({ url: blob.url });
  } catch (err: any) {
    console.error("Upload error:", err);
    if (err.message?.includes("BLOB_READ_WRITE_TOKEN") || err.message?.includes("No token")) {
      return NextResponse.json({ error: "blob_not_configured", message: "Image storage not configured. Go to Vercel Dashboard > Storage > Create Blob Store and add the BLOB_READ_WRITE_TOKEN env var." }, { status: 500 });
    }
    return NextResponse.json({ error: "upload_failed", message: err.message || "Upload failed" }, { status: 500 });
  }
}
