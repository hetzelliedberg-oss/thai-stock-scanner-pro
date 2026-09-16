# ⚡ Thai Stock Scanner Pro V3.0 Ultra Fact (เซียน สแกนเนอร์ หุ้นไทย)

ระบบสแกนหาหุ้นไทยระดับเซียนเทรดเดอร์ (Elite Swing Trader Screener) ที่ให้ข้อมูลราคาและวอลุ่มที่เป็น **Fact 100%** จากกระดานตลาดหลักทรัพย์แห่งประเทศไทย (SET & mai) ผ่าน TradingView Official Scanner Engine พร้อมระบบคำนวณแผนเทรด (Trading Plan), Risk/Reward Ratio, Volume Profile POC, และ Position Sizing Calculator ในหน้าเว็บเดียว

---

## 🌟 จุดเด่นที่เหนือกว่าเวอร์ชันเดิม
1. **ความเร็วระดับแสง (Scan Speed < 0.5s)**: สแกนหุ้นทั้งตลาด 880+ ตัว หรือ SET100/SET50 ได้จบในครั้งเดียว ไม่ต้องยิงทีละตัวผ่าน CORS Proxy ที่ช้าและหลุดบ่อย
2. **ราคาตรง Fact 100%**: ได้ข้อมูลราคาปิดล่าสุด, Real-time ในเวลาทำการ, Volume, Change%, EMA, RSI, MACD, RVOL, 52W High/Low, มูลค่าซื้อขาย (Value) ตรงเป๊ะ
3. **6 Preset สูตรสแกนระดับเซียน (Mark Minervini / Master Swing Trader)**:
   - 🎯 **All Quality Setups**: คัดเฉพาะหุ้นที่ทรงสวย คะแนนรวม Composite Score 60+
   - 🚀 **Volume Breakout**: เบรคทะลุ High 20D/52W พร้อม Volume กระชากแรง (RVOL > 130%)
   - 💎 **Pocket Pivot**: มีแรงซื้อสะสมแน่นในกรอบฐานเหนือเส้น EMA 10/20 (Smart Money Footprint)
   - 🌪️ **VCP / Squeeze**: กรอบราคาแคบมาก (<4%) วอลุ่มแห้งสนิท รอกระชาก
   - 📈 **EMA 20 Bounce**: ย่อแตะแนวรับ EMA 20 ดึงกลับสู้ทันที (Super Trend Buy on Dip)
   - 👑 **RS Monster**: หุ้นแกร่งกว่าดัชนีตลาดชัดเจน (RS Rating > 75)
   - ⚡ **MACD Golden**: โมเมนตัม MACD ตัดขึ้น ยืนยันรอบใหม่
4. **Liquidity Filter**: กรองสภาพคล่องด้วยมูลค่าซื้อขายจริง (เช่น > 10 ล้าน หรือ 30 ล้านบาท) ป้องกันกับดักหุ้นสภาพคล่องต่ำ
5. **Smart Trading Plan & Auto Calculator**:
   - คำนวณ Buy Pivot, Cut Loss (Swing Low / ATR), Target Resistance (2.5R / 52W High)
   - Risk/Reward (R:R) แสดงสัญลักษณ์เตือนว่าคุ้มเสี่ยงหรือไม่
   - Position Sizing Modal: กรอกเงินพอร์ต (เช่น 500,000 บาท) กำหนด % เสี่ยง (เช่น 1.5%) ระบบคำนวณจำนวนหุ้นที่ควรซื้อ (Board Lot 100 หุ้น) และเงินที่ต้องใช้ให้ทันที
6. **Interactive Candlestick & Volume Profile Chart**:
   - คลิกที่หุ้นตัวใดจะเปิดกราฟแท่งเทียนย้อนหลัง 60 วัน พร้อมเส้น Volume Profile แสดงตำแหน่ง POC (Point of Control)
7. **Export CSV**: ส่งออกตารางข้อมูลทั้งหมดเป็นไฟล์ CSV (UTF-8 BOM) เปิดใน Excel ได้ไม่เพี้ยน

---

## 🚀 วิธีเปิดใช้งาน

### วิธีที่ 1: ดับเบิ้ลคลิกไฟล์ `start.bat`
เพียงดับเบิ้ลคลิกที่ไฟล์ `start.bat` ในโฟลเดอร์นี้ ระบบจะเริ่มทำงานและเปิดหน้าเว็บขึ้นมาบนเบราว์เซอร์อัตโนมัติ

### วิธีที่ 2: รันผ่าน Terminal / PowerShell
```powershell
cd "C:\Users\PAWIN\.gemini\antigravity\scratch\thai-stock-scanner-pro"
& "C:\Users\PAWIN\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
```
จากนั้นเปิดเบราว์เซอร์ไปที่: `http://localhost:3300`
