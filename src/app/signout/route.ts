import { NextResponse } from "next/server";
import { signOut } from "~/server/auth";
import { redirect } from "next/navigation";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.json({ success: true });
}

export async function GET() {
  redirect("/signin");
}
