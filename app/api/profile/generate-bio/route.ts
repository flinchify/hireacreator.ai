import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

function generateBios(profile: {
  name: string;
  category: string | null;
  location: string | null;
  services: string[];
  socials: string[];
}) {
  const { name, category, location, services, socials } = profile;
  const firstName = name.split(" ")[0];
  const categoryLabel = category || "creative";
  const locationStr = location ? ` based in ${location}` : "";
  const serviceList = services.length > 0 ? services.slice(0, 3) : ["creative projects"];
  const socialCount = socials.length;

  const serviceStr =
    serviceList.length === 1
      ? serviceList[0]
      : serviceList.length === 2
      ? `${serviceList[0]} and ${serviceList[1]}`
      : `${serviceList.slice(0, -1).join(", ")}, and ${serviceList[serviceList.length - 1]}`;

  // Professional
  const professional = `${name} is a ${categoryLabel}${locationStr}, specialising in ${serviceStr}. With a focus on quality and clear communication, ${firstName} delivers work that drives real results for brands and businesses.${socialCount > 0 ? ` Active across ${socialCount} platform${socialCount > 1 ? "s" : ""}, ${firstName} brings both creative expertise and an engaged audience to every collaboration.` : ""}`;

  // Friendly
  const friendly = `Hey, I'm ${firstName}! I'm a ${categoryLabel}${locationStr} who loves bringing creative ideas to life. Whether it's ${serviceStr}, I'm all about making the process fun and the results amazing.${socialCount > 0 ? ` You can find me across ${socialCount} social platform${socialCount > 1 ? "s" : ""} where I share my work and connect with awesome people.` : ""} Let's create something great together!`;

  // Creative
  const creative = `${serviceStr.charAt(0).toUpperCase() + serviceStr.slice(1)} — but make it ${firstName}. As a ${categoryLabel}${locationStr}, I turn briefs into bold ideas and ideas into scroll-stopping content. Every project is a chance to push boundaries and tell stories that stick.${socialCount > 0 ? ` Catch the behind-the-scenes across my ${socialCount} channel${socialCount > 1 ? "s" : ""}.` : ""}`;

  return [
    { label: "Professional", bio: professional },
    { label: "Friendly", bio: friendly },
    { label: "Creative", bio: creative },
  ];
}

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const [services, socials] = await Promise.all([
    sql`SELECT title FROM services WHERE user_id = ${user.id} AND is_active = TRUE ORDER BY price DESC LIMIT 5`,
    sql`SELECT platform FROM social_connections WHERE user_id = ${user.id}`,
  ]);

  const bios = generateBios({
    name: String(user.full_name || "Creator"),
    category: user.category as string | null,
    location: user.location as string | null,
    services: services.map((s) => String(s.title)),
    socials: socials.map((s) => String(s.platform)),
  });

  return NextResponse.json({ bios });
}
