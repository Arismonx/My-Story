# My Story – App Blueprint

> เอกสารพื้นฐานของแอพ อ่านก่อนออกแบบหรือเพิ่มฟีเจอร์ทุกครั้ง และอัพเดตเมื่อสิ่งที่เขียนไว้เปลี่ยน
> อัพเดตล่าสุด: 2026-11-08 · เวอร์ชันแอพ: 0.2.0

## 1. แอพนี้คืออะไร
สมุดบันทึกส่วนตัวสำหรับจดเรื่องราวประจำวัน เปิดได้ทั้งบนคอมพิวเตอร์และมือถือ ข้อมูลอยู่ในเครื่องของผู้ใช้ และ export ออกไปเป็นไฟล์ข้อความได้เสมอ

## 2. ผู้ใช้ & ปัญหาที่แก้
- **ผู้ใช้หลัก:** เจ้าของแอพเอง (ใช้คนเดียว ยังไม่มีระบบบัญชี)
- **ปัญหา:** อยากจดเร็ว ไม่ต้องล็อกอิน ไม่ต้องกลัวข้อมูลหาย (export ได้) และเห็นว่าจดไว้วันไหน

## 3. หลักการออกแบบ (ห้ามละเมิดโดยไม่อัพเดตส่วนนี้)
1. **Local-first:** ใช้งานได้ทันทีแบบไม่มีเน็ตและไม่มี backend
2. **ข้อมูลเป็นของผู้ใช้:** ทุกโน้ตต้อง export เป็น `.md` / `.txt` ได้
3. **Mobile-first:** ทุกหน้าจอต้องใช้นิ้วโป้งกดได้ที่ความกว้าง 360px
4. **Static hosting:** build เป็นไฟล์ static (`output: "export"`) ลง GitHub Pages ได้ ห้ามใช้ Server Actions / Route Handlers แบบ dynamic / cookies

## 4. Tech stack
| ส่วน | ใช้ | หมายเหตุ |
|---|---|---|
| Framework | Next.js 16 (App Router, static export) | อ่าน `node_modules/next/dist/docs/` ก่อน เพราะ API เปลี่ยน |
| UI | React 19 + Tailwind CSS v4 | สีอยู่ใน CSS variables ใน `globals.css` |
| Storage | IndexedDB (`src/lib/db.ts`) | ผ่าน interface `NoteRepository` |
| Mobile | PWA (`manifest.ts` + `public/sw.js`) | |
| Hosting | GitHub Pages ผ่าน Actions | `NEXT_PUBLIC_BASE_PATH=/<repo>` |
| Runtime | Node 22 (`.nvmrc`) | |

## 5. Data model
```ts
Note {
  id: string        // crypto.randomUUID()
  title: string
  content: string   // markdown (แสดงผลด้วยปุ่ม "ดูตัวอย่าง")
  createdAt: string // ISO 8601 วันที่จด
  updatedAt: string // ISO 8601 แก้ไขล่าสุด
}
```
IndexedDB: database `my-story` · store `notes` (keyPath `id`, index `updatedAt`) · `DB_VERSION = 1`
เปลี่ยน schema → เพิ่ม `DB_VERSION` และเขียน migration ใน `onupgradeneeded` ห้ามทำให้โน้ตเก่าหาย

## 6. โครงสร้างโค้ด
```
src/
  app/            layout, page, manifest (server components, static)
  components/     NotesApp (state หลัก), NoteList, NoteEditor, Markdown, ExportMenu, RegisterSW
  hooks/useNotes  CRUD + state, รับ NoteRepository เป็น parameter
  lib/            types, db (IndexedDB), export (md/txt), format (วันที่ไทย)
```
Data flow: `NotesApp → useNotes(repo) → NoteRepository → IndexedDB`

## 7. ฟีเจอร์ที่มีแล้ว
| ฟีเจอร์ | เวอร์ชัน |
|---|---|
| จด/แก้/ลบโน้ต บันทึกอัตโนมัติ | 0.1.0 |
| วันที่จด + แก้ไขล่าสุด, จัดกลุ่มตามวัน | 0.1.0 |
| ค้นหา | 0.1.0 |
| Export .md / .txt (เดี่ยว + ทั้งหมด) | 0.1.0 |
| PWA ใช้ออฟไลน์บนมือถือ | 0.1.0 |
| Markdown preview (ปุ่ม แก้ไข/ดูตัวอย่าง) | 0.2.0 |

## 8. Roadmap (ไอเดียฟีเจอร์ถัดไป)
- [ ] แท็ก / หมวดหมู่ + กรองตามแท็ก
- [ ] ปักหมุดโน้ต
- [ ] Import ไฟล์ `.md` / `.txt` กลับเข้าแอพ
- [ ] Backup/restore เป็น JSON (กันข้อมูลหายตอนล้างเบราว์เซอร์)
- [ ] ปุ่มสลับธีม สว่าง/มืด
- [ ] ปฏิทิน ดูโน้ตตามวัน
- [ ] Sync ข้ามเครื่องด้วย Postgres (Supabase): สร้าง `SupabaseRepo implements NoteRepository` + Auth
- [ ] แนบรูป (เก็บเป็น Blob ใน IndexedDB)

## 9. Decision log
| วันที่ | การตัดสินใจ | เหตุผล |
|---|---|---|
| 2026-11-05 | ใช้ IndexedDB แทน Postgres ในเวอร์ชันแรก | GitHub Pages เป็น static hosting รัน DB/server ไม่ได้ |
| 2026-11-05 | แยก `NoteRepository` interface | เผื่อต่อ Supabase (Postgres) ทีหลังโดยไม่ต้องแก้ UI |
| 2026-11-05 | ทำเป็น PWA แทนแอพ native | ใช้โค้ดชุดเดียว ติดตั้งบนมือถือได้ทันที |
| 2026-11-08 | เขียน Markdown renderer เองใน `components/Markdown.tsx` (render เป็น React element ไม่ใช้ innerHTML) | ไม่เพิ่ม dependency, กัน XSS, `content` เก็บเป็น markdown ล้วน จึงไม่ต้อง migrate |
