# Kết quả kiểm tra bản 0.2

Ngày thực hiện: 02/11/2026.

- `npm run build`: TypeScript và Vite thành công.
- `npm test`: 4/4 bài kiểm tra thành công. Gồm cấu trúc 18 tầng, multiplayer thực với hai phòng, lưu / đọc tiến trình, đầy đủ 19 nhân vật / 18 cảnh / 6 cõi, điều kiện mở lượt luân hồi và lưu số vòng.
- Playwright: 2/2 bài kiểm tra thành công trên Chromium. Chơi hai client, mở tầng đầu, kiểm tra thư viện model, đổi ba trạng thái, dừng chuyển động, xem đủ 18 cảnh, lục đạo, Tàng thư và giao diện 390px.
- Trình duyệt giải mã thành công 57 SVG nhân vật và 18 SVG sân cảnh; không có lỗi JavaScript hoặc lỗi console trong kiểm tra thư viện.
- Đã xem trực tiếp các ảnh chụp bảng nhân vật, bảng hình phạt, thư viện, luân hồi và game hai người.

Ảnh bàn giao:

- [Bảng 19 nhân vật](../screenshots/characters-sheet-v2.png)
- [Bảng 18 cảnh](../screenshots/punishments-sheet-v2.png)
- [Thư viện nhân vật](../screenshots/character-library-v2.png)
- [Vạc dầu](../screenshots/oil-cauldron-v2.png)
- [Luân hồi](../screenshots/rebirth-v2.png)
- [Điện thoại](../screenshots/models-mobile-v2.png)

Kiểm tra multiplayer đi qua tầng đầu; điều kiện kết thúc dùng bản lưu giả lập có đủ 18 ấn để kiểm tra API mở lượt mới, không phải một phiên trình duyệt chơi tay liên tục đủ 18 tầng. Nội dung từng tầng và file model được kiểm tra riêng. Chưa đo tải người chơi lớn hoặc kiểm tra mọi trình duyệt.
