import { NextResponse } from "next/server";

const backend = process.env.BACKEND_URL || "http://localhost:3000";

export async function GET() {
  try {
    const res = await fetch(`${backend}/books`, { cache: "no-store" });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
  } catch {
    return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้ กรุณาเปิด Express ที่พอร์ต 3000" }, { status: 502 });
  }
}

export async function POST(request) {
  try {
    const body = await request.text();
    const res = await fetch(`${backend}/books`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    const data = await res.text();
    return new Response(data, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
  } catch {
    return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 });
  }
}
