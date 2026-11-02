 "use client";

import { useEffect, useMemo, useRef, useState } from "react";

const blankBook = { title: "", author: "", publishedYear: new Date().getFullYear(), isAvailable: true };

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankBook);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  async function loadBooks() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/books", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ไม่สามารถโหลดรายการหนังสือได้");
      setBooks(Array.isArray(data) ? data : (data.books || []));
    } catch (e) {
      setError(`${e.message} — ตรวจสอบว่า Backend เปิดอยู่ที่ http://localhost:3000`);
    } finally { setLoading(false); }
  }
  useEffect(() => { loadBooks(); }, []);

  const filteredBooks = useMemo(() => books.filter(book => {
    const q = query.trim().toLowerCase();
    const matchesText = !q || [book.title, book.author, String(book.publishedYear), String(book.id)]
      .some(v => String(v ?? "").toLowerCase().includes(q));
    const matchesAvailability = availability === "all" ||
      (availability === "available" ? book.isAvailable === true : book.isAvailable === false);
    return matchesText && matchesAvailability;
  }), [books, query, availability]);

  function openCreate() {
    setEditingId(null); setForm(blankBook); setCoverFile(null); setCoverPreview("");
    setModalOpen(true);
  }
  function openEdit(book) {
    setEditingId(book.id);
    setForm({ title: book.title ?? "", author: book.author ?? "", publishedYear: book.publishedYear ?? "", isAvailable: !!book.isAvailable });
    setCoverFile(null); setCoverPreview("");
    setModalOpen(true);
  }
  function changeFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น"); return; }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }
  async function saveBook(e) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      let coverUrl = "";
      if (coverFile) {
        const fd = new FormData(); fd.append("file", coverFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "อัปโหลดภาพไม่สำเร็จ");
        coverUrl = uploadData.url;
      }
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        publishedYear: Number(form.publishedYear),
        isAvailable: Boolean(form.isAvailable)
      };
      const res = await fetch(editingId ? `/api/books/${editingId}` : "/api/books", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "บันทึกข้อมูลไม่สำเร็จ");
      setModalOpen(false); setCoverFile(null); setCoverPreview("");
      await loadBooks();
      if (coverUrl) alert("บันทึกข้อมูลหนังสือแล้ว และอัปโหลดภาพไว้ที่ " + coverUrl + "\\nหมายเหตุ: API หนังสือเดิมยังไม่มีฟิลด์สำหรับบันทึก URL ภาพปก");
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function deleteBook(book) {
    if (!window.confirm(`ยืนยันลบหนังสือ “${book.title}” หรือไม่?`)) return;
    setError("");
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "ลบหนังสือไม่สำเร็จ");
      }
      await loadBooks();
    } catch (e) { setError(e.message); }
  }

  const availableCount = books.filter(b => b.isAvailable === true).length;
  const unavailableCount = books.filter(b => b.isAvailable === false).length;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">B</span><span>bookspace<span className="brand-dot">.</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><span className="nav-icon">▤</span> Book catalog <span className="nav-count">{books.length}</span></div>
        <div className="side-bottom"><div className="avatar">BC</div><div><strong>Bookspace Library</strong><small>Personal workspace</small></div></div>
      </aside>

      <section className="main-panel">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Book catalog</strong></div><div className="top-right"><span className="status-dot"></span> API workspace <span className="top-avatar">U</span></div></header>
        <div className="content">
          <div className="heading-row">
            <div><div className="eyebrow">YOUR COLLECTION</div><h1>Book catalog <span className="title-emoji">✳</span></h1><p className="subtitle">จัดการคลังหนังสือของคุณได้ในที่เดียว</p></div>
            <button className="primary-btn" onClick={openCreate}><span>＋</span> เพิ่มหนังสือ</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>หนังสือทั้งหมด</span><span className="stat-icon purple">▤</span></div><div className="stat-number">{books.length}</div><div className="stat-foot">รายการในคลัง</div></div>
            <div className="stat-card"><div className="stat-top"><span>พร้อมให้ยืม</span><span className="stat-icon green">✓</span></div><div className="stat-number">{availableCount}</div><div className="stat-foot"><span className="green-text">●</span> Available</div></div>
            <div className="stat-card"><div className="stat-top"><span>ถูกยืมอยู่</span><span className="stat-icon orange">↗</span></div><div className="stat-number">{unavailableCount}</div><div className="stat-foot">Currently unavailable</div></div>
          </div>

          <section className="catalog-card">
            <div className="catalog-header"><div><h2>หนังสือทั้งหมด</h2><p>รายการหนังสือที่อยู่ในระบบ</p></div><span className="results-pill">{filteredBooks.length} รายการ</span></div>
            <div className="toolbar"><div className="search-box"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาชื่อหนังสือ ผู้เขียน หรือ ID..." /></div><select value={availability} onChange={e => setAvailability(e.target.value)} aria-label="กรองสถานะ"><option value="all">ทุกสถานะ</option><option value="available">พร้อมให้ยืม</option><option value="unavailable">ถูกยืมอยู่</option></select><button className="refresh-btn" onClick={loadBooks} title="Refresh">↻</button></div>

            {error && <div className="error-banner"><span>!</span><div>{error}</div><button onClick={() => setError("")}>×</button></div>}
            {loading ? <div className="empty-state"><div className="loader"></div><p>กำลังโหลดข้อมูลหนังสือ...</p></div> :
              filteredBooks.length === 0 ? <div className="empty-state"><div className="empty-icon">▤</div><h3>{books.length ? "ไม่พบหนังสือที่ค้นหา" : "ยังไม่มีหนังสือในคลัง"}</h3><p>{books.length ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "เพิ่มหนังสือเล่มแรกเพื่อเริ่มต้นใช้งาน"}</p>{!books.length && <button className="primary-btn" onClick={openCreate}>＋ เพิ่มหนังสือ</button>}</div> :
              <div className="table-wrap"><table><thead><tr><th>หนังสือ</th><th>ID</th><th>ผู้เขียน</th><th>ปีที่พิมพ์</th><th>สถานะ</th><th className="actions-head">จัดการ</th></tr></thead><tbody>
                {filteredBooks.map((book, index) => <tr key={book.id}>
                  <td><div className="book-cell"><div className={`book-cover cover-${index % 5}`}>{book.title?.slice(0, 1)?.toUpperCase() || "B"}</div><div><strong>{book.title}</strong><small>Book edition</small></div></div></td>
                  <td><span className="id-text">#{book.id}</span></td><td>{book.author}</td><td>{book.publishedYear}</td>
                  <td><span className={`status-badge ${book.isAvailable ? "available" : "unavailable"}`}><span></span>{book.isAvailable ? "พร้อมให้ยืม" : "ถูกยืมอยู่"}</span></td>
                  <td><div className="row-actions"><button className="icon-btn edit" onClick={() => openEdit(book)} title="แก้ไข">✎</button><button className="icon-btn delete" onClick={() => deleteBook(book)} title="ลบ">⌫</button></div></td>
                </tr>)}
              </tbody></table></div>}
            <div className="table-footer"><span>แสดง {filteredBooks.length} จาก {books.length} รายการ</span><span className="api-label"><span className="status-dot"></span> Connected via API</span></div>
          </section>
          <footer>Made for your reading journey <span>✦</span><span className="footer-right">BOOKSPACE · 2026</span></footer>
        </div>
      </section>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <section className="modal">
          <div className="modal-head"><div><div className="eyebrow">{editingId ? "UPDATE RECORD" : "NEW RECORD"}</div><h2>{editingId ? "แก้ไขข้อมูลหนังสือ" : "เพิ่มหนังสือใหม่"}</h2><p>กรอกข้อมูลหนังสือให้ครบถ้วน</p></div><button className="close-btn" onClick={() => setModalOpen(false)}>×</button></div>
          <form onSubmit={saveBook}>
            <label>ชื่อหนังสือ <span>*</span><input required value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="เช่น Clean Code" /></label>
            <label>ชื่อผู้เขียน <span>*</span><input required value={form.author} onChange={e => setForm({...form, author:e.target.value})} placeholder="ชื่อผู้เขียน" /></label>
            <div className="form-row"><label>ปีที่พิมพ์ <span>*</span><input required type="number" min="0" max="9999" value={form.publishedYear} onChange={e => setForm({...form, publishedYear:e.target.value})} /></label><label>สถานะหนังสือ<select value={String(form.isAvailable)} onChange={e => setForm({...form, isAvailable:e.target.value === "true"})}><option value="true">พร้อมให้ยืม</option><option value="false">ถูกยืมอยู่</option></select></label></div>
            <div className="upload-label">ภาพปกหนังสือ <span className="optional">(ไม่บังคับ)</span></div>
            <div className="upload-box" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); changeFile(e.dataTransfer.files?.[0]); }}>
              {coverPreview ? <img src={coverPreview} alt="ตัวอย่างภาพปก" className="cover-preview" /> : <><div className="upload-icon">↑</div><strong>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</strong><small>PNG, JPG, WEBP · อัปโหลดภาพปก</small></>}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => changeFile(e.target.files?.[0])} />
            </div>
            <p className="upload-note">ภาพจะถูกจัดเก็บใน Next.js ส่วนข้อมูลหนังสือบันทึกผ่าน Backend API</p>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>ยกเลิก</button><button className="primary-btn" type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มหนังสือ"}</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
