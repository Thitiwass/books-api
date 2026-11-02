import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "อนุญาตเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "ไฟล์ต้องมีขนาดไม่เกิน 5 MB" }, { status: 400 });
    }
    const ext = (path.extname(file.name).toLowerCase() || ".png").replace(/[^.a-z0-9]/g, "");
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ message: "อัปโหลดสำเร็จ", url: `/uploads/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "เกิดข้อผิดพลาดระหว่างอัปโหลดไฟล์" }, { status: 500 });
  }
}
