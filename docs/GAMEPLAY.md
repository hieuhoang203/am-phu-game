# Vong hồn quậy phá — bản 0.3

Người vào phòng luôn là vong hồn. Mỗi phòng có tối đa 16 người, cùng khám phá đủ 18 tầng với tiến trình ấn riêng. Chọn phe A/B/C hoặc tự chia đều; cùng mã phòng để các phe gặp nhau. Các đội vẫn có thể trêu người cùng phe. Trò chơi dùng khống chế ngắn và hồi hồn, không có chết vĩnh viễn hay mất ấn.

## Chuỗi tương tác

`Tự do → gõ đầu hai lần → choáng → bị kéo → vào sân hình phạt → hồi hồn`

- Đẩy gây **ngã**, không đủ điều kiện để kéo. Hai cú gõ trong 4 giây mới gây **choáng** 5 giây.
- Chỉ người tự do, hai tay trống mới kéo được người đang choáng ở gần. Người kéo còn 56% tốc độ, không dùng chiêu khác ngoài thả / ném. Kéo không gia hạn thời gian choáng; phải đưa đến sân trước khi đối phương tỉnh.
- Ném cần đang giữ một vong và đứng cách tâm sân `(500,450)` không quá 100 đơn vị. Cảnh giữ người 2,2–3,2 giây tùy tầng, rồi đưa về điểm hồi hồn. Băng Sơn và Huyết Trì để lại hiệu ứng chậm ngắn.
- Người khác có thể cứu vong ngã, choáng, bị kéo hoặc đang dính hình phạt. Cứu cắt liên kết kéo và cho 3 giây miễn nhiễm. Ba lần vùng vẫy thoát kéo; mỗi lần cũng giảm thời gian khống chế 0,85 giây.
- Ngã / choáng / bị kéo / dính hình phạt không thể đi, thắp đèn, giải ấn, đổi tầng hoặc mở lượt mới. Người đang kéo cũng phải thả trước khi làm nhiệm vụ / qua cổng.

## Các chiêu

| Phím | Chiêu | Điều kiện / tác dụng | Thể lực | Hồi chiêu |
| --- | --- | --- | --- | --- |
| F | Đẩy ngã | Tầm 70, văng 55, ngã 1,2 giây | 18 | 2,8 giây |
| G | Gõ đầu | Tầm 65, tích 2 cú trong 4 giây gây choáng | 24 | 1,1 giây |
| R | Kéo / thả | Tầm 70, chỉ kéo vong choáng; R lần nữa để thả | 10 / 0 | 0,8 / 0,35 giây |
| T | Ném vào hình phạt | Đang kéo, ở trong vòng ném | 20 | 5 giây |
| Q | Đỡ đòn | Thủ 1,8 giây, phản một cú đẩy / gõ khiến đối phương ngã; tốc độ còn 65% | 15 | 4,5 giây |
| C | Cứu vong | Tầm 85, giải khống chế, cắt dây kéo | 15 | 3,5 giây |
| Space | Vùng vẫy | Khi bị khống chế; giảm thời gian, ba lần thoát kéo | 10 | 0,65 giây |
| V | Vỏ chuối | Đặt trước mặt, tồn tại 15 giây, tối đa 6 bẫy / tầng | 22 | 9 giây |
| X | Dọn bẫy | Dọn vỏ chuối gần nhất trong tầm 55 | 4 | 0,7 giây |

Thể lực tối đa 100, hồi 10/giây. Bẫy có thể làm chính chủ trượt sau một giây. Người đi nhanh qua bẫy vẫn bị kiểm tra trên cả đoạn di chuyển; không chỉ kiểm tra vị trí cuối.

## Phản công và hồi phục

- Ba vùng nghỉ: điểm hồi hồn, Phán quan, cổng tầng. Cấm bắt đầu đòn / kéo vào người trong vùng nghỉ; không đặt bẫy ở đó. Đưa người đang kéo vào vùng nghỉ sẽ giải phóng họ.
- Mới vào / sang tầng có 2,5 giây hào quang; sau thoát khống chế có 3 giây. Người có hào quang cũng không đánh / kéo người khác trong thời gian này.
- Không đánh chồng thêm khi nạn nhân đã bị khống chế. Người đang giữ một vong sẽ buông nếu chính mình bị hạ. Rời mạng dọn hai đầu dây kéo và bẫy của người rời.
- Cứu được cả phe khác để tạo tình huống hợp tác / phản bội tức thời. Không có khóa giữ vĩnh viễn; nếu không ai giúp thì thời gian giữ vẫn tự hết.

## Điểm phe và phối hợp

- Gây choáng đối thủ khác phe: +1 điểm. Ném đối thủ khác phe vào cảnh: +3 điểm.
- Cứu đồng đội khỏi khống chế do phe khác gây ra: +2 điểm. Không thưởng cứu nạn do cùng phe tạo ra, tránh đẩy bạn rồi cứu để cày điểm.
- Đẩy / đặt chuối / đánh người cùng phe không cộng điểm. Điểm chỉ là bảng tranh tài trong phòng, không quy đổi vật phẩm hay tiền.
- Bảng nhóm cho biết đồng đội ở tầng nào. Chat và điểm đi suốt phòng; tương tác chỉ áp dụng với người ở cùng tầng. Đèn chung cho cả phòng ở từng tầng, tiến trình mở tầng vẫn theo từng người.
- Nhóm có thể phân người gõ / kéo / bảo vệ hoặc phục kích ngoài vùng nghỉ, phe khác có thể thủ, cứu hoặc mở đường vòng. Không có va chạm thân người chặn kín đường; đây là chống khống chế, không phải xây vật cản vô hạn.

## Dùng trên điện thoại

Chạm vong trên bản đồ hoặc chọn trong bảng mục tiêu; dùng **Đến gần mục tiêu** để tự đi tới. Các nút chiêu tự khóa khi thiếu tầm, thể lực, hồi chiêu hay trạng thái cần thiết. Khi bị giữ, bảng đổi thành nút **Vùng vẫy**. Máy chủ vẫn xác thực lại mọi điều kiện.

## Lưu trữ và giới hạn

Phe, điểm, bẫy, khống chế và thể lực là trạng thái của phiên chơi. Khi kết nối lại, trở thành vong tự do ở tầng đầu, được bảo vệ ngắn; ấn / tầng mở vẫn đọc từ bản lưu. Phe đã chọn được trình duyệt gửi lại. Điểm mất khi phòng trống hoặc máy chủ khởi động lại.

MVP dùng một process, tick 100ms cho khống chế / hồi phục; di chuyển vẫn 50ms mỗi ý định. Chưa có xếp hạng liên máy chủ, kỹ năng mở khóa lâu dài, hệ vật lý va chạm đầy đủ, party có trưởng nhóm hoặc đăng nhập tài khoản. Các tương tác là luật game sáng tác, tách khỏi ý nghĩa truyền thuyết của từng tầng.
