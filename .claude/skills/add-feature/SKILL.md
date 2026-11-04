---
name: add-feature
description: เพิ่มฟีเจอร์ใหม่ให้แอพ My Story ตาม blueprint ใช้เมื่อผู้ใช้ขอเพิ่ม/ปรับฟีเจอร์ เช่น "เพิ่มแท็ก", "ทำ markdown preview", "/add-feature ..." หรือหยิบงานจาก roadmap
argument-hint: <ฟีเจอร์ที่อยากได้ หรือเว้นว่างเพื่อเลือกจาก roadmap>
---

# Add feature – My Story

ฟีเจอร์ที่ขอ: $ARGUMENTS

## 1. เข้าใจบริบท
1. อ่าน `docs/BLUEPRINT.md` ทั้งไฟล์ (หลักการ, data model, โครงสร้าง, roadmap)
2. ถ้า `$ARGUMENTS` ว่าง → แสดง roadmap ที่ยังไม่ติ๊ก แล้วให้ผู้ใช้เลือก 1 อย่าง
3. ตรวจว่าฟีเจอร์ขัดกับ **หลักการออกแบบ (ข้อ 3)** หรือไม่ ถ้าขัด (เช่น ต้องมี server) ให้บอกผู้ใช้พร้อมทางเลือก ก่อนลงมือ
4. ถ้าแตะ Next.js API ที่ไม่คุ้น → อ่าน `node_modules/next/dist/docs/` ก่อน

## 2. วางแผนสั้นๆ (บอกผู้ใช้ก่อนเขียนโค้ด)
- ไฟล์ที่จะสร้าง/แก้
- data model เปลี่ยนไหม → ถ้าเปลี่ยน: field ใหม่ต้อง optional หรือมี migration ใน `onupgradeneeded` + เพิ่ม `DB_VERSION`
- ประเภทการเปลี่ยน: feature (minor) / fix (patch) / breaking (major)

## 3. ลงมือ
- logic อยู่ใน `src/lib/` หรือ `src/hooks/`, UI อยู่ใน `src/components/`
- เข้าถึงข้อมูลผ่าน `NoteRepository` เท่านั้น
- ข้อความ UI ภาษาไทย, สีใช้ token, ปุ่มบนมือถือสูงอย่างน้อย 40px
- ถ้า export ได้รับผลกระทบ (เช่น เพิ่ม tags) → อัพเดต `src/lib/export.ts` ให้ข้อมูลใหม่ติดไปด้วย

## 4. ตรวจสอบ
```bash
source ~/.nvm/nvm.sh && nvm use
npm run lint
NEXT_PUBLIC_BASE_PATH=/my-story npm run build
```
ทั้งสองต้องผ่าน ถ้าไม่ผ่านให้แก้ก่อน ห้ามรายงานว่าเสร็จ

## 5. บันทึกเอกสาร (ห้ามข้าม)
1. `CHANGELOG.md` → เพิ่มบรรทัดใต้ `## [Unreleased]` ในหัวข้อ `### Added` / `### Changed` / `### Fixed` / `### Removed`
2. `docs/BLUEPRINT.md`:
   - ย้ายรายการจาก Roadmap ไปตาราง "ฟีเจอร์ที่มีแล้ว" (ใส่เวอร์ชันเป็น `next`)
   - อัพเดต Data model / โครงสร้างโค้ด ถ้าเปลี่ยน
   - ตัดสินใจสำคัญ → เพิ่มแถวใน Decision log
3. สรุปให้ผู้ใช้: ทำอะไร, ไฟล์ที่แก้, และแนะนำว่าควร `/release` เป็น patch/minor/major
