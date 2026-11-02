# Kiểm chứng bản 0.3

Ngày thực hiện: 02/11/2026.

## Kết quả

- `npm run build`: thành công, TypeScript và Vite.
- `npm test`: **16/16** bài kiểm tra đạt.
- `npx playwright test tests/browser.spec.mjs tests/models.spec.mjs tests/mischief.spec.mjs --workers=1 --timeout=90000 --reporter=line`: **3/3** bài kiểm tra đạt, 44,6 giây trong lần chạy cuối.

## Tình huống đã kiểm tra

- Người chơi vào dưới dạng vong hồn; chọn phe hoặc tự chia cân bằng.
- Đẩy chỉ gây ngã; hai cú gõ trong cửa sổ thời gian gây choáng; kéo yêu cầu choáng, làm chậm người kéo và không gia hạn khống chế.
- Ném cần ở gần sân và đang giữ người. Đủ 18 tầng có hiệu ứng giữ / hồi hồn, không mất ấn cá nhân.
- Đỡ phản đòn, cứu cắt dây kéo, ba lần vùng vẫy thoát kéo; tự tỉnh hết hạn; người kéo bị đánh sẽ buông.
- Vùng nghỉ, hào quang, thể lực, hồi chiêu, cấm đánh chồng, từ chối khác tầng / tự đánh / thao tác lạ.
- Chuối trúng người đi qua cả đoạn di chuyển, trúng chủ sau thời gian miễn riêng, dọn bẫy và tự hết hạn.
- Không cộng điểm cứu do cùng phe tự gây nạn.
- Socket thật gửi trực tiếp lệnh khi choáng không thể đi, thắp đèn, giải ấn, đổi tầng hoặc luân hồi. Người kéo ngắt mạng giải phóng người bị kéo.
- Ba trình duyệt thực: A gõ B choáng, kéo, tự đi đến vòng ném, ném vào cảnh, đồng đội B cứu; các máy đồng bộ trạng thái và điểm A=4 / B=2.
- Điện thoại 390px có bảng mục tiêu / nút thao tác và không tràn ngang.
- Các chức năng khám phá tầng đầu, lưu / đọc tiến trình, luân hồi, 19 nhân vật, 18 cảnh và lục đạo vẫn qua kiểm tra cũ.

Ảnh bàn giao: [desktop](screenshots/party-multiplayer-0.3.png), [điện thoại](screenshots/party-mobile-0.3.png).

Ảnh tự động của mỗi lần chạy nằm trong `test-results`; các ảnh được chọn mới sao chép sang `docs/screenshots` để bàn giao. Điều này tránh ghi đè file ảnh đang được ứng dụng xem ảnh trên Windows giữ mở.

## Giới hạn kiểm chứng

Máy trạng thái được kiểm tra cho toàn bộ 18 tầng; chuỗi ba trình duyệt được kiểm tra ở tầng đầu. Chưa có kiểm thử tải 16 người tương tác liên tục, benchmark băng thông, xếp hạng nhiều máy chủ hay một phiên chơi tay liên tục qua đủ 18 tầng. Điểm, phe và bẫy là dữ liệu phiên phòng; tiến trình ấn và số vòng tiếp tục lưu như trước.
