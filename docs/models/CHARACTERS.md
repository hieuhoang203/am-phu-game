# Bộ model nhân vật 2D

Có 19 model, mỗi model có ba trạng thái đứng, làm việc, ngạc nhiên; xuất 57 SVG có nền trong suốt. Dùng rig đầu / thân / mắt / tay / đạo cụ riêng trong CharacterSprite.tsx. Hoạt hình dựa trên CSS, không phải sprite atlas ảnh hoặc mesh 3D.

| Nhân vật | Vai trò | Nhận diện | Nguồn vai trò |
| --- | --- | --- | --- |
| [Quỷ sứ](../../public/models/characters/quy-su.svg) | Quỷ tốt trông ngục, thi hành lệnh của âm ty. | Mắt lồi, nanh nhỏ, sừng ngắn, khố giáp và đinh ba. Tạo hình quỷ tốt có nhiều dị bản. | S2 |
| [Ngưu Đầu](../../public/models/characters/nguu-dau.svg) | Đầu trâu thân người; đi cùng Mã Diện áp giải vong hồn. | Sừng cong, mõm trâu, móng chẻ, giáp và chĩa sắt. | S7 |
| [Mã Diện](../../public/models/characters/ma-dien.svg) | Đầu ngựa thân người, cộng sự của Ngưu Đầu. | Mõm dài, tai dựng, bờm, áo giáp; cầm giáo và dây dẫn. | S7 |
| [Hắc Vô Thường](../../public/models/characters/hac-vo-thuong.svg) | Quỷ sai dẫn hồn trong cặp Hắc–Bạch Vô Thường của dân gian. | Áo và mũ cao màu đen, xích dẫn hồn; dáng thấp đậm trong bản game. | S10 |
| [Bạch Vô Thường](../../public/models/characters/bach-vo-thuong.svg) | Quỷ sai dẫn hồn, thường được tạo hình thành cặp với Hắc Vô Thường. | Áo trắng, mũ cao, lưỡi dài và quạt; bản game dáng cao gầy. | S10 |
| [Phán quan](../../public/models/characters/phan-quan.svg) | Quan lại âm phủ ghi chép và hỗ trợ xét xử. | Mũ cánh chuồn, bút, sổ và râu; không phải vị vua thứ mười một. | S2 |
| [Mạnh Bà](../../public/models/characters/manh-ba.svg) | Người trao bát canh quên ký ức trước tái sinh trong truyền thuyết dân gian. | Tóc bạc búi, nồi canh, muôi và bát. Không phải một vị trong Thập điện. | S8 |
| [Địa Tạng Bồ Tát](../../public/models/characters/dia-tang.svg) | Hình tượng cứu độ chúng sinh; không phải cai ngục hay người thi hành hình phạt. | Pháp phục, tích trượng và minh châu; tạo hình hiền hòa, không chế giễu. | S2 |
| [Vong hồn](../../public/models/characters/vong-hon.svg) | Nhân vật linh hồn trong cảnh; cũng là mẫu cho người chơi. | Thân tròn nhẹ, mắt biểu cảm, đuôi khói và ánh sáng nhạt. | GAME |
| [Tần Quảng Vương](../../public/models/characters/king-1.svg) | Vị vua của điện thứ 1 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Sở Giang Vương](../../public/models/characters/king-2.svg) | Vị vua của điện thứ 2 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Tống Đế Vương](../../public/models/characters/king-3.svg) | Vị vua của điện thứ 3 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Ngũ Quan Vương](../../public/models/characters/king-4.svg) | Vị vua của điện thứ 4 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Diêm La Vương](../../public/models/characters/king-5.svg) | Vị vua của điện thứ 5 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Biện Thành Vương](../../public/models/characters/king-6.svg) | Vị vua của điện thứ 6 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Thái Sơn Vương](../../public/models/characters/king-7.svg) | Vị vua của điện thứ 7 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Đô Thị Vương](../../public/models/characters/king-8.svg) | Vị vua của điện thứ 8 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Bình Đẳng Vương](../../public/models/characters/king-9.svg) | Vị vua của điện thứ 9 trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Chuyển Luân Vương](../../public/models/characters/king-10.svg) | Vị vua thứ mười, gắn với việc chuyển sinh trong hệ thống Thập điện. | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |

Nguồn dẫn trong [RESEARCH.md](../RESEARCH.md). Pháp khí, tỉ lệ và cách biểu đạt được cách điệu. Model vua phân biệt bằng màu áo, số điện và nhãn tên; đây không phải mười bộ phục sức có chứng cứ khảo cổ riêng. Địa Tạng được tạo hình điềm đạm; các cảnh Uổng Tử tập trung tưởng niệm.

Bộ gốc: public/models/characters. Các tệp -work.svg và -surprised.svg đi kèm từng tên.
