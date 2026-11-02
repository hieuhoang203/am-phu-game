# Bộ model nhân vật 2D

Có 19 model, mỗi model có ba trạng thái đứng, làm việc, ngạc nhiên; xuất 57 SVG có nền trong suốt. Dùng rig đầu / thân / mắt / tay / đạo cụ riêng trong CharacterSprite.tsx. Hoạt hình dựa trên CSS, không phải sprite atlas ảnh hoặc mesh 3D.

| Nhân vật | Chữ Hán | Nhận diện | Nguồn vai trò |
| --- | --- | --- | --- |
| [Quỷ sứ](../../public/models/characters/quy-su.svg) | 鬼卒 | Mắt lồi, nanh nhỏ, sừng ngắn, khố giáp và đinh ba. Tạo hình quỷ tốt có nhiều dị bản. | S2 |
| [Ngưu Đầu](../../public/models/characters/nguu-dau.svg) | 牛頭 | Sừng cong, mõm trâu, móng chẻ, giáp và chĩa sắt. | S7 |
| [Mã Diện](../../public/models/characters/ma-dien.svg) | 馬面 | Mõm dài, tai dựng, bờm, áo giáp; cầm giáo và dây dẫn. | S7 |
| [Hắc Vô Thường](../../public/models/characters/hac-vo-thuong.svg) | 黑無常 | Áo và mũ cao màu đen, xích dẫn hồn; dáng thấp đậm trong bản game. | S10 |
| [Bạch Vô Thường](../../public/models/characters/bach-vo-thuong.svg) | 白無常 | Áo trắng, mũ cao, lưỡi dài và quạt; bản game dáng cao gầy. | S10 |
| [Phán quan](../../public/models/characters/phan-quan.svg) | 判官 | Mũ cánh chuồn, bút, sổ và râu; không phải vị vua thứ mười một. | S2 |
| [Mạnh Bà](../../public/models/characters/manh-ba.svg) | 孟婆 | Tóc bạc búi, nồi canh, muôi và bát. Không phải một vị trong Thập điện. | S8 |
| [Địa Tạng Bồ Tát](../../public/models/characters/dia-tang.svg) | 地藏菩薩 | Pháp phục, tích trượng và minh châu; tạo hình hiền hòa, không chế giễu. | S2 |
| [Vong hồn](../../public/models/characters/vong-hon.svg) | 亡魂 | Thân tròn nhẹ, mắt biểu cảm, đuôi khói và ánh sáng nhạt. | GAME |
| [Tần Quảng Vương](../../public/models/characters/king-1.svg) | 秦廣王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Sở Giang Vương](../../public/models/characters/king-2.svg) | 楚江王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Tống Đế Vương](../../public/models/characters/king-3.svg) | 宋帝王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Ngũ Quan Vương](../../public/models/characters/king-4.svg) | 五官王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Diêm La Vương](../../public/models/characters/king-5.svg) | 閻羅王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Biện Thành Vương](../../public/models/characters/king-6.svg) | 卞城王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Thái Sơn Vương](../../public/models/characters/king-7.svg) | 泰山王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Đô Thị Vương](../../public/models/characters/king-8.svg) | 都市王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Bình Đẳng Vương](../../public/models/characters/king-9.svg) | 平等王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |
| [Chuyển Luân Vương](../../public/models/characters/king-10.svg) | 轉輪王 | Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên. | S1, S9 |

Nguồn dẫn trong [RESEARCH.md](../RESEARCH.md). Pháp khí, tỉ lệ và cách biểu đạt được cách điệu. Model vua phân biệt bằng màu áo, số điện và nhãn tên; đây không phải mười bộ phục sức có chứng cứ khảo cổ riêng. Địa Tạng được tạo hình điềm đạm; các cảnh Uổng Tử tập trung tưởng niệm.

Bộ gốc: public/models/characters. Các tệp -work.svg và -surprised.svg đi kèm từng tên.
