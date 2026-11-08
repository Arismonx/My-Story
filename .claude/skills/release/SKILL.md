---
name: release
description: ออกเวอร์ชันใหม่ของ My Story ตาม Semantic Versioning ย้าย CHANGELOG Unreleased เป็นเลขเวอร์ชัน, bump package.json, สร้าง git tag ใช้เมื่อผู้ใช้พูดว่า "release", "ออกเวอร์ชัน", "bump version", "/release"
argument-hint: "[patch|minor|major] (ไม่ใส่ = ให้วิเคราะห์จาก changelog)"
disable-model-invocation: true
---

# Release – My Story

ระดับที่ขอ: $ARGUMENTS

## 0. Preflight (ห้ามข้าม — หยุดและแจ้งผู้ใช้ทันทีถ้าข้อใดไม่ผ่าน)
```bash
git fetch origin --tags
git branch --show-current                      # ต้องเป็น main
git rev-list --left-right --count main...origin/main   # ซ้าย=เรามีเกิน, ขวา=remote มีเกิน
git status --short
```
| เจออะไร | ต้องทำ |
|---|---|
| ไม่ได้อยู่บน `main` | **หยุด** บอกว่า "คุณอยู่บน branch X ไม่ใช่ main" แล้วถามว่าจะ merge เข้า main ก่อนไหม ห้าม tag บน branch อื่น |
| `origin/main` มี commit ที่เราไม่มี (ฝั่งขวา > 0) | **หยุด** แจ้งว่า remote ล้ำหน้า (อาจมี PR ถูก merge ไปแล้ว) แล้วเสนอ `git rebase origin/main` ก่อน ต้อง tag หลัง rebase เท่านั้น |
| มีไฟล์ค้างที่ยังไม่ commit | ถามก่อนว่าจะ commit ไหม |
| tag `vX.Y.Z` ที่จะสร้างมีอยู่แล้ว (local หรือ remote) | **หยุด** แจ้งผู้ใช้ ห้ามลบ/เขียนทับ tag ที่ push ไปแล้ว |
| `git push` ไม่ผ่านเพราะไม่มี credentials | บอกผู้ใช้ให้ push เอง พร้อมคำสั่ง `git push origin main && git push origin vX.Y.Z` |

เมื่อหยุด ให้สรุปเป็นรายการ "สิ่งที่ลืม/ผิดปกติ" ให้ผู้ใช้เห็นชัดๆ ก่อนถามว่าจะแก้อย่างไร

## 1. ตรวจสถานะ
```bash
git status --short          # ต้องสะอาด ยกเว้น CHANGELOG/BLUEPRINT ที่จะแก้ในขั้นนี้
git describe --tags --abbrev=0 2>/dev/null   # tag ล่าสุด
node -p "require('./package.json').version"
```
- ถ้ามีไฟล์โค้ดค้างที่ยังไม่ commit → ถามผู้ใช้ก่อนว่าจะ commit ไหม
- ถ้า `## [Unreleased]` ใน CHANGELOG ว่าง → ใช้ `git log <tag ล่าสุด>..HEAD --oneline` ร่างรายการให้ผู้ใช้ยืนยัน

## 2. เลือกเลขเวอร์ชัน (ถ้าผู้ใช้ไม่ระบุ)
- มี `### Removed` หรือการเปลี่ยนที่ทำให้ข้อมูล/พฤติกรรมเดิมใช้ไม่ได้ → **major**
- มี `### Added` → **minor**
- มีแค่ `### Fixed` / `### Changed` เล็กน้อย → **patch**
- ช่วง 0.x.y: breaking ให้ขึ้น minor แทน major ได้ (บอกผู้ใช้)

บอกผู้ใช้ว่า `เวอร์ชันเดิม → เวอร์ชันใหม่` พร้อมเหตุผล 1 บรรทัด

## 3. อัพเดตเอกสาร
1. `CHANGELOG.md`: เปลี่ยน `## [Unreleased]` เป็น `## [X.Y.Z] - YYYY-MM-DD` แล้วเพิ่ม `## [Unreleased]` ว่างไว้ข้างบน
2. `docs/BLUEPRINT.md`: แทน `next` ในตารางฟีเจอร์ด้วย `X.Y.Z`, อัพเดตบรรทัด "เวอร์ชันแอพ" และ "อัพเดตล่าสุด"
3. `docs/BUGS.md`: แทน `**แก้ใน:** next` ด้วย `**แก้ใน:** vX.Y.Z`
4. `git add CHANGELOG.md docs/BLUEPRINT.md docs/BUGS.md && git commit -m "docs: changelog for vX.Y.Z"`

## 4. Bump + tag
```bash
npm run release:<patch|minor|major>
```
คำสั่งนี้แก้ `package.json`/`package-lock.json`, commit `chore(release): vX.Y.Z` และสร้าง tag `vX.Y.Z`

## 5. Push (ถามผู้ใช้ก่อนทุกครั้ง)
```bash
git push && git push --tags
```
หลัง push GitHub Actions จะ deploy ให้เอง และหน้าแอพจะแสดงเวอร์ชันใหม่มุมล่างซ้าย
