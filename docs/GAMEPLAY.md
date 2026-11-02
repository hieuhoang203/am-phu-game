# Gameplay 0.5 — Thế giới mở âm giới

## Mục tiêu trải nghiệm

Vào vai vong hồn và tự chọn đường ngao du. Không có bài hỏi đáp, nhiệm vụ bắt buộc hay mở khóa tầng. Cảm giác chính là đi cùng bạn bè, lạc đường, tìm một rương hay cư dân thú vị, rồi bày trò với nhóm khác.

## Không gian và khám phá

18 vùng, mỗi vùng 2.800 × 1.900 đơn vị. Mỗi vùng có ba cạnh trong đồ thị cổng: kế tiếp, trước đó và cách sáu vùng, có vòng nối 18 → 1. Cổng ở các điểm khác nhau; người chơi phải thật sự tới gần. Đây là tổ chức không gian của game, không phải khẳng định địa lý hay thứ tự luân hồi trong tín ngưỡng.

Mỗi vùng có trạm nghỉ, sân hình phạt theo truyền thuyết, quỷ sứ gác đường, đài ký ức, phế tích và ba rương. Va chạm kiểm tra cây và đá; vong có thể lướt trên mặt nước. Tìm đường dùng cùng dữ liệu vật cản ở máy khách và máy chủ. Chạm một địa điểm sẽ tới rồi tương tác; E là cách tương tác khi tự đi tới.

Các vùng có màu, biểu tượng và hoạt cảnh riêng. Nội dung các đài / phế tích lấy ý nghĩa đã đối chiếu trong danh mục 18 tầng. Sổ tay trình bày nhân vật, thành phần cảnh phạt và lục đạo. Sổ tay là nội dung đọc tùy chọn, không khóa gameplay.

Rương +25 đốm hồn, địa điểm khác +5 lần đầu. Chỉ số này là vật sưu tầm, chưa có cửa hàng. Mỗi người lưu dấu khám phá riêng, không tranh mất phần thưởng của nhau. Mạnh Bà tại trạm vùng 18 cho quay về đầu, tăng số vòng và giữ tiến độ sưu tầm.

## Tương tác giữa các vong

| Hành động | Điều kiện và kết quả |
| --- | --- |
| Đẩy F | Gần 70 bước, làm ngã 1,2 giây; ngã không đủ điều kiện kéo |
| Gõ G | Hai cú trong 4 giây, cách nhau hồi chiêu 1,1 giây, gây choáng 5 giây |
| Kéo R | Chỉ vong đang choáng, gần 70 bước; người kéo đi còn 56% tốc độ |
| Thả R | Buông vong đang kéo; không được mang người qua cổng |
| Ném T | Đang kéo, tới trong bán kính 100 quanh sân; nạn nhân bị giữ 2,2–3,2 giây rồi hồi hồn |
| Đỡ Q | Đỡ đòn ngắn, làm người tấn công ngã |
| Cứu C | Gần nạn nhân, giải trạng thái; có thể cứu người khác hội |
| Vùng vẫy Space | Rút ngắn khống chế; ba lần thoát kéo |
| Chuối B | Đặt trước mặt, tồn tại 15 giây; sau một giây chủ bẫy cũng trượt |
| Gỡ V | Gỡ bẫy gần nhất |

Thể lực tối đa 100, hồi 10 mỗi giây. Mỗi chiêu có chi phí và hồi chiêu riêng trong `shared/mischief.ts`. Máy chủ kiểm tra mục tiêu, khoảng cách, trạng thái, thể lực, bảo hộ và hồi chiêu. Ba hội A/B/C có điểm quậy chung. Người chơi cùng phòng ở khác vùng vẫn chat và thấy nhau trong danh sách hội.

Trạm xuất phát, trạm nghỉ và ba cổng là nơi bảo hộ. Hồi hồn có miễn khống chế ngắn; người mất kết nối không giữ được dây kéo. Đẩy và kéo không đưa nạn nhân vào cây / đá. Các hình phạt dùng vong hoạt hình hài, không gây mất tiến độ sưu tầm.

## Giao diện

Cảnh game toàn khung; camera bám người chơi, có zoom. HUD gồm thể lực / đốm hồn, tên vùng, mục tiêu đang chọn, chat thu gọn, bản đồ nhỏ và thanh chiêu. M mở bản đồ 18 vùng, chọn một vùng để dẫn đường qua các cổng thật. Đi bằng phím hoặc cần điều khiển để đổi ý. Trên cảm ứng có cần di chuyển và thanh chiêu ba hàng.

Cài đặt vẫn có âm lượng tổng / nền / hiệu ứng, tắt khi rời cửa sổ, màu vong, mắt, mũ, hào quang, hạt sáng, tên, cỡ nút, tương phản và giảm chuyển động. Ngoại hình được đồng bộ tới người khác trong phòng.
