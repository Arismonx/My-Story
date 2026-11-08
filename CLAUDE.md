@AGENTS.md

# My Story

แอพจดบันทึกแบบ local-first (Next.js static export → GitHub Pages, ข้อมูลอยู่ใน IndexedDB, เป็น PWA ใช้บนมือถือได้)

**อ่าน [docs/BLUEPRINT.md](docs/BLUEPRINT.md) ก่อนออกแบบหรือแก้โค้ด** ไฟล์นี้มีหลักการ, data model, โครงสร้าง และ roadmap

## Commands
```bash
nvm use               # Node 22 (.nvmrc)
npm run dev           # dev server http://localhost:3000
npm run lint
npm run build         # static export → out/
npm run preview       # serve out/ locally
NEXT_PUBLIC_BASE_PATH=/my-story npm run build   # จำลอง build แบบ GitHub Pages
```

## Rules
- ต้องเป็น static export ได้เสมอ: ห้ามใช้ Server Actions, cookies, dynamic route handlers, `next/image` แบบ optimize
- UI เข้าถึงข้อมูลผ่าน `NoteRepository` (`src/lib/types.ts`) เท่านั้น ห้ามเรียก IndexedDB ตรงจาก component
- เปลี่ยน schema → เพิ่ม `DB_VERSION` ใน `src/lib/db.ts` + migration ที่ไม่ทำให้โน้ตเก่าหาย
- ข้อความใน UI เป็นภาษาไทย, วันที่ใช้ `src/lib/format.ts`
- ใช้สีผ่าน token (`bg`, `surface`, `fg`, `muted`, `line`, `accent`, `danger`) ห้าม hardcode สี
- ทดสอบที่ความกว้าง 360px ทุกครั้งที่แก้ UI
- **ทุกการเปลี่ยนแปลงที่ผู้ใช้เห็น ต้องเพิ่มบรรทัดใน `CHANGELOG.md` ใต้ `## [Unreleased]`**
- เลขเวอร์ชันมีที่เดียวคือ `package.json` (แอพอ่านไปแสดงเอง) ห้ามแก้มือ ให้ใช้ skill `/release`

## Skills ของโปรเจคนี้
- `/add-feature <ไอเดีย>`: เพิ่มฟีเจอร์ตาม blueprint พร้อมอัพเดต CHANGELOG และ BLUEPRINT
- `/fix-bugs [BUG-xxx]`: อ่าน [docs/BUGS.md](docs/BUGS.md) แล้ว triage, แก้, ย้ายสถานะ, อัพเดต CHANGELOG
- `/release`: ออกเวอร์ชันใหม่ (semver, changelog, git tag)

## Bugs
ผู้ใช้รายงานบัคใน `docs/BUGS.md` (หัวข้อ 📥 Inbox) ถ้าผู้ใช้บอกบัคในแชท ให้จดลงไฟล์นี้ก่อนแก้เสมอ

## Git workflow (กันลืม)
- ก่อน commit/merge/release ให้ `git fetch origin` แล้วเช็คว่าอยู่ branch ไหน และ `origin/main` ล้ำหน้าเราไหม
- **ถ้าผู้ใช้ลืมขั้นตอนใด ให้บอกตรงๆ ก่อนทำต่อ** เช่น อยู่ผิด branch, ยังไม่ fetch, remote มี commit ใหม่, มีไฟล์ยังไม่ commit, ยังไม่ได้ push tag
- งานใหม่แต่ละอย่างควรแตก branch ใหม่จาก `main` ที่อัพเดตแล้ว (ไม่ใช้ branch เก่าที่ merge ไปแล้วต่อ)
- tag ที่ push แล้วห้ามลบหรือสร้างใหม่ ถ้ายังไม่ push แก้ได้
- เครื่องนี้ push ด้วย HTTPS ไม่ได้ (ไม่มี credentials) ผู้ใช้ push เอง ให้ผมเตรียม commit/tag แล้วส่งคำสั่ง push ให้
