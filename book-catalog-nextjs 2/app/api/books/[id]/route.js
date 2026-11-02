import { NextResponse } from "next/server";

const backend = process.env.BACKEND_URL || "http://localhost:3000";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const res = await fetch(`${backend}/books/${id}`, { cache: "no-store" });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
  } catch { return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 }); }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const body = await request.text();
    const res = await fetch(`${backend}/books/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    const data = await res.text();
    return new Response(data, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
  } catch { return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 }); }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  try {
    const res = await fetch(`${backend}/books/${id}`, { method: "DELETE" });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
  } catch { return NextResponse.json({ message: "เชื่อมต่อ Backend ไม่ได้" }, { status: 502 }); }
}
