# Kiểm chứng phiên bản 0.5

Ngày kiểm tra: 02/11/2026. Bản chạy local: http://localhost:3001. Health trả về `version: 0.5.0`, `mode: open-world`.

## Kết quả

- `npm run build`: TypeScript và Vite thành công.
- `npm test`: **18/18** bài đạt.
- `npm run check:language`: không có ký tự tượng hình ngoại ngữ trong nội dung nguồn, tài liệu, SVG, HTML và bản build được quét.
- Playwright: **5/5** kịch bản đạt trên Chromium; desktop 1440px và thiết bị cảm ứng 390 × 844.

## Những hành vi đã kiểm tra

1. Cả 18 vùng có ba cổng hợp lệ, đồ thị đi được giữa mọi cặp vùng. Mỗi địa điểm có đường đi không xuyên chướng ngại.
2. Di chuyển ra khỏi khung bản đồ cũ; camera theo nhân vật. Chọn vùng trên atlas dẫn nhân vật qua cổng thật, không cần giải đố. Menu không thể đưa người ở xa qua cổng.
3. Hai người cùng phòng thấy nhau; khác vùng vẫn chat cùng phòng. HTML trong chat hiển thị như văn bản.
4. Rương cho thưởng một lần, riêng từng người; khám phá và vùng đã ghé được lưu qua nối lại. Giới hạn vận tốc và vật cản được xác minh phía máy chủ.
5. Ba trình duyệt thực hiện gõ hai lần → choáng → kéo chậm → ném vào sân → đồng đội cứu. Kiểm tra từ chối kéo người chưa choáng, chặn di chuyển khi choáng, xử lý mất kết nối và vùng bảo hộ.
6. Luật thuần kiểm tra cả 18 sân, hồi chiêu, thể lực, đỡ, cứu, vùng vẫy, bẫy, tự trượt chuối và miễn khống chế sau hồi hồn.
7. Ngoại hình truyền tới người khác, lưu qua luân hồi / nối lại, từ chối enum không hợp lệ. Luân hồi ở trạm Mạnh Bà không cần ấn, giữ khám phá và đốm hồn.
8. Cần cảm ứng thực sự di chuyển nhân vật; các nút atlas, cài đặt, sổ tay và Xong thao tác được trên điện thoại. Cài đặt âm lượng thực sự thay đổi AudioContext gain; mute / rời cửa sổ hoạt động.
9. 19 nhân vật, 18 cảnh hình phạt và sáu cõi vẫn xem được; thư viện model độc lập hoạt động. Giao diện mới không có input câu trả lời hay handler socket answer.

## Ảnh

- [Desktop đang khám phá](screenshots/open-world-0.5/desktop-final.png)
- [Điện thoại](screenshots/open-world-0.5/mobile-final.png)
- [Bản đồ 18 vùng](screenshots/open-world-0.5/atlas.png)
- [Nhiều người và hình phạt](screenshots/open-world-0.5/open-world-prank.png)
- [Ngoại hình trên điện thoại](screenshots/open-world-0.5/mobile-appearance.png)

Bản này là thế giới mở 2D chia vùng; các vùng dùng bộ đường nền chung với biến thể vật cản và hình tượng. Chưa kiểm thử tải sản xuất hoặc thiết bị iOS / Android thật. Các báo cáo 0.2–0.4 và ảnh ngoài thư mục open-world-0.5 ghi lại các phiên bản trước.

## Sửa lỗi khởi động sau bàn giao

Đã tái hiện `EADDRINUSE` khi máy chủ chạy nền từ lần trước vẫn giữ cổng 3001 và một lệnh `npm run dev` mới cố mở cùng cổng. Đã dừng đúng tiến trình nền cũ và khởi động lại chế độ phát triển mặc định: giao diện 5173, máy chủ 3001.

- `predev` / `prestart` kiểm tra cổng, báo lỗi tiếng Việt và không tự dừng tiến trình đang dùng cổng.
- Vite dùng cùng biến `PORT` với máy chủ cho cả HTTP và Socket.IO, dùng strictPort cho cổng giao diện 5173.
- Máy chủ xử lý lỗi listen có thông báo rõ, không in stack trace chưa được xử lý.
- Kiểm chứng bổ sung: 20/20 kiểm thử luật / mạng / khởi động đạt; build và quét ngôn ngữ thành công. 5/5 kịch bản Playwright đạt trên Vite 5173 với máy chủ tùy chỉnh ở 3002, sau đó đã khởi động lại và kiểm tra cấu hình mặc định.
