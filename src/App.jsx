import { useState, useEffect } from "react";

// Mật khẩu để mở khóa xem lời giải bài tập tự luyện.
// Đổi chuỗi bên dưới để đặt mật khẩu khác.
const SOLUTION_PASSWORD = "toanvietphap2026";

// So sánh đáp số của học sinh với đáp án chuẩn — chấp nhận sai khác nhỏ
// về khoảng trắng, hoa/thường, dấu chấm cuối câu.
function normalizeForCompare(str) {
  return (str || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\.+$/, "");
}

function checkAnswer(given, correct) {
  const g = normalizeForCompare(given);
  const c = normalizeForCompare(correct);
  if (!g) return null; // chưa nhập gì
  if (g === c) return true;
  // So sánh riêng phần số/phân số (bỏ chữ, đơn vị) — chấp nhận thiếu đơn vị
  const gNum = g.replace(/[^0-9.,\/\-]/g, "");
  const cNum = c.replace(/[^0-9.,\/\-]/g, "");
  if (gNum && cNum && gNum === cNum) return true;
  // Với đáp án dạng câu dài (giải thích), chấp nhận nếu chứa nội dung cốt lõi
  if (c.length > 8 && (g.includes(c) || c.includes(g))) return true;
  return false;
}

/* ============ NGÂN HÀNG CÂU HỎI ============
   Mỗi lớp có 2 nhóm luyện tập, giống cách tổ chức của Nguyễn Bảo Vương Blog:
   - "topics"     : luyện THEO CHUYÊN ĐỀ kiến thức (Phân số, Đạo hàm, Mũ-logarit...)
     mỗi chủ đề trong "topics" có thể có thêm "exercises" — bài tập tự luyện có lời giải,
     khóa bằng mật khẩu (SOLUTION_PASSWORD ở trên).
   - "examTopics" : luyện THEO KỲ THI — quiz dựng từ đề thi thật (giữa kỳ, cuối kỳ...)
   - "examSources": link thật ra ngoài để tải thêm đề PDF (chưa chấm điểm tự động)
   Để thêm câu hỏi: copy một object trong mảng "questions" và sửa nội dung.
   Để thêm bài tập tự luyện: copy một object trong mảng "exercises" (prompt + solution).
   Để thêm chủ đề: copy một object trong "topics" hoặc "examTopics".
   Để thêm lớp: copy một object trong mảng GRADES. */

const GRADES = [
  {
    id: 4,
    label: "Lớp 4",
    topics: [
      {
        id: "so-nhieu-chu-so-4",
        title: "Số có nhiều chữ số",
        questions: [
          { prompt: "Số 1.000.000 đọc là gì?", options: ["Một triệu", "Một trăm nghìn", "Mười triệu", "Một nghìn"], correct: 0, explain: "1.000.000 đọc là một triệu." },
          { prompt: "Số 456.789 có chữ số hàng chục nghìn là số nào?", options: ["5", "4", "6", "7"], correct: 0, explain: "Đếm từ phải sang: 9(đv),8(chục),7(trăm),6(nghìn),5(chục nghìn),4(trăm nghìn). Vậy hàng chục nghìn là 5." },
          { prompt: "Số nào sau đây là số chẵn?", options: ["67890", "12345", "13579", "24681"], correct: 0, explain: "Số chẵn có chữ số tận cùng là 0,2,4,6,8. Chỉ 67890 có tận cùng là 0." },
          { prompt: "Viết số \"hai trăm ba mươi tư nghìn năm trăm\" bằng chữ số.", options: ["234500", "234050", "230450", "234005"], correct: 0, explain: "234 nghìn 500 = 234500." },
          { prompt: "Số liền sau của 999.999 là số nào?", options: ["1.000.000", "999.998", "1.000.001", "990.999"], correct: 0, explain: "Số liền sau = số đã cho + 1 = 999.999+1 = 1.000.000." },
          { prompt: "So sánh 3.456.789 và 3.465.789, số nào lớn hơn?", options: ["3.465.789", "3.456.789", "Bằng nhau", "Không so sánh được"], correct: 0, explain: "So sánh từng hàng từ trái sang: hàng chục nghìn 6>5, nên 3.465.789 lớn hơn." },
        ],
        exercises: [
          { prompt: "Viết số gồm 5 triệu, 3 trăm nghìn, 2 chục, 7 đơn vị.", solution: "Ghép các hàng: 5.300.027.", answer: "Ghép các hàng: 5.300.027" },
          { prompt: "Sắp xếp các số sau theo thứ tự tăng dần: 45678, 45687, 45768, 45600", solution: "So sánh từng hàng: 45600 < 45678 < 45687 < 45768.", answer: "45600 < 45678 < 45687 < 45768" },
          { prompt: "Số 7.245.610 có giá trị của chữ số 4 là bao nhiêu?", solution: "Chữ số 4 ở hàng trăm nghìn, giá trị = 400.000.", answer: "400.000" },
          { prompt: "Tìm số liền trước và liền sau của 2.000.000.", solution: "Số liền trước: 2.000.000-1=1.999.999.\nSố liền sau: 2.000.000+1=2.000.001.", answer: "2.000.001" },
          { prompt: "Trong các số 24, 37, 58, 91, số nào là số lẻ?", solution: "Số lẻ có chữ số tận cùng lẻ (1,3,5,7,9): đó là 37 và 91.", answer: "đó là 37 và 91" },
          { prompt: "Viết số lớn nhất có 6 chữ số khác nhau.", solution: "Chọn các chữ số lớn nhất, khác nhau, xếp giảm dần: 987.654.", answer: "987.654" },
          { prompt: "Viết số nhỏ nhất có 6 chữ số.", solution: "Số nhỏ nhất có 6 chữ số là 100.000.", answer: "Số nhỏ nhất có 6 chữ số là 100.000" },
          { prompt: "Số 8.560.234 đọc như thế nào?", solution: "Tám triệu năm trăm sáu mươi nghìn hai trăm ba mươi tư.", answer: "Tám triệu năm trăm sáu mươi nghìn hai trăm ba mươi tư" },
          { prompt: "Một thành phố có 1.250.000 dân. Viết số đó dưới dạng số.", solution: "1.250.000.", answer: "1.250.000" },
          { prompt: "So sánh 999.999 và 1.000.000.", solution: "999.999 có 6 chữ số, 1.000.000 có 7 chữ số, nên 999.999 < 1.000.000.", answer: "1.000.000." },
        ],
        advanced: [
          { prompt: "Một số có 6 chữ số, chữ số hàng trăm nghìn là 3, hàng chục nghìn là 5, các hàng còn lại đều là 0. Viết số đó và đọc.", solution: "Số đó là 350.000.\nĐọc là: ba trăm năm mươi nghìn.", answer: "Đọc là: ba trăm năm mươi nghìn" },
          { prompt: "Tìm số lớn nhất và nhỏ nhất có thể lập được từ 4 chữ số 3, 0, 7, 5 (mỗi chữ số dùng đúng 1 lần, số không bắt đầu bằng 0).", solution: "Số lớn nhất: xếp các chữ số giảm dần: 7530.\nSố nhỏ nhất: xếp tăng dần nhưng không bắt đầu bằng 0, nên chữ số nhỏ nhất khác 0 đứng đầu: 3057.", answer: "3057" },
          { prompt: "Một thư viện có 125.000 quyển sách. Người ta nhập thêm 1/5 số sách hiện có. Hỏi thư viện có bao nhiêu quyển sách sau khi nhập?", solution: "Số sách nhập thêm = 125.000 : 5 = 25.000.\nTổng số sách = 125.000 + 25.000 = 150.000 quyển.", answer: "150.000 quyển" },
          { prompt: "Một số có 6 chữ số, khi bớt chữ số hàng đơn vị thì được số 23.456 (5 chữ số). Biết chữ số hàng đơn vị là 7. Tìm số ban đầu.", solution: "Ghép thêm chữ số 7 vào cuối 23.456: số ban đầu là 234.567.", answer: "234.567" },
          { prompt: "Tìm số tự nhiên có 4 chữ số nhỏ nhất mà tổng các chữ số bằng 10.", solution: "Để số nhỏ nhất: chữ số hàng nghìn nhỏ nhất có thể là 1, còn lại 9 chia cho 3 chữ số sau, ưu tiên nhỏ ở hàng cao: 0,0,9.\nSố cần tìm: 1009.", answer: "1009" },
          { prompt: "Viết tất cả các số có 3 chữ số khác nhau từ các chữ số 1, 2, 3 (mỗi chữ số dùng đúng 1 lần).", solution: "Các số: 123, 132, 213, 231, 312, 321.", answer: "123, 132, 213, 231, 312, 321" },
          { prompt: "So sánh: 4 triệu và 3.999.999.", solution: "4 triệu = 4.000.000 > 3.999.999.", answer: "4 triệu lớn hơn" },
          { prompt: "Viết số liền sau và liền trước của số 999.999.", solution: "Liền sau: 1.000.000. Liền trước: 999.998.", answer: "liền sau 1.000.000, liền trước 999.998" },
          { prompt: "Một số có 4 chữ số, các chữ số đều giống nhau. Tìm số nhỏ nhất và lớn nhất dạng này.", solution: "Số nhỏ nhất: 1111. Số lớn nhất: 9999.", answer: "1111 và 9999" },
          { prompt: "Viết số gồm 7 triệu, 5 trăm nghìn, 3 chục, 2 đơn vị.", solution: "Ghép các hàng: 7.500.032.", answer: "7.500.032" },
        ],
      },
      {
        id: "cong-tru-so-nhieu-chu-so-4",
        title: "Phép cộng, phép trừ số có nhiều chữ số",
        questions: [
          { prompt: "345.678 + 123.456 = ?", options: ["469.134", "468.134", "469.144", "479.134"], correct: 0, explain: "345.678 + 123.456 = 469.134." },
          { prompt: "500.000 − 234.567 = ?", options: ["265.433", "265.343", "264.433", "275.433"], correct: 0, explain: "500.000 - 234.567 = 265.433." },
          { prompt: "Tính nhanh: 999.999 + 1 = ?", options: ["1.000.000", "999.998", "1.000.001", "1.000.100"], correct: 0, explain: "999.999+1 = 1.000.000." },
          { prompt: "123.456 + 0 = ?", options: ["123.456", "0", "123.457", "124.456"], correct: 0, explain: "Một số cộng với 0 vẫn bằng chính nó." },
          { prompt: "Muốn tìm số bị trừ, ta làm thế nào?", options: ["Lấy hiệu cộng với số trừ", "Lấy hiệu trừ số trừ", "Lấy số trừ trừ hiệu", "Không tính được"], correct: 0, explain: "Số bị trừ = hiệu + số trừ." },
          { prompt: "250.000 + 250.000 = ?", options: ["500.000", "400.000", "550.000", "450.000"], correct: 0, explain: "250.000+250.000 = 500.000." },
        ],
        exercises: [
          { prompt: "Một cửa hàng bán được 125.400 sản phẩm trong quý 1 và 98.600 sản phẩm trong quý 2. Tính tổng sản phẩm bán được.", solution: "125.400 + 98.600 = 224.000 sản phẩm.", answer: "224.000 sản phẩm" },
          { prompt: "Một kho có 456.000kg gạo, đã xuất 178.500kg. Hỏi còn lại bao nhiêu kg?", solution: "456.000 - 178.500 = 277.500kg.", answer: "277.500kg" },
          { prompt: "Tính: 678.912 − 345.678", solution: "678.912 - 345.678 = 333.234.", answer: "333.234" },
          { prompt: "Tính: 234.567 + 345.678", solution: "234.567 + 345.678 = 580.245.", answer: "580.245" },
          { prompt: "Tìm x biết: x + 125.000 = 500.000", solution: "x = 500.000 - 125.000 = 375.000.", answer: "375.000" },
          { prompt: "Tìm x biết: x − 45.000 = 100.000", solution: "x = 100.000 + 45.000 = 145.000.", answer: "145.000" },
          { prompt: "Một xã có 12.450 người, xã bên cạnh có nhiều hơn 3.780 người. Hỏi xã bên cạnh có bao nhiêu người?", solution: "12.450 + 3.780 = 16.230 người.", answer: "16.230 người" },
          { prompt: "Tính tổng của số lớn nhất có 5 chữ số và số nhỏ nhất có 5 chữ số.", solution: "Số lớn nhất có 5 chữ số: 99.999. Số nhỏ nhất: 10.000.\nTổng = 99.999+10.000 = 109.999.", answer: "109.999" },
          { prompt: "Một sân vận động có sức chứa 45.000 người. Hôm nay có 38.750 người đến xem. Hỏi còn bao nhiêu chỗ trống?", solution: "45.000 - 38.750 = 6.250 chỗ.", answer: "6.250 chỗ" },
          { prompt: "Tính: 1.000.000 − 456.789", solution: "1.000.000 - 456.789 = 543.211.", answer: "543.211" },
        ],
        advanced: [
          { prompt: "Tổng của hai số là 458.000, hiệu của chúng là 124.000. Tìm hai số đó.", solution: "Số lớn = (458.000+124.000):2 = 291.000.\nSố bé = 458.000-291.000 = 167.000.", answer: "167.000" },
          { prompt: "Một cửa hàng ngày 1 bán 45.600 sản phẩm, ngày 2 bán nhiều hơn ngày 1 là 8.200 sản phẩm nhưng ít hơn ngày 3 là 5.100 sản phẩm. Tính số sản phẩm bán ngày 3.", solution: "Ngày 2 = 45.600+8.200 = 53.800.\nNgày 3 = 53.800+5.100 = 58.900.", answer: "58.900" },
          { prompt: "Tìm x biết: x − 234.500 + 100.000 = 500.000", solution: "x = 500.000-100.000+234.500 = 634.500.", answer: "634.500" },
          { prompt: "Tổng 2 số là 786.000, hiệu 2 số là 124.000. Tìm 2 số.", solution: "Số lớn = (786.000+124.000):2 = 455.000.\nSố bé = 786.000-455.000 = 331.000.", answer: "455.000 và 331.000" },
          { prompt: "Một trường có 3 khối: khối 1 có 450 học sinh, khối 2 nhiều hơn khối 1 là 50, khối 3 ít hơn khối 2 là 30. Tính tổng học sinh cả trường.", solution: "Khối 2=450+50=500. Khối 3=500-30=470.\nTổng=450+500+470=1.420 học sinh.", answer: "1.420 học sinh" },
          { prompt: "Tìm số biết số đó cộng với 45.000 rồi trừ đi 12.000 thì được 100.000.", solution: "Gọi số=x: x+45.000-12.000=100.000 → x+33.000=100.000 → x=67.000.", answer: "67.000" },
          { prompt: "Tính nhanh: 999.999 + 999.999", solution: "= 2×999.999 = 2.000.000-2 = 1.999.998.", answer: "1.999.998" },
          { prompt: "Một người có 500.000đ, mua đồ hết 235.000đ, sau đó được cho thêm 150.000đ. Hỏi còn bao nhiêu tiền?", solution: "500.000-235.000+150.000 = 415.000đ.", answer: "415.000đ" },
          { prompt: "Tìm 2 số biết tổng bằng 1.000.000 và một số gấp 4 lần số kia.", solution: "Gọi số bé=x, số lớn=4x: x+4x=1.000.000 → 5x=1.000.000 → x=200.000.\nSố bé=200.000, số lớn=800.000.", answer: "200.000 và 800.000" },
          { prompt: "Tìm x biết: x − 234.500 + 100.000 = 500.000", solution: "x = 500.000-100.000+234.500 = 634.500.", answer: "634.500" },
        ],
      },
      {
        id: "nhan-chia-4",
        title: "Phép nhân và phép chia",
        questions: [
          { prompt: "234 × 3 = ?", options: ["702", "792", "602", "712"], correct: 0, explain: "234×3 = 702." },
          { prompt: "456 : 4 = ?", options: ["114", "104", "124", "144"], correct: 0, explain: "456:4 = 114." },
          { prompt: "25 × 4 = ?", options: ["100", "90", "110", "120"], correct: 0, explain: "25×4 = 100." },
          { prompt: "Tính chất giao hoán của phép nhân: a×b = ?", options: ["b×a", "a+b", "a-b", "a÷b"], correct: 0, explain: "Phép nhân có tính chất giao hoán: a×b=b×a." },
          { prompt: "123 × 10 = ?", options: ["1230", "123", "12300", "1203"], correct: 0, explain: "Nhân với 10, thêm 1 chữ số 0 vào bên phải: 1230." },
          { prompt: "4500 : 100 = ?", options: ["45", "450", "4,5", "4500"], correct: 0, explain: "Chia cho 100, bỏ 2 chữ số 0 bên phải: 45." },
        ],
        exercises: [
          { prompt: "Tính: 234 × 25", solution: "234×25 = 5.850.", answer: "5.850" },
          { prompt: "Tính: 1755 : 15", solution: "1755:15 = 117.", answer: "117" },
          { prompt: "Một trường có 24 lớp, mỗi lớp trung bình 35 học sinh. Trường có bao nhiêu học sinh?", solution: "24×35 = 840 học sinh.", answer: "840 học sinh" },
          { prompt: "Một đội xe chở 156 tấn hàng bằng 12 xe. Trung bình mỗi xe chở bao nhiêu tấn?", solution: "156:12 = 13 tấn.", answer: "13 tấn" },
          { prompt: "Tính bằng cách thuận tiện: 25 × 4 × 37", solution: "(25×4)×37 = 100×37 = 3.700.", answer: "3.700" },
          { prompt: "Tính: 48 × 25", solution: "48×25 = 1.200.", answer: "1.200" },
          { prompt: "Một hộp có 24 chiếc bút. Hỏi 15 hộp có bao nhiêu chiếc bút?", solution: "24×15 = 360 chiếc bút.", answer: "360 chiếc bút" },
          { prompt: "Tìm x biết: x × 6 = 258", solution: "x = 258:6 = 43.", answer: "43" },
          { prompt: "Tính: 936 : 8", solution: "936:8 = 117.", answer: "117" },
          { prompt: "Một kho gạo có 4.500kg, chia đều vào các bao 25kg. Hỏi được bao nhiêu bao?", solution: "4.500:25 = 180 bao.", answer: "180 bao" },
        ],
        advanced: [
          { prompt: "Một đội công nhân trong 8 ngày làm được 960 sản phẩm (mỗi ngày làm như nhau). Nếu muốn hoàn thành 1.800 sản phẩm thì cần bao nhiêu ngày?", solution: "Số sản phẩm mỗi ngày = 960:8 = 120.\nSố ngày cần = 1.800:120 = 15 ngày.", answer: "15 ngày" },
          { prompt: "Tính bằng cách hợp lý: 125 × 8 × 4", solution: "125×8 = 1.000.\n1.000×4 = 4.000.", answer: "4.000" },
          { prompt: "Một phép chia có thương là 45, số chia là 12, số dư là 7. Tìm số bị chia.", solution: "Số bị chia = thương×số chia + số dư = 45×12+7 = 540+7 = 547.", answer: "547" },
          { prompt: "Tính nhanh: 25×37×4", solution: "= (25×4)×37 = 100×37 = 3.700.", answer: "3.700" },
          { prompt: "Một số nhân với 8 rồi cộng 15 thì được 111. Tìm số đó.", solution: "Gọi số=x: 8x+15=111 → 8x=96 → x=12.", answer: "12" },
          { prompt: "Tìm số bị chia biết số chia là 25, thương là 36, và số dư là số dư lớn nhất có thể.", solution: "Số dư lớn nhất khi chia cho 25 là 24.\nSố bị chia = 25×36+24 = 900+24 = 924.", answer: "924" },
          { prompt: "Một đội 156 người được chia thành các nhóm, mỗi nhóm 12 người. Hỏi chia được bao nhiêu nhóm, dư mấy người?", solution: "156:12 = 13 nhóm, dư 0 (vì 12×13=156).", answer: "13 nhóm, không dư" },
          { prompt: "Tính bằng cách hợp lý: 15×23+15×77", solution: "= 15×(23+77) = 15×100 = 1.500.", answer: "1.500" },
          { prompt: "Một xe chở 45 bao gạo, mỗi bao 50kg. Nếu đổi sang bao 25kg thì cần bao nhiêu bao?", solution: "Tổng gạo = 45×50 = 2.250kg.\nSố bao 25kg cần = 2.250:25 = 90 bao.", answer: "90 bao" },
          { prompt: "Tìm x biết: x : 6 = 125 (dư 3).", solution: "x = 6×125+3 = 750+3 = 753.", answer: "753" },
        ],
      },
      {
        id: "don-vi-do-4",
        title: "Đơn vị đo khối lượng, diện tích, thời gian",
        questions: [
          { prompt: "1 tấn = ? kg", options: ["1000", "100", "10000", "10"], correct: 0, explain: "1 tấn = 1000kg." },
          { prompt: "1 yến = ? kg", options: ["10", "100", "1000", "1"], correct: 0, explain: "1 yến = 10kg." },
          { prompt: "1m² = ? dm²", options: ["100", "10", "1000", "10000"], correct: 0, explain: "1m² = 100dm²." },
          { prompt: "1 thế kỷ = ? năm", options: ["100", "10", "1000", "50"], correct: 0, explain: "1 thế kỷ = 100 năm." },
          { prompt: "1 giờ = ? phút", options: ["60", "100", "24", "30"], correct: 0, explain: "1 giờ = 60 phút." },
          { prompt: "3 tạ = ? kg", options: ["300", "3000", "30", "30000"], correct: 0, explain: "1 tạ = 100kg, nên 3 tạ = 300kg." },
        ],
        exercises: [
          { prompt: "Đổi 5 tấn 300kg ra kg.", solution: "5 tấn = 5.000kg. 5.000+300 = 5.300kg.", answer: "5.300kg" },
          { prompt: "Một xe tải chở được 2 tấn hàng. Hỏi bằng bao nhiêu tạ?", solution: "1 tấn = 10 tạ, nên 2 tấn = 20 tạ.", answer: "20 tạ" },
          { prompt: "Đổi 4m² 25dm² ra dm².", solution: "4m² = 400dm². 400+25 = 425dm².", answer: "425dm²" },
          { prompt: "Một căn phòng hình chữ nhật dài 6m, rộng 4m. Tính diện tích theo m².", solution: "Diện tích = dài×rộng = 6×4 = 24m².", answer: "24m²" },
          { prompt: "Đổi 2 thế kỷ ra năm.", solution: "1 thế kỷ = 100 năm, nên 2 thế kỷ = 200 năm.", answer: "200 năm" },
          { prompt: "Bác Hồ sinh năm 1890, mất năm 1969. Bác Hồ sống được bao nhiêu năm?", solution: "1969-1890 = 79 năm.", answer: "79 năm" },
          { prompt: "Đổi 3 giờ 15 phút ra phút.", solution: "3 giờ = 180 phút. 180+15 = 195 phút.", answer: "195 phút" },
          { prompt: "Một bao gạo nặng 5 yến. Hỏi nặng bao nhiêu kg?", solution: "1 yến = 10kg, nên 5 yến = 50kg.", answer: "50kg" },
          { prompt: "Một khu vườn hình vuông cạnh 20m. Tính diện tích theo m².", solution: "Diện tích = cạnh×cạnh = 20×20 = 400m².", answer: "400m²" },
          { prompt: "Đổi 7 tạ 50kg ra kg.", solution: "7 tạ = 700kg. 700+50 = 750kg.", answer: "750kg" },
        ],
        advanced: [
          { prompt: "Một bao gạo nặng 4 yến 5kg. Hỏi 6 bao như vậy nặng bao nhiêu kg?", solution: "1 bao = 4×10+5 = 45kg.\n6 bao = 45×6 = 270kg.", answer: "270kg" },
          { prompt: "Một mảnh đất hình chữ nhật dài 15m, rộng 8m. Người ta muốn đổ bê tông toàn bộ diện tích với giá 150.000đ/m². Tính số tiền cần chi.", solution: "Diện tích = 15×8 = 120m².\nSố tiền = 120×150.000 = 18.000.000đ.", answer: "18.000.000đ" },
          { prompt: "Một người sinh năm 1985. Hỏi năm 2025 người đó bao nhiêu tuổi?", solution: "2025-1985 = 40 tuổi.", answer: "40 tuổi" },
          { prompt: "Một khu vườn hình chữ nhật dài 15m, rộng 8m. Tính diện tích theo m² rồi đổi ra dm² (1m²=100dm²).", solution: "Diện tích = 15×8 = 120m² = 12.000dm².", answer: "12.000dm²" },
          { prompt: "Một người đi từ nhà lúc 6 giờ 45 phút, đến trường lúc 7 giờ 15 phút. Hỏi đi mất bao lâu?", solution: "Từ 6 giờ 45 phút đến 7 giờ 15 phút = 30 phút.", answer: "30 phút" },
          { prompt: "Đổi 3 tấn 4 tạ 5 yến ra kg.", solution: "3 tấn=3.000kg. 4 tạ=400kg. 5 yến=50kg.\nTổng = 3.000+400+50 = 3.450kg.", answer: "3.450kg" },
          { prompt: "Một bể nước hình chữ nhật dài 2m, rộng 1m5dm. Tính diện tích đáy theo dm².", solution: "Đổi: 2m=20dm, 1m5dm=15dm.\nDiện tích = 20×15 = 300dm².", answer: "300dm²" },
          { prompt: "So sánh: 2 giờ 30 phút và 150 phút.", solution: "2 giờ 30 phút = 120+30 = 150 phút.\nVậy 2 giờ 30 phút = 150 phút.", answer: "Bằng nhau" },
          { prompt: "Một mảnh đất hình vuông có chu vi 48m. Tính diện tích theo m².", solution: "Cạnh = 48:4 = 12m.\nDiện tích = 12×12 = 144m².", answer: "144m²" },
          { prompt: "Đổi 2 thế kỷ 5 năm ra năm.", solution: "2 thế kỷ = 200 năm.\nTổng = 200+5 = 205 năm.", answer: "205 năm" },
        ],
      },
      {
        id: "hinh-hoc-4",
        title: "Đường thẳng vuông góc, song song & hình bình hành, hình thoi",
        questions: [
          { prompt: "Góc nhọn có số đo như thế nào?", options: ["Nhỏ hơn 90°", "Bằng 90°", "Lớn hơn 90°", "Bằng 180°"], correct: 0, explain: "Góc nhọn có số đo nhỏ hơn 90°." },
          { prompt: "Hai đường thẳng vuông góc tạo thành góc bao nhiêu độ?", options: ["90°", "180°", "45°", "60°"], correct: 0, explain: "Hai đường thẳng vuông góc tạo thành góc 90°." },
          { prompt: "Hình bình hành có mấy cặp cạnh đối song song?", options: ["2 cặp", "1 cặp", "3 cặp", "0 cặp"], correct: 0, explain: "Hình bình hành có 2 cặp cạnh đối song song và bằng nhau." },
          { prompt: "Hình thoi có đặc điểm gì về các cạnh?", options: ["4 cạnh bằng nhau", "4 góc vuông", "2 cạnh bằng nhau", "Không có cạnh bằng nhau"], correct: 0, explain: "Hình thoi có 4 cạnh bằng nhau." },
          { prompt: "Hai đường thẳng song song có đặc điểm gì?", options: ["Không bao giờ cắt nhau", "Luôn cắt nhau", "Vuông góc với nhau", "Trùng nhau"], correct: 0, explain: "Hai đường thẳng song song không bao giờ cắt nhau dù kéo dài." },
          { prompt: "Góc bẹt có số đo bao nhiêu độ?", options: ["180°", "90°", "360°", "270°"], correct: 0, explain: "Góc bẹt có số đo bằng 180°." },
        ],
        exercises: [
          { prompt: "Nêu cách vẽ hai đường thẳng vuông góc đi qua một điểm cho trước.", solution: "Dùng ê ke đặt một cạnh trùng với đường thẳng đã cho, vẽ đường thẳng theo cạnh vuông góc còn lại của ê ke, đi qua điểm đó.", answer: "Dùng ê ke đặt một cạnh trùng với đường thẳng đã cho, vẽ đường thẳng theo cạnh vuông góc còn lại của ê ke, đi qua điểm đó" },
          { prompt: "Một hình bình hành có cạnh đáy 8cm, cạnh bên 5cm. Tính chu vi.", solution: "Chu vi = 2×(8+5) = 26cm.", answer: "26cm" },
          { prompt: "Hình thoi có cạnh 6cm. Tính chu vi.", solution: "Chu vi hình thoi = 4×cạnh = 4×6 = 24cm.", answer: "24cm" },
          { prompt: "Kể tên các cặp cạnh song song trong hình chữ nhật ABCD.", solution: "AB//CD và AD//BC.", answer: "AB//CD và AD//BC" },
          { prompt: "Một góc có số đo 120°. Đây là góc gì?", solution: "Vì 90°<120°<180°, đây là góc tù.", answer: "Vì 90°<120°<180°, đây là góc tù" },
          { prompt: "Nêu cách vẽ hai đường thẳng song song cách nhau 3cm.", solution: "Vẽ đường thẳng thứ nhất, dùng ê ke vẽ đoạn vuông góc dài 3cm từ đường đó, rồi vẽ đường thẳng thứ hai đi qua đầu đoạn vuông góc, song song với đường thứ nhất.", answer: "3cm" },
          { prompt: "Hình bình hành ABCD có góc A=60°. Tính góc B (kề với góc A).", solution: "Hai góc kề trong hình bình hành bù nhau: góc B = 180°-60° = 120°.", answer: "120°" },
          { prompt: "Một sân chơi hình bình hành có đáy 15m, chiều cao 8m. Tính diện tích (S=đáy×cao).", solution: "S = 15×8 = 120m².", answer: "120m²" },
          { prompt: "Hình thoi có diện tích 24cm², một đường chéo 6cm. Tính đường chéo còn lại (biết S=d1×d2:2).", solution: "24 = 6×d2:2 → d2 = 24×2:6 = 8cm.", answer: "8cm" },
          { prompt: "Nêu 2 ví dụ về vật có hai đường thẳng vuông góc trong thực tế.", solution: "Ví dụ: góc bảng lớp học, góc quyển vở, khung cửa sổ hình chữ nhật.", answer: "góc bảng lớp học, góc quyển vở, khung cửa sổ hình chữ nhật" },
        ],
        advanced: [
          { prompt: "Một hình bình hành có diện tích 96cm², chiều cao 8cm. Tính độ dài đáy.", solution: "Đáy = diện tích : chiều cao = 96:8 = 12cm.", answer: "12cm" },
          { prompt: "Một hình thoi có cạnh 7cm. Tính chu vi.", solution: "Chu vi hình thoi = 4×cạnh = 4×7 = 28cm.", answer: "28cm" },
          { prompt: "Trong hình chữ nhật ABCD, hai đường chéo AC và BD cắt nhau tại O (trung điểm mỗi đường chéo). Biết AC=10cm, tính OA.", solution: "Vì O là trung điểm AC: OA = AC:2 = 10:2 = 5cm.", answer: "5cm" },
          { prompt: "Một hình bình hành có đáy 15cm, chiều cao bằng 2/3 đáy. Tính diện tích.", solution: "Chiều cao = 15×2/3 = 10cm.\nDiện tích = 15×10 = 150cm².", answer: "150cm²" },
          { prompt: "Một hình chữ nhật có chiều dài gấp 3 lần chiều rộng, chu vi 64cm. Tính diện tích.", solution: "Nửa chu vi=32. Gọi rộng=x, dài=3x: x+3x=32 → x=8.\nRộng=8cm, dài=24cm. Diện tích=8×24=192cm².", answer: "192cm²" },
          { prompt: "Vẽ 2 đường thẳng song song cách nhau 4cm, vẽ đường thẳng thứ 3 vuông góc với cả 2 đường. Tính độ dài đoạn nằm giữa 2 đường song song.", solution: "Đoạn đó có độ dài bằng khoảng cách 2 đường song song = 4cm.", answer: "4cm" },
          { prompt: "Một khu đất hình bình hành có diện tích 360m², chiều cao 15m. Tính độ dài đáy.", solution: "Đáy = 360:15 = 24m.", answer: "24m" },
          { prompt: "Tìm số góc vuông trong một hình chữ nhật.", solution: "Hình chữ nhật có 4 góc vuông.", answer: "4 góc" },
          { prompt: "Một hình vuông có chu vi bằng chu vi hình chữ nhật dài 20cm, rộng 12cm. Tính diện tích hình vuông.", solution: "Chu vi hcn = 2×(20+12) = 64cm.\nCạnh hình vuông = 64:4 = 16cm. Diện tích = 16×16 = 256cm².", answer: "256cm²" },
          { prompt: "Cho hình thoi có 2 đường chéo lần lượt 12cm và 16cm. Tính diện tích (S=d1×d2:2).", solution: "S = 12×16:2 = 96cm².", answer: "96cm²" },
        ],
      },
      {
        id: "thong-ke-xac-suat-4",
        title: "Làm quen với yếu tố thống kê, xác suất",
        questions: [
          { prompt: "Biểu đồ cột thường dùng để làm gì?", options: ["So sánh số liệu giữa các đối tượng", "Chỉ để trang trí", "Thay thế phép tính", "Không có tác dụng gì"], correct: 0, explain: "Biểu đồ cột giúp so sánh trực quan số liệu giữa các đối tượng." },
          { prompt: "Trong hộp chỉ có bóng màu đỏ, lấy ngẫu nhiên 1 quả thì chắc chắn được màu gì?", options: ["Màu đỏ", "Màu xanh", "Màu vàng", "Không xác định được"], correct: 0, explain: "Vì hộp chỉ có bóng đỏ nên chắc chắn lấy được bóng đỏ." },
          { prompt: "Gieo 1 đồng xu, có mấy khả năng xảy ra?", options: ["2", "1", "3", "4"], correct: 0, explain: "Đồng xu có 2 mặt: sấp và ngửa, nên có 2 khả năng." },
          { prompt: "Một bảng số liệu cho biết số học sinh giỏi từng lớp: 4A: 10, 4B: 8, 4C: 12. Lớp nào có nhiều học sinh giỏi nhất?", options: ["4C", "4A", "4B", "Không xác định"], correct: 0, explain: "So sánh 3 số: 12 là lớn nhất, ứng với lớp 4C." },
          { prompt: "Dãy số liệu là gì?", options: ["Một dãy các số liệu thu thập được theo thứ tự", "Một phép tính", "Một hình vẽ", "Không có ý nghĩa gì"], correct: 0, explain: "Dãy số liệu là các số liệu được thu thập và sắp xếp theo một thứ tự nhất định." },
          { prompt: "Một sự kiện chắc chắn xảy ra thì khả năng xảy ra của nó như thế nào?", options: ["Chắc chắn xảy ra", "Không thể xảy ra", "Có thể xảy ra hoặc không", "Không xác định"], correct: 0, explain: "Sự kiện chắc chắn luôn xảy ra trong mọi trường hợp." },
        ],
        exercises: [
          { prompt: "Một lớp có 30 học sinh, khảo sát môn thể thao yêu thích: 12 bóng đá, 10 cầu lông, 8 bơi. Môn nào được yêu thích nhất?", solution: "So sánh 3 số: 12>10>8, nên môn bóng đá được yêu thích nhất.", answer: "8," },
          { prompt: "Trong hộp có 5 viên bi đỏ và 5 viên bi xanh. Lấy 1 viên, khả năng lấy được bi đỏ hay bi xanh cao hơn?", solution: "Khả năng bằng nhau, vì mỗi loại đều có 5 viên trong tổng 10 viên.", answer: "10" },
          { prompt: "Bảng ghi số cây trồng được của các tổ: Tổ 1: 15, Tổ 2: 20, Tổ 3: 18. Tính tổng số cây cả 3 tổ trồng được.", solution: "15+20+18 = 53 cây.", answer: "53 cây" },
          { prompt: "Trong hộp chỉ toàn bóng màu đỏ, có thể lấy được bóng màu xanh không?", solution: "Không thể, vì hộp không có bóng màu xanh.", answer: "Không thể, vì hộp không có bóng màu xanh" },
          { prompt: "Một cuộc khảo sát về màu áo yêu thích của 20 bạn: 8 bạn thích xanh, 7 bạn thích đỏ, 5 bạn thích vàng. Tính số bạn thích đỏ hoặc vàng.", solution: "7+5 = 12 bạn.", answer: "12 bạn" },
          { prompt: "Gieo 1 con xúc xắc, số lớn nhất có thể xuất hiện là bao nhiêu?", solution: "Xúc xắc có 6 mặt, số lớn nhất là 6.", answer: "Xúc xắc có 6 mặt, số lớn nhất là 6" },
          { prompt: "Biểu đồ cột cho biết nhiệt độ 4 ngày: 25°C, 28°C, 24°C, 30°C. Ngày nào nóng nhất?", solution: "So sánh 4 số, số lớn nhất là 30°C, ứng với ngày thứ 4.", answer: "4." },
          { prompt: "Một hộp có 10 quả bóng đều màu xanh. Lấy 1 quả, có thể lấy được bóng đỏ không?", solution: "Không thể, vì hộp không có bóng màu đỏ.", answer: "Không thể, vì hộp không có bóng màu đỏ" },
          { prompt: "Trong lớp có 15 bạn nam, 15 bạn nữ. Chọn ngẫu nhiên 1 bạn, khả năng chọn được bạn nam so với bạn nữ như thế nào?", solution: "Khả năng bằng nhau, vì số nam và nữ bằng nhau.", answer: "Khả năng bằng nhau, vì số nam và nữ bằng nhau" },
          { prompt: "Bảng thống kê số sách đọc trong tuần của 5 bạn: 3, 5, 2, 4, 6 quyển. Tính tổng số sách 5 bạn đã đọc.", solution: "3+5+2+4+6 = 20 quyển.", answer: "20 quyển" },
        ],
        advanced: [
          { prompt: "Biểu đồ cột cho biết số cây trồng của 4 lớp: 4A 25 cây, 4B 30 cây, 4C 22 cây, 4D 28 cây. Tính trung bình mỗi lớp trồng bao nhiêu cây.", solution: "Tổng = 25+30+22+28 = 105 cây.\nTrung bình = 105:4 ≈ 26 cây (làm tròn).", answer: "105:4 ≈ 26 cây (làm tròn)" },
          { prompt: "Trong hộp có 10 quả bóng: 3 đỏ, 4 xanh, 3 vàng. Lấy 1 quả, khả năng lấy được màu nào cao nhất?", solution: "Màu xanh có 4 quả, nhiều nhất trong 3 màu, nên khả năng lấy được màu xanh cao nhất.", answer: "3 m" },
          { prompt: "Một lớp có 35 học sinh: 20 bạn thích Toán, 15 bạn thích Tiếng Việt (không trùng nhau). Hỏi có bao nhiêu bạn thích môn khác?", solution: "Số bạn thích môn khác = 35-20-15 = 0 (không còn bạn nào, tất cả đã thích Toán hoặc Tiếng Việt).", answer: "0" },
          { prompt: "Biểu đồ cột cho biết số sách đọc của 4 bạn trong tháng: An 5, Bình 8, Chi 6, Dũng 7. Tính trung bình mỗi bạn đọc bao nhiêu quyển.", solution: "Tổng = 5+8+6+7 = 26. Trung bình = 26:4 = 6,5 quyển.", answer: "6,5 quyển" },
          { prompt: "Trong hộp có 10 quả bóng, 6 đỏ 4 xanh. Lấy ngẫu nhiên, khả năng lấy được màu nào cao hơn?", solution: "Vì 6>4, khả năng lấy được màu đỏ cao hơn.", answer: "Màu đỏ" },
          { prompt: "Một lớp 40 học sinh, 15 bạn thích bóng đá, 12 bạn thích bơi, còn lại thích môn khác. Hỏi bao nhiêu bạn thích môn khác?", solution: "40-15-12 = 13 bạn.", answer: "13 bạn" },
          { prompt: "Bảng số liệu ghi nhiệt độ 5 ngày: 28, 30, 27, 29, 31°C. Ngày nào nóng nhất, ngày nào mát nhất?", solution: "Nóng nhất là ngày có 31°C. Mát nhất là ngày có 27°C.", answer: "nóng nhất 31°C, mát nhất 27°C" },
          { prompt: "Trong 20 lần tung đồng xu, có 12 lần ngửa. Hỏi có bao nhiêu lần sấp?", solution: "20-12 = 8 lần.", answer: "8 lần" },
          { prompt: "Một hộp chỉ có toàn bi màu vàng. Lấy ngẫu nhiên 1 viên, có chắc chắn là màu vàng không?", solution: "Chắc chắn, vì hộp chỉ có bi màu vàng.", answer: "Chắc chắn" },
          { prompt: "Bảng thống kê điểm 6 bài kiểm tra: 7, 8, 9, 6, 10, 8. Tính tổng điểm.", solution: "7+8+9+6+10+8 = 48 điểm.", answer: "48 điểm" },
        ],
      },
      {
        id: "phan-so-4",
        title: "Phân số",
        questions: [
          { prompt: "Phân số 3/4 có tử số là bao nhiêu?", options: ["3", "4", "7", "1"], correct: 0, explain: "Trong phân số 3/4, số trên (3) là tử số." },
          { prompt: "Phân số nào bằng phân số 1/2?", options: ["2/4", "1/4", "3/4", "2/3"], correct: 0, explain: "2/4 rút gọn được 1/2 (chia cả tử mẫu cho 2)." },
          { prompt: "So sánh 2/5 và 3/5, phân số nào lớn hơn?", options: ["3/5", "2/5", "Bằng nhau", "Không so sánh được"], correct: 0, explain: "Hai phân số cùng mẫu, phân số nào có tử lớn hơn thì lớn hơn: 3/5>2/5." },
          { prompt: "Rút gọn phân số 6/9.", options: ["2/3", "3/2", "6/9", "1/3"], correct: 0, explain: "Chia cả tử và mẫu cho 3: 6/9 = 2/3." },
          { prompt: "Phân số 5/5 bằng số nào?", options: ["1", "5", "0", "10"], correct: 0, explain: "Khi tử số bằng mẫu số, phân số đó bằng 1." },
          { prompt: "Muốn quy đồng mẫu số hai phân số 1/3 và 1/4, mẫu số chung có thể là bao nhiêu?", options: ["12", "7", "3", "4"], correct: 0, explain: "Mẫu số chung nhỏ nhất của 3 và 4 là 12." },
        ],
        exercises: [
          { prompt: "Rút gọn phân số 12/16.", solution: "Chia cả tử và mẫu cho 4: 12/16 = 3/4.", answer: "3/4" },
          { prompt: "So sánh hai phân số 3/7 và 4/7.", solution: "Cùng mẫu số, tử số lớn hơn thì phân số lớn hơn: 4/7 > 3/7.", answer: "4/7 > 3/7" },
          { prompt: "Quy đồng mẫu số hai phân số 1/2 và 2/3.", solution: "Mẫu số chung: 6. 1/2 = 3/6. 2/3 = 4/6.", answer: "4/6" },
          { prompt: "Một lớp có 40 học sinh, 3/8 số học sinh là nữ. Tính số học sinh nữ.", solution: "40 × 3/8 = 15 học sinh.", answer: "15 học sinh" },
          { prompt: "Một hình được chia làm 8 phần bằng nhau, tô màu 5 phần. Viết phân số chỉ phần tô màu.", solution: "5/8.", answer: "5/8" },
          { prompt: "Rút gọn phân số 15/20.", solution: "Chia cả tử và mẫu cho 5: 15/20 = 3/4.", answer: "3/4" },
          { prompt: "So sánh 5/6 và 7/8 (quy đồng mẫu số 24).", solution: "5/6 = 20/24, 7/8 = 21/24. Vậy 7/8 > 5/6.", answer: "21/24. Vậy 7/8 > 5/6" },
          { prompt: "Viết phân số 3/4 dưới dạng phân số có mẫu số là 12.", solution: "3/4 = 9/12 (nhân cả tử và mẫu với 3).", answer: "9/12 (nhân cả tử và mẫu với 3)" },
          { prompt: "Một đoạn dây dài 1m được cắt thành 5 đoạn bằng nhau. Mỗi đoạn dài bao nhiêu phần của mét?", solution: "Mỗi đoạn dài 1/5 mét.", answer: "Mỗi đoạn dài 1/5 mét" },
          { prompt: "Sắp xếp các phân số sau theo thứ tự tăng dần: 1/2, 1/4, 3/4", solution: "So sánh: 1/4 < 1/2 < 3/4.", answer: "So sánh: 1/4 < 1/2 < 3/4" },
        ],
        advanced: [
          { prompt: "So sánh hai phân số 5/8 và 3/4 (quy đồng mẫu số).", solution: "Mẫu số chung 8: 3/4 = 6/8.\nSo sánh 5/8 và 6/8: vì 5<6 nên 5/8 < 3/4.", answer: "So sánh 5/8 và 6/8: vì 5<6 nên 5/8 < 3/4" },
          { prompt: "Một thửa ruộng, buổi sáng cày được 2/3 thửa, buổi chiều cày thêm 1/6 thửa nữa. Hỏi còn lại bao nhiêu phần thửa ruộng chưa cày?", solution: "Đã cày = 2/3+1/6 = 4/6+1/6 = 5/6.\nCòn lại = 1-5/6 = 1/6.", answer: "1/6" },
          { prompt: "Rút gọn phân số 24/36 về phân số tối giản.", solution: "ƯCLN(24,36)=12. Chia cả tử và mẫu cho 12: 24/36 = 2/3.", answer: "2/3" },
          { prompt: "So sánh 3/4 và 5/6 (quy đồng mẫu số 12).", solution: "3/4=9/12. 5/6=10/12.\nVì 9<10 nên 3/4<5/6.", answer: "3/4 < 5/6" },
          { prompt: "Một số sách, đã đọc 2/5 số sách, còn lại 30 quyển. Hỏi có tất cả bao nhiêu quyển sách?", solution: "30 quyển ứng với 1-2/5=3/5 số sách.\nTổng số sách = 30 : 3 × 5 = 50 quyển.", answer: "50 quyển" },
          { prompt: "Viết phân số bằng 2/3 có mẫu số là 15.", solution: "2/3 = 10/15 (nhân cả tử và mẫu với 5).", answer: "10/15" },
          { prompt: "Sắp xếp theo thứ tự giảm dần: 1/2, 2/3, 1/4", solution: "2/3 > 1/2 > 1/4.", answer: "2/3, 1/2, 1/4" },
          { prompt: "Một hình chữ nhật chia thành 6 phần bằng nhau, tô màu 4 phần. Viết phân số chỉ phần tô màu (rút gọn).", solution: "4/6 = 2/3 (rút gọn cho 2).", answer: "2/3" },
          { prompt: "Tìm một phân số lớn hơn 1/2 và nhỏ hơn 3/4 (mẫu số là 8).", solution: "1/2=4/8, 3/4=6/8. Vậy 5/8 thỏa mãn (nằm giữa).", answer: "5/8" },
          { prompt: "Rút gọn phân số 18/24.", solution: "ƯCLN(18,24)=6. 18/24 = 3/4.", answer: "3/4" },
        ],
      },
      {
        id: "phep-tinh-phan-so-4",
        title: "Phép cộng, trừ, nhân, chia phân số",
        questions: [
          { prompt: "1/3 + 1/3 = ?", options: ["2/3", "2/6", "1/3", "1/6"], correct: 0, explain: "Cùng mẫu, cộng tử: 1/3+1/3 = 2/3." },
          { prompt: "3/4 − 1/4 = ?", options: ["1/2", "1/4", "3/4", "1"], correct: 0, explain: "Cùng mẫu, trừ tử: 3/4-1/4 = 2/4 = 1/2." },
          { prompt: "2/5 × 3 = ?", options: ["6/5", "5/6", "2/15", "6/15"], correct: 0, explain: "Nhân phân số với số tự nhiên: 2/5×3 = 6/5." },
          { prompt: "1/2 × 1/3 = ?", options: ["1/6", "2/5", "1/5", "2/6"], correct: 0, explain: "Nhân tử với tử, mẫu với mẫu: 1×1/(2×3) = 1/6." },
          { prompt: "3/4 : 1/2 = ?", options: ["3/2", "3/8", "1/2", "3/4"], correct: 0, explain: "Chia phân số bằng nhân với nghịch đảo: 3/4×2/1 = 6/4 = 3/2." },
          { prompt: "5/6 − 1/6 = ?", options: ["2/3", "1/3", "1/6", "5/6"], correct: 0, explain: "Cùng mẫu, trừ tử: 5/6-1/6 = 4/6 = 2/3." },
        ],
        exercises: [
          { prompt: "Tính: 2/5 + 1/5", solution: "Cùng mẫu, cộng tử: 2/5+1/5 = 3/5.", answer: "3/5" },
          { prompt: "Tính: 7/8 − 3/8", solution: "Cùng mẫu, trừ tử: 7/8-3/8 = 4/8 = 1/2.", answer: "1/2" },
          { prompt: "Tính: 1/4 × 2/3", solution: "Nhân tử với tử, mẫu với mẫu: 1×2/(4×3) = 2/12 = 1/6.", answer: "1/6" },
          { prompt: "Tính: 3/5 : 2", solution: "3/5 : 2 = 3/5×1/2 = 3/10.", answer: "3/10" },
          { prompt: "Một mảnh vườn dùng 2/5 diện tích để trồng rau, phần còn lại trồng hoa. Hỏi phần trồng hoa chiếm bao nhiêu?", solution: "Phần trồng hoa = 1 - 2/5 = 3/5.", answer: "3/5" },
          { prompt: "Tính: 1/2 + 1/3 (quy đồng mẫu số 6)", solution: "1/2=3/6, 1/3=2/6. Tổng = 3/6+2/6 = 5/6.", answer: "5/6" },
          { prompt: "Tính: 5/6 × 3/5", solution: "5×3/(6×5) = 15/30 = 1/2.", answer: "1/2" },
          { prompt: "Một bể nước chứa 3/4 bể, người ta dùng hết 1/4 bể. Hỏi còn lại bao nhiêu phần bể?", solution: "3/4 - 1/4 = 2/4 = 1/2 bể.", answer: "1/2 bể" },
          { prompt: "Tính: 4/9 : 2/3", solution: "4/9 × 3/2 = 12/18 = 2/3.", answer: "2/3" },
          { prompt: "Một số gấp 4 lần 1/8 là bao nhiêu?", solution: "4 × 1/8 = 4/8 = 1/2.", answer: "1/2" },
        ],
        advanced: [
          { prompt: "Tính: 3/4 × 2/5 + 1/10", solution: "3/4×2/5 = 6/20 = 3/10.\n3/10+1/10 = 4/10 = 2/5.", answer: "2/5" },
          { prompt: "Một số gấp 5 lần 2/3 là bao nhiêu?", solution: "5 × 2/3 = 10/3.", answer: "10/3" },
          { prompt: "Tìm x biết: x × 2/3 = 4/9", solution: "x = (4/9) : (2/3) = 4/9 × 3/2 = 12/18 = 2/3.", answer: "2/3" },
          { prompt: "Tính: 3/5 − 1/5 + 2/5", solution: "(3-1+2)/5 = 4/5.", answer: "4/5" },
          { prompt: "Một thửa ruộng, cày được 1/3 vào buổi sáng, 1/4 vào buổi chiều. Hỏi cả ngày cày được bao nhiêu phần?", solution: "1/3+1/4 = 4/12+3/12 = 7/12.", answer: "7/12" },
          { prompt: "Tính: 2/3 × 3/4", solution: "(2×3)/(3×4) = 6/12 = 1/2.", answer: "1/2" },
          { prompt: "Một số gấp 3 lần 2/9 là bao nhiêu?", solution: "3 × 2/9 = 6/9 = 2/3.", answer: "2/3" },
          { prompt: "Tính: 5/6 : 1/3", solution: "5/6 × 3/1 = 15/6 = 5/2.", answer: "5/2" },
          { prompt: "Một bể nước chứa 3/4 bể, dùng hết 1/2 số nước đó. Hỏi còn lại bao nhiêu phần bể?", solution: "Dùng hết = 1/2×3/4 = 3/8.\nCòn lại = 3/4-3/8 = 6/8-3/8 = 3/8.", answer: "3/8" },
          { prompt: "Tính: 1/2 + 1/3 + 1/6", solution: "MSC=6: 3/6+2/6+1/6 = 6/6 = 1.", answer: "1" },
        ],
      },
    ],
    examSources: [],
  },
  {
    id: 5,
    label: "Lớp 5",
    topics: [
      {
        id: "so-thap-phan-5",
        title: "Số thập phân",
        questions: [
          { prompt: "Số 3,25 đọc là gì?", options: ["Ba phẩy hai mươi lăm", "Ba mươi hai phẩy năm", "Ba phẩy hai năm", "Ba trăm hai mười lăm"], correct: 0, explain: "Đọc phần nguyên trước, sau đó đọc \"phẩy\" rồi đọc phần thập phân: ba phẩy hai mươi lăm." },
          { prompt: "Trong số 12,45, chữ số 4 thuộc hàng nào?", options: ["Phần mười", "Phần trăm", "Đơn vị", "Chục"], correct: 0, explain: "Chữ số ngay sau dấu phẩy là hàng phần mười." },
          { prompt: "5/10 viết dưới dạng số thập phân là?", options: ["0,5", "5,0", "0,05", "50"], correct: 0, explain: "5/10 = 0,5." },
          { prompt: "So sánh 3,7 và 3,65, số nào lớn hơn?", options: ["3,7", "3,65", "Bằng nhau", "Không so sánh được"], correct: 0, explain: "3,7 = 3,70 > 3,65." },
          { prompt: "Viết phân số 3/100 dưới dạng số thập phân.", options: ["0,03", "0,3", "3,00", "0,003"], correct: 0, explain: "3/100 = 0,03." },
          { prompt: "Số 7,08 có bao nhiêu chữ số ở phần thập phân?", options: ["2", "1", "3", "0"], correct: 0, explain: "Phần thập phân của 7,08 là \"08\", có 2 chữ số." },
        ],
        exercises: [
          { prompt: "Viết các số sau theo thứ tự từ bé đến lớn: 3,5; 3,05; 3,55; 3,505", solution: "So sánh từng hàng: 3,05 < 3,505 < 3,5 < 3,55.", answer: "3,05 < 3,505 < 3,5 < 3,55" },
          { prompt: "Đổi 2,5m ra cm.", solution: "2,5m = 2m 50cm = 250cm.", answer: "250cm" },
          { prompt: "Viết số thập phân biểu thị: 4 đơn vị, 3 phần mười, 5 phần trăm.", solution: "4,35.", answer: "4,35" },
          { prompt: "Tính: 3,25 + 1,5", solution: "3,25 + 1,5 = 4,75.", answer: "4,75" },
          { prompt: "Làm tròn số 5,674 đến hàng phần mười.", solution: "Chữ số hàng phần trăm là 7 (≥5), làm tròn lên: 5,674 ≈ 5,7.", answer: "5,674 ≈ 5,7" },
          { prompt: "Đổi 3kg 250g ra kg dưới dạng số thập phân.", solution: "3kg 250g = 3,25kg.", answer: "3,25kg" },
          { prompt: "So sánh 0,7 và 7/10.", solution: "7/10 = 0,7, nên hai số này bằng nhau.", answer: "0,7, nên hai số này bằng nhau" },
          { prompt: "Viết số thập phân 12,5 dưới dạng hỗn số.", solution: "12,5 = 12 + 5/10 = 12 1/2.", answer: "12 1/2" },
          { prompt: "Một mảnh vải dài 4,25m. Viết độ dài đó dưới dạng phân số thập phân (theo mét).", solution: "4,25m = 4 25/100 m = 4 1/4 m.", answer: "4 1/4 m" },
          { prompt: "Tính: 10 − 3,25", solution: "10 - 3,25 = 6,75.", answer: "6,75" },
        ],
        advanced: [
          { prompt: "Viết các số sau theo thứ tự giảm dần: 4,05; 4,5; 4,505; 4,055", solution: "Đổi về cùng số chữ số thập phân: 4,050; 4,500; 4,505; 4,055.\nGiảm dần: 4,505 > 4,5 > 4,055 > 4,05.", answer: "Giảm dần: 4,505 > 4,5 > 4,055 > 4,05" },
          { prompt: "Một số thập phân khi nhân với 100 được kết quả là 350. Tìm số đó.", solution: "Số đó = 350:100 = 3,5.", answer: "3,5" },
          { prompt: "Tìm một số thập phân có 2 chữ số thập phân nằm giữa 3,4 và 3,5.", solution: "Ví dụ: 3,45 (có nhiều đáp án đúng khác, miễn nằm giữa 3,40 và 3,50).", answer: "3,50" },
          { prompt: "Sắp xếp theo thứ tự tăng dần: 3,05; 3,5; 3,15; 3,505", solution: "3,05 < 3,15 < 3,5 < 3,505.", answer: "3,05; 3,15; 3,5; 3,505" },
          { prompt: "Tìm số thập phân x biết x×10=45,6.", solution: "x = 45,6:10 = 4,56.", answer: "4,56" },
          { prompt: "Viết số thập phân biểu thị: 5 đơn vị, 7 phần trăm.", solution: "5,07.", answer: "5,07" },
          { prompt: "Một số thập phân có phần nguyên 12, phần thập phân 2 chữ số có tổng bằng 9, chữ số hàng phần mười gấp đôi chữ số hàng phần trăm. Tìm số đó.", solution: "Gọi hàng phần trăm=x, hàng phần mười=2x: 2x+x=9 → x=3.\nHàng phần mười=6, hàng phần trăm=3. Số đó: 12,63.", answer: "12,63" },
          { prompt: "So sánh: 7/10 và 0,68.", solution: "7/10 = 0,7 > 0,68.", answer: "7/10 > 0,68" },
          { prompt: "Viết số đo 3m 5cm dưới dạng số thập phân theo mét.", solution: "3m5cm = 3,05m.", answer: "3,05m" },
          { prompt: "Làm tròn số 15,49 đến hàng đơn vị.", solution: "Vì phần thập phân (0,49) nhỏ hơn 0,5, làm tròn xuống: 15.", answer: "15" },
        ],
      },
      {
        id: "phep-tinh-so-thap-phan-5",
        title: "Các phép tính với số thập phân",
        questions: [
          { prompt: "4,5 + 2,3 = ?", options: ["6,8", "6,7", "6,9", "7,8"], correct: 0, explain: "4,5+2,3 = 6,8." },
          { prompt: "7,8 − 3,4 = ?", options: ["4,4", "4,3", "4,5", "3,4"], correct: 0, explain: "7,8-3,4 = 4,4." },
          { prompt: "2,5 × 4 = ?", options: ["10", "9", "8", "12,5"], correct: 0, explain: "2,5×4 = 10." },
          { prompt: "6,4 : 2 = ?", options: ["3,2", "3,4", "3,0", "2,2"], correct: 0, explain: "6,4:2 = 3,2." },
          { prompt: "3,2 × 10 = ?", options: ["32", "3,2", "320", "0,32"], correct: 0, explain: "Nhân số thập phân với 10, dịch dấu phẩy sang phải 1 chữ số: 32." },
          { prompt: "45 : 100 (dạng thập phân) = ?", options: ["0,45", "4,5", "0,045", "45,0"], correct: 0, explain: "Chia cho 100, dịch dấu phẩy sang trái 2 chữ số: 0,45." },
        ],
        exercises: [
          { prompt: "Tính: 12,5 + 7,25", solution: "12,5 + 7,25 = 19,75.", answer: "19,75" },
          { prompt: "Tính: 20 − 8,75", solution: "20 - 8,75 = 11,25.", answer: "11,25" },
          { prompt: "Tính: 3,6 × 5", solution: "3,6 × 5 = 18.", answer: "18" },
          { prompt: "Tính: 15,6 : 4", solution: "15,6 : 4 = 3,9.", answer: "3,9" },
          { prompt: "Một mảnh vườn hình chữ nhật có chiều dài 8,5m, chiều rộng 4,2m. Tính chu vi.", solution: "Chu vi = 2×(8,5+4,2) = 25,4m.", answer: "25,4m" },
          { prompt: "Tính: 2,5 × 0,1", solution: "2,5 × 0,1 = 0,25.", answer: "0,25" },
          { prompt: "Một người mua 3,5kg táo giá 45.000đ/kg. Tính số tiền phải trả.", solution: "3,5 × 45.000 = 157.500đ.", answer: "157.500đ" },
          { prompt: "Tính: 100 : 0,5", solution: "100 : 0,5 = 200.", answer: "200" },
          { prompt: "Một chai nước có 1,5 lít, rót đều vào 3 cốc. Mỗi cốc bao nhiêu lít?", solution: "1,5 : 3 = 0,5 lít.", answer: "0,5 lít" },
          { prompt: "Tính: 4,8 + 3,2 − 2,5", solution: "4,8+3,2 = 8. 8-2,5 = 5,5.", answer: "5,5" },
        ],
        advanced: [
          { prompt: "Tính bằng cách thuận tiện: 2,5×7,8 + 2,5×2,2", solution: "= 2,5×(7,8+2,2) = 2,5×10 = 25.", answer: "25" },
          { prompt: "Một người đi xe máy trong 2 giờ đầu, mỗi giờ đi 42,5km, giờ thứ 3 chỉ đi được một nửa quãng đường của 1 giờ bình thường. Hỏi người đó đi được tất cả bao nhiêu km?", solution: "2 giờ đầu: 2×42,5 = 85km.\nGiờ thứ 3: 42,5:2 = 21,25km.\nTổng = 85+21,25 = 106,25km.", answer: "106,25km" },
          { prompt: "Tìm x biết: x : 2,5 = 14,8", solution: "x = 14,8×2,5 = 37.", answer: "37" },
          { prompt: "Tính: 4,5×3,2 − 2,5×3,2 (đặt thừa số chung).", solution: "= 3,2×(4,5-2,5) = 3,2×2 = 6,4.", answer: "6,4" },
          { prompt: "Một mảnh vải dài 12,5m được cắt thành các đoạn 2,5m. Hỏi cắt được bao nhiêu đoạn?", solution: "12,5:2,5 = 5 đoạn.", answer: "5 đoạn" },
          { prompt: "Tính: 100 − 25,5 − 24,5", solution: "= 100-(25,5+24,5) = 100-50 = 50.", answer: "50" },
          { prompt: "Một người mua 3 quyển vở giá 8.500đ/quyển và 2 cây bút giá 5.500đ/cây. Tính tổng tiền phải trả.", solution: "Vở = 3×8.500=25.500đ. Bút = 2×5.500=11.000đ.\nTổng = 25.500+11.000 = 36.500đ.", answer: "36.500đ" },
          { prompt: "Tính nhanh: 12,5×4×0,8", solution: "12,5×4=50. 50×0,8=40.", answer: "40" },
          { prompt: "Một cửa hàng giảm giá 15% cho món hàng 800.000đ. Tính giá sau giảm.", solution: "Giảm = 800.000×15%=120.000đ.\nGiá mới = 800.000-120.000 = 680.000đ.", answer: "680.000đ" },
          { prompt: "Tìm y biết: y:2,5=14.", solution: "y = 14×2,5 = 35.", answer: "35" },
        ],
      },
      {
        id: "hinh-phang-chu-vi-dien-tich-5",
        title: "Một số hình phẳng: chu vi và diện tích",
        questions: [
          { prompt: "Diện tích tam giác tính bằng công thức nào?", options: ["Đáy×cao:2", "Đáy×cao", "(đáy+cao):2", "Đáy+cao"], correct: 0, explain: "Công thức diện tích tam giác: S = đáy×chiều cao : 2." },
          { prompt: "Diện tích hình thang tính bằng công thức nào?", options: ["(đáy lớn+đáy bé)×cao:2", "đáy×cao", "(đáy lớn+đáy bé):2", "đáy lớn×đáy bé"], correct: 0, explain: "Công thức diện tích hình thang: S = (đáy lớn+đáy bé)×chiều cao : 2." },
          { prompt: "Chu vi hình tròn tính bằng công thức nào?", options: ["Đường kính×3,14", "Bán kính×3,14", "Bán kính²×3,14", "Đường kính+3,14"], correct: 0, explain: "Chu vi hình tròn = đường kính × 3,14." },
          { prompt: "Diện tích hình tròn tính bằng công thức nào?", options: ["Bán kính×bán kính×3,14", "Đường kính×3,14", "Bán kính×3,14", "Chu vi×2"], correct: 0, explain: "Diện tích hình tròn = bán kính × bán kính × 3,14." },
          { prompt: "Tam giác có đáy 10cm, chiều cao 6cm. Tính diện tích.", options: ["30cm²", "60cm²", "16cm²", "40cm²"], correct: 0, explain: "S = 10×6:2 = 30cm²." },
          { prompt: "Hình tròn có bán kính 5cm. Tính chu vi (π≈3,14).", options: ["31,4cm", "15,7cm", "78,5cm", "10cm"], correct: 0, explain: "Chu vi = 2×5×3,14 = 31,4cm." },
        ],
        exercises: [
          { prompt: "Tam giác có đáy 12cm, chiều cao 8cm. Tính diện tích.", solution: "S = 12×8:2 = 48cm².", answer: "48cm²" },
          { prompt: "Hình thang có đáy lớn 10cm, đáy bé 6cm, chiều cao 5cm. Tính diện tích.", solution: "S = (10+6)×5:2 = 40cm².", answer: "40cm²" },
          { prompt: "Hình tròn bán kính 4cm. Tính diện tích (π≈3,14).", solution: "S = 4×4×3,14 = 50,24cm².", answer: "50,24cm²" },
          { prompt: "Hình tròn có đường kính 10cm. Tính chu vi (π≈3,14).", solution: "Chu vi = 10×3,14 = 31,4cm.", answer: "31,4cm" },
          { prompt: "Một khu vườn hình tam giác có diện tích 90m², chiều cao 12m. Tính cạnh đáy.", solution: "Đáy = 90×2:12 = 15m.", answer: "15m" },
          { prompt: "Một mặt bàn hình tròn có bán kính 0,5m. Tính diện tích (π≈3,14).", solution: "S = 0,5×0,5×3,14 = 0,785m².", answer: "0,785m²" },
          { prompt: "Hình thang có diện tích 60cm², đáy lớn 12cm, đáy bé 8cm. Tính chiều cao.", solution: "Cao = 60×2:(12+8) = 6cm.", answer: "6cm" },
          { prompt: "Một miếng bìa hình tam giác có đáy 15cm, diện tích 90cm². Tính chiều cao.", solution: "Cao = 90×2:15 = 12cm.", answer: "12cm" },
          { prompt: "Tính chu vi hình tròn có bán kính 7cm (π≈3,14).", solution: "Chu vi = 2×7×3,14 = 43,96cm.", answer: "43,96cm" },
          { prompt: "Một sân chơi hình tròn có chu vi 62,8m. Tính bán kính (π≈3,14).", solution: "Bán kính = 62,8:3,14:2 = 10m.", answer: "10m" },
        ],
        advanced: [
          { prompt: "Một thửa ruộng hình thang có đáy lớn 40m, đáy bé 25m, chiều cao 20m. Tính diện tích theo m² rồi đổi ra a (1a=100m²).", solution: "S = (40+25)×20:2 = 650m² = 6,5a.", answer: "6,5a" },
          { prompt: "Một hình tròn có chu vi 18,84cm. Tính diện tích (π≈3,14).", solution: "Bán kính = 18,84:3,14:2 = 3cm.\nDiện tích = 3×3×3,14 = 28,26cm².", answer: "28,26cm²" },
          { prompt: "Một mảnh vườn hình tam giác có diện tích 120m², đáy 15m. Tính chiều cao mảnh vườn.", solution: "Chiều cao = 120×2:15 = 16m.", answer: "16m" },
          { prompt: "Một hình tam giác có diện tích 60cm², chiều cao 10cm. Tính đáy.", solution: "Đáy = 60×2:10 = 12cm.", answer: "12cm" },
          { prompt: "Một hình tròn có bán kính 10cm. Tính chu vi và diện tích (π≈3,14).", solution: "Chu vi = 2×10×3,14 = 62,8cm.\nDiện tích = 10×10×3,14 = 314cm².", answer: "chu vi 62,8cm, diện tích 314cm²" },
          { prompt: "Một hình thang có 2 đáy 8cm và 14cm, chiều cao bằng nửa tổng 2 đáy. Tính diện tích.", solution: "Chiều cao = (8+14):2 = 11cm.\nDiện tích = (8+14)×11:2 = 121cm².", answer: "121cm²" },
          { prompt: "Một mảnh đất hình chữ nhật có chu vi 60m, chiều dài hơn chiều rộng 10m. Tính diện tích.", solution: "Nửa chu vi=30. Dài+rộng=30, dài-rộng=10 → dài=20m, rộng=10m.\nDiện tích = 20×10 = 200m².", answer: "200m²" },
          { prompt: "Một hình tam giác vuông có 2 cạnh góc vuông 6cm và 8cm. Tính diện tích.", solution: "Diện tích = 6×8:2 = 24cm².", answer: "24cm²" },
          { prompt: "Bán kính hình tròn tăng gấp đôi thì diện tích tăng gấp mấy lần?", solution: "Diện tích tỉ lệ với bình phương bán kính, nên tăng gấp 4 lần.", answer: "4 lần" },
          { prompt: "Một khu vườn hình vuông có diện tích 225m². Tính chu vi.", solution: "Cạnh = √225 = 15m.\nChu vi = 15×4 = 60m.", answer: "60m" },
        ],
      },
      {
        id: "ti-so-phan-tram-5",
        title: "Tỉ số và tỉ số phần trăm",
        questions: [
          { prompt: "Tỉ số của 6 và 8 là bao nhiêu?", options: ["3:4", "8:6", "2:1", "1:2"], correct: 0, explain: "6:8 rút gọn (chia cả hai cho 2) được 3:4." },
          { prompt: "25% viết dưới dạng phân số tối giản là?", options: ["1/4", "1/25", "25/1", "4/25"], correct: 0, explain: "25% = 25/100 = 1/4." },
          { prompt: "Tìm 20% của 150.", options: ["30", "20", "15", "75"], correct: 0, explain: "150×20% = 150×0,2 = 30." },
          { prompt: "Một lớp có 40 học sinh, 25% là học sinh giỏi. Tính số học sinh giỏi.", options: ["10", "25", "15", "20"], correct: 0, explain: "40×25% = 10." },
          { prompt: "Viết tỉ số phần trăm của 3 và 4.", options: ["75%", "34%", "43%", "134%"], correct: 0, explain: "3:4 = 0,75 = 75%." },
          { prompt: "Số 0,5 viết dưới dạng tỉ số phần trăm là?", options: ["50%", "5%", "0,5%", "500%"], correct: 0, explain: "0,5 = 50%." },
        ],
        exercises: [
          { prompt: "Một đội có 12 nam và 8 nữ. Tính tỉ số giữa số nam và số nữ.", solution: "12:8 rút gọn (chia cả hai cho 4) được 3:2.", answer: "2." },
          { prompt: "Một lớp có 30 học sinh, 40% thích Toán. Tính số học sinh thích Toán.", solution: "30×40% = 12 học sinh.", answer: "12 học sinh" },
          { prompt: "Giá một món hàng 200.000đ được giảm 15%. Tính số tiền giảm.", solution: "200.000×15% = 30.000đ.", answer: "30.000đ" },
          { prompt: "Một trường có 500 học sinh, 60% là học sinh nữ. Tính số học sinh nam.", solution: "Số nữ = 500×60% = 300. Số nam = 500-300 = 200.", answer: "200" },
          { prompt: "Viết tỉ số phần trăm của 7 và 20.", solution: "7:20 = 0,35 = 35%.", answer: "35%" },
          { prompt: "Một cửa hàng bán được 80 sản phẩm, trong đó 15 sản phẩm bị lỗi. Tính tỉ lệ % sản phẩm lỗi.", solution: "15:80 = 0,1875 = 18,75%.", answer: "18,75%" },
          { prompt: "Số học sinh khá của một lớp là 12 bạn, chiếm 30% số học sinh cả lớp. Tính số học sinh cả lớp.", solution: "Số học sinh cả lớp = 12:30% = 40.", answer: "40" },
          { prompt: "Tính 45% của 200.", solution: "200×45% = 90.", answer: "90" },
          { prompt: "Một kho có 800kg gạo, đã bán 25%. Hỏi còn lại bao nhiêu kg?", solution: "Đã bán = 800×25% = 200kg. Còn lại = 800-200 = 600kg.", answer: "600kg" },
          { prompt: "Vốn đầu tư ban đầu 5.000.000đ, lãi suất 8%/năm. Tính tiền lãi sau 1 năm.", solution: "5.000.000×8% = 400.000đ.", answer: "400.000đ" },
        ],
        advanced: [
          { prompt: "Giá gốc một chiếc áo là 250.000đ. Sau khi tăng giá 20% rồi giảm giá 20% trên giá mới, hỏi giá cuối cùng là bao nhiêu?", solution: "Sau khi tăng 20%: 250.000×1,2 = 300.000đ.\nSau khi giảm 20% trên giá mới: 300.000×0,8 = 240.000đ.", answer: "240.000đ" },
          { prompt: "Một lớp có 40 học sinh, số học sinh nam chiếm 60%. Tính số học sinh nữ.", solution: "Số nam = 40×60% = 24.\nSố nữ = 40-24 = 16.", answer: "16" },
          { prompt: "Năm nay một công ty có doanh thu tăng 15% so với năm ngoái, đạt 460.000.000đ. Tính doanh thu năm ngoái.", solution: "Doanh thu năm ngoái × 1,15 = 460.000.000đ.\nDoanh thu năm ngoái = 460.000.000 : 1,15 = 400.000.000đ.", answer: "400.000.000đ" },
          { prompt: "Một lớp có 45% học sinh nam, còn lại nữ. Biết số nữ nhiều hơn nam 7 học sinh. Tính tổng số học sinh.", solution: "Nữ=55%, nam=45%. Chênh lệch=10%=7 học sinh.\nTổng = 7:10% = 70 học sinh.", answer: "70 học sinh" },
          { prompt: "Giá một món hàng sau khi giảm 20% còn 320.000đ. Tính giá gốc.", solution: "Giá gốc×80% = 320.000đ.\nGiá gốc = 320.000:0,8 = 400.000đ.", answer: "400.000đ" },
          { prompt: "Một cửa hàng nhập 500 sản phẩm, bán được 80%. Hỏi còn lại bao nhiêu sản phẩm?", solution: "Bán = 500×80% = 400.\nCòn lại = 500-400 = 100 sản phẩm.", answer: "100 sản phẩm" },
          { prompt: "Số học sinh giỏi của một lớp là 12 bạn, chiếm 24% số học sinh cả lớp. Tính số học sinh cả lớp.", solution: "Tổng = 12:24% = 50 học sinh.", answer: "50 học sinh" },
          { prompt: "Vốn đầu tư 20.000.000đ, sau 1 năm lãi 8%. Tính số tiền có được sau 1 năm.", solution: "Lãi = 20.000.000×8% = 1.600.000đ.\nTổng = 20.000.000+1.600.000 = 21.600.000đ.", answer: "21.600.000đ" },
          { prompt: "So sánh: 45% và 9/20.", solution: "9/20 = 45%. Vậy hai giá trị này bằng nhau.", answer: "Bằng nhau" },
          { prompt: "Một đội bóng đá 20 trận, thắng 60%. Tính số trận thắng.", solution: "20×60% = 12 trận.", answer: "12 trận" },
        ],
      },
      {
        id: "the-tich-don-vi-do-5",
        title: "Thể tích, đơn vị đo thể tích",
        questions: [
          { prompt: "1m³ = ? dm³", options: ["1000", "100", "10000", "10"], correct: 0, explain: "1m³ = 1000dm³." },
          { prompt: "1dm³ = ? cm³", options: ["1000", "100", "10", "10000"], correct: 0, explain: "1dm³ = 1000cm³." },
          { prompt: "Thể tích hình lập phương cạnh 3cm là bao nhiêu?", options: ["27cm³", "9cm³", "6cm³", "81cm³"], correct: 0, explain: "Thể tích = 3×3×3 = 27cm³." },
          { prompt: "Thể tích hình hộp chữ nhật tính bằng công thức nào?", options: ["Dài×rộng×cao", "2×(dài+rộng)", "Dài+rộng+cao", "Dài×rộng"], correct: 0, explain: "Thể tích hình hộp chữ nhật = dài × rộng × cao." },
          { prompt: "5m³ = ? dm³", options: ["5000", "500", "50000", "50"], correct: 0, explain: "5m³ = 5×1000 = 5000dm³." },
          { prompt: "1 lít = ? dm³", options: ["1", "10", "100", "1000"], correct: 0, explain: "1 lít = 1dm³." },
        ],
        exercises: [
          { prompt: "Hình hộp chữ nhật có chiều dài 5cm, rộng 4cm, cao 3cm. Tính thể tích.", solution: "V = 5×4×3 = 60cm³.", answer: "60cm³" },
          { prompt: "Đổi 3,5m³ ra dm³.", solution: "3,5m³ = 3500dm³.", answer: "3500dm³" },
          { prompt: "Hình lập phương có cạnh 6cm. Tính thể tích.", solution: "V = 6×6×6 = 216cm³.", answer: "216cm³" },
          { prompt: "Một bể nước hình hộp chữ nhật có đáy 40cm×30cm, cao 50cm. Tính thể tích.", solution: "V = 40×30×50 = 60.000cm³ = 60 lít.", answer: "60 lít" },
          { prompt: "Đổi 2500cm³ ra dm³.", solution: "2500cm³ = 2,5dm³.", answer: "2,5dm³" },
          { prompt: "Một thùng có thể tích 8m³. Đổi ra lít (1m³=1000 lít).", solution: "8m³ = 8000 lít.", answer: "8000 lít" },
          { prompt: "Hình lập phương có thể tích 125cm³. Tính cạnh.", solution: "Cạnh = ∛125 = 5cm.", answer: "5cm" },
          { prompt: "Hình hộp chữ nhật có thể tích 120cm³, đáy 4cm×5cm. Tính chiều cao.", solution: "Cao = 120:(4×5) = 6cm.", answer: "6cm" },
          { prompt: "Một bể cá hình hộp chữ nhật có thể tích 0,5m³. Đổi ra dm³.", solution: "0,5m³ = 500dm³.", answer: "500dm³" },
          { prompt: "Tính thể tích một viên gạch hình hộp chữ nhật dài 20cm, rộng 10cm, cao 5cm.", solution: "V = 20×10×5 = 1000cm³.", answer: "1000cm³" },
        ],
        advanced: [
          { prompt: "Một bể nước hình hộp chữ nhật có chiều dài 1,5m, rộng 1m, cao 0,8m. Tính thể tích bể theo lít.", solution: "V = 1,5×1×0,8 = 1,2m³ = 1200 lít.", answer: "1200 lít" },
          { prompt: "Một khối gỗ hình lập phương có thể tích 512cm³. Tính diện tích một mặt.", solution: "Cạnh = ∛512 = 8cm.\nDiện tích 1 mặt = 8×8 = 64cm².", answer: "64cm²" },
          { prompt: "Một bể bơi hình hộp chữ nhật dài 25m, rộng 10m, hiện có nước sâu 1,2m. Cần bơm thêm bao nhiêu m³ nước để mực nước đạt 1,5m?", solution: "Thể tích cần thêm = 25×10×(1,5-1,2) = 25×10×0,3 = 75m³.", answer: "75m³" },
          { prompt: "Một bể nước hình lập phương cạnh 1,5m. Tính thể tích.", solution: "V = 1,5³ = 3,375m³.", answer: "3,375m³" },
          { prompt: "Đổi 4,5m³ ra lít.", solution: "4,5m³ = 4.500 lít.", answer: "4.500 lít" },
          { prompt: "Một hình hộp chữ nhật có thể tích 360cm³, đáy 6cm×8cm. Tính chiều cao.", solution: "Chiều cao = 360:(6×8) = 7,5cm.", answer: "7,5cm" },
          { prompt: "Một bể cá hình hộp chữ nhật dài 60cm, rộng 40cm, cao 45cm, chứa nước đầy 80% thể tích. Tính thể tích nước.", solution: "Thể tích bể = 60×40×45 = 108.000cm³.\nNước = 108.000×80% = 86.400cm³.", answer: "86.400cm³" },
          { prompt: "Đổ 1,2 lít nước vào bể hình hộp chữ nhật đáy 20cm×15cm. Tính chiều cao mực nước.", solution: "1,2 lít = 1.200cm³.\nChiều cao = 1.200:(20×15) = 4cm.", answer: "4cm" },
          { prompt: "Một hình hộp chữ nhật có các kích thước 5cm, 4cm, 3cm. Tính diện tích toàn phần.", solution: "Sxq = 2×(5+4)×3 = 54cm². 2 đáy = 2×5×4 = 40cm².\nToàn phần = 54+40 = 94cm².", answer: "94cm²" },
          { prompt: "Đổi 2500cm³ ra dm³.", solution: "2500cm³ = 2,5dm³.", answer: "2,5dm³" },
        ],
      },
      {
        id: "dien-tich-the-tich-hinh-khoi-5",
        title: "Diện tích và thể tích một số hình khối",
        questions: [
          { prompt: "Diện tích xung quanh hình hộp chữ nhật tính bằng công thức nào?", options: ["Chu vi đáy×chiều cao", "Diện tích đáy×2", "Dài×rộng", "Dài+rộng+cao"], correct: 0, explain: "Diện tích xung quanh = chu vi đáy × chiều cao." },
          { prompt: "Diện tích toàn phần hình lập phương cạnh a tính bằng?", options: ["6×a×a", "4×a×a", "a×a×a", "2×a×a"], correct: 0, explain: "Diện tích toàn phần hình lập phương = 6 lần diện tích 1 mặt = 6×a×a." },
          { prompt: "Hình hộp chữ nhật có chu vi đáy 20cm, cao 8cm. Tính diện tích xung quanh.", options: ["160cm²", "28cm²", "80cm²", "200cm²"], correct: 0, explain: "Sxq = 20×8 = 160cm²." },
          { prompt: "Hình lập phương cạnh 5cm. Tính diện tích một mặt.", options: ["25cm²", "20cm²", "10cm²", "30cm²"], correct: 0, explain: "Diện tích một mặt = 5×5 = 25cm²." },
          { prompt: "Diện tích toàn phần hình hộp chữ nhật bằng gì?", options: ["Diện tích xung quanh + 2 lần diện tích đáy", "Chỉ diện tích xung quanh", "Chỉ diện tích đáy", "Diện tích xung quanh × 2"], correct: 0, explain: "Diện tích toàn phần = diện tích xung quanh + diện tích 2 đáy." },
          { prompt: "Hình lập phương cạnh 4cm. Tính diện tích toàn phần.", options: ["96cm²", "64cm²", "48cm²", "16cm²"], correct: 0, explain: "Diện tích toàn phần = 6×4×4 = 96cm²." },
        ],
        exercises: [
          { prompt: "Hình hộp chữ nhật dài 6cm, rộng 4cm, cao 5cm. Tính diện tích xung quanh.", solution: "Chu vi đáy = 2×(6+4) = 20cm. Sxq = 20×5 = 100cm².", answer: "100cm²" },
          { prompt: "Tính diện tích toàn phần hình hộp chữ nhật ở bài trên (dài 6cm, rộng 4cm, cao 5cm).", solution: "Diện tích 2 đáy = 2×6×4 = 48cm². Toàn phần = 100+48 = 148cm².", answer: "148cm²" },
          { prompt: "Hình lập phương cạnh 7cm. Tính diện tích toàn phần.", solution: "6×7×7 = 294cm².", answer: "294cm²" },
          { prompt: "Một cái hộp hình lập phương cạnh 10cm. Tính diện tích xung quanh (4 mặt bên).", solution: "Sxq = chu vi đáy×cao = 40×10 = 400cm².", answer: "400cm²" },
          { prompt: "Hình hộp chữ nhật có chu vi đáy 30cm, chiều cao 12cm. Tính diện tích xung quanh.", solution: "Sxq = 30×12 = 360cm².", answer: "360cm²" },
          { prompt: "Tính thể tích và diện tích toàn phần của hình lập phương cạnh 3cm.", solution: "Thể tích = 3×3×3 = 27cm³. Diện tích toàn phần = 6×3×3 = 54cm².", answer: "54cm²" },
          { prompt: "Một bể cá hình hộp chữ nhật (không nắp) dài 50cm, rộng 30cm, cao 40cm. Tính diện tích kính cần dùng (đáy + 4 mặt bên).", solution: "Đáy = 50×30 = 1.500cm². Sxq = 2×(50+30)×40 = 6.400cm². Tổng = 1.500+6.400 = 7.900cm².", answer: "7.900cm²" },
          { prompt: "Hình lập phương có diện tích toàn phần 150cm². Tính diện tích 1 mặt.", solution: "Diện tích 1 mặt = 150:6 = 25cm².", answer: "25cm²" },
          { prompt: "Từ diện tích 1 mặt 25cm² ở bài trên, tính cạnh hình lập phương.", solution: "Cạnh = √25 = 5cm.", answer: "5cm" },
          { prompt: "Hình hộp chữ nhật có đáy hình vuông cạnh 5cm, cao 8cm. Tính diện tích xung quanh.", solution: "Chu vi đáy = 4×5 = 20cm. Sxq = 20×8 = 160cm².", answer: "160cm²" },
        ],
        advanced: [
          { prompt: "Một hình hộp chữ nhật có diện tích xung quanh 84cm², chiều cao 6cm. Tính chu vi đáy.", solution: "Chu vi đáy = diện tích xung quanh : chiều cao = 84:6 = 14cm.", answer: "14cm" },
          { prompt: "Một cái thùng hình lập phương không nắp, cạnh 4dm. Tính diện tích tôn cần dùng (đáy + 4 mặt bên).", solution: "Diện tích 1 mặt = 4×4 = 16dm².\nCần 5 mặt (1 đáy + 4 bên): 5×16 = 80dm².", answer: "80dm²" },
          { prompt: "Một hình hộp chữ nhật có thể tích 240cm³, đáy hình vuông cạnh 4cm. Tính diện tích toàn phần.", solution: "Chiều cao = 240:(4×4) = 15cm.\nDiện tích xung quanh = chu vi đáy×cao = 16×15 = 240cm².\nDiện tích 2 đáy = 2×16 = 32cm².\nDiện tích toàn phần = 240+32 = 272cm².", answer: "272cm²" },
          { prompt: "Một hình lập phương có diện tích toàn phần 216cm². Tính thể tích.", solution: "Diện tích 1 mặt = 216:6 = 36cm². Cạnh = 6cm.\nThể tích = 6³ = 216cm³.", answer: "216cm³" },
          { prompt: "Một hình hộp chữ nhật dài 8cm, rộng 5cm, thể tích 200cm³. Tính chiều cao.", solution: "Chiều cao = 200:(8×5) = 5cm.", answer: "5cm" },
          { prompt: "Tính diện tích xung quanh hình lập phương cạnh 5cm.", solution: "Sxq = 4×5×5 = 100cm² (4 mặt bên).", answer: "100cm²" },
          { prompt: "Một bể bơi hình hộp chữ nhật dài 25m, rộng 10m, sâu 1,2m. Tính thể tích nước cần đổ đầy (theo lít).", solution: "Thể tích = 25×10×1,2 = 300m³ = 300.000 lít.", answer: "300.000 lít" },
          { prompt: "Một hình hộp chữ nhật có diện tích toàn phần 148cm², biết Sxq=100cm². Tính diện tích 2 đáy.", solution: "2 đáy = 148-100 = 48cm².", answer: "48cm²" },
          { prompt: "Cạnh hình lập phương tăng gấp 3 lần thì thể tích tăng gấp mấy lần?", solution: "Thể tích tỉ lệ với lập phương của cạnh, nên tăng gấp 3³=27 lần.", answer: "27 lần" },
          { prompt: "Một khối gỗ hình lập phương có diện tích 1 mặt là 36cm². Tính thể tích.", solution: "Cạnh = √36 = 6cm.\nThể tích = 6³ = 216cm³.", answer: "216cm³" },
        ],
      },
      {
        id: "van-toc-thoi-gian-5",
        title: "Số đo thời gian, vận tốc, chuyển động đều",
        questions: [
          { prompt: "Vận tốc tính bằng công thức nào?", options: ["Quãng đường : thời gian", "Quãng đường × thời gian", "Thời gian : quãng đường", "Quãng đường + thời gian"], correct: 0, explain: "Công thức: vận tốc = quãng đường : thời gian." },
          { prompt: "Một xe đi 120km trong 2 giờ. Tính vận tốc.", options: ["60km/h", "240km/h", "122km/h", "118km/h"], correct: 0, explain: "Vận tốc = 120:2 = 60km/h." },
          { prompt: "Quãng đường tính bằng công thức nào?", options: ["Vận tốc × thời gian", "Vận tốc : thời gian", "Vận tốc + thời gian", "Thời gian : vận tốc"], correct: 0, explain: "Công thức: quãng đường = vận tốc × thời gian." },
          { prompt: "Thời gian tính bằng công thức nào?", options: ["Quãng đường : vận tốc", "Quãng đường × vận tốc", "Vận tốc : quãng đường", "Vận tốc + quãng đường"], correct: 0, explain: "Công thức: thời gian = quãng đường : vận tốc." },
          { prompt: "2 giờ 30 phút = ? giờ (dạng số thập phân)", options: ["2,5", "2,3", "2,50", "2,15"], correct: 0, explain: "30 phút = 0,5 giờ, nên 2 giờ 30 phút = 2,5 giờ." },
          { prompt: "Một người đi bộ với vận tốc 5km/h trong 3 giờ. Tính quãng đường đi được.", options: ["15km", "8km", "2km", "1,67km"], correct: 0, explain: "Quãng đường = 5×3 = 15km." },
        ],
        exercises: [
          { prompt: "Một ô tô đi 180km trong 3 giờ. Tính vận tốc.", solution: "Vận tốc = 180:3 = 60km/h.", answer: "60km/h" },
          { prompt: "Một người đi xe đạp với vận tốc 12km/h trong 2 giờ 30 phút. Tính quãng đường.", solution: "2 giờ 30 phút = 2,5 giờ. Quãng đường = 2,5×12 = 30km.", answer: "30km" },
          { prompt: "Một xe máy đi quãng đường 90km với vận tốc 45km/h. Tính thời gian đi.", solution: "Thời gian = 90:45 = 2 giờ.", answer: "2 giờ" },
          { prompt: "Đổi 1 giờ 45 phút ra giờ (dạng thập phân).", solution: "45 phút = 0,75 giờ. 1 giờ 45 phút = 1,75 giờ.", answer: "1,75 giờ" },
          { prompt: "Hai xe khởi hành cùng lúc từ hai địa điểm cách nhau 150km, đi ngược chiều với vận tốc 40km/h và 35km/h. Sau bao lâu hai xe gặp nhau?", solution: "Tổng vận tốc = 40+35 = 75km/h. Thời gian gặp nhau = 150:75 = 2 giờ.", answer: "2 giờ" },
          { prompt: "Một tàu hỏa đi với vận tốc 65km/h trong 4 giờ. Tính quãng đường đi được.", solution: "Quãng đường = 65×4 = 260km.", answer: "260km" },
          { prompt: "Một người chạy bộ 5km trong 40 phút. Tính vận tốc theo km/h.", solution: "40 phút = 2/3 giờ. Vận tốc = 5:(2/3) = 7,5km/h.", answer: "7,5km/h" },
          { prompt: "Một ca nô đi với vận tốc 18km/h. Tính quãng đường đi trong 1 giờ 30 phút.", solution: "1 giờ 30 phút = 1,5 giờ. Quãng đường = 1,5×18 = 27km.", answer: "27km" },
          { prompt: "Vận tốc của một máy bay là 800km/h. Tính thời gian bay quãng đường 2.400km.", solution: "Thời gian = 2.400:800 = 3 giờ.", answer: "3 giờ" },
          { prompt: "Một người đi bộ khởi hành lúc 6 giờ, đến nơi lúc 8 giờ 30 phút, đi được 10km. Tính vận tốc.", solution: "Thời gian đi = 2,5 giờ. Vận tốc = 10:2,5 = 4km/h.", answer: "4km/h" },
        ],
        advanced: [
          { prompt: "Một ô tô đi từ A đến B với vận tốc 50km/h hết 2 giờ 30 phút. Lúc về đi với vận tốc 60km/h. Tính thời gian đi về.", solution: "Quãng đường AB = 50×2,5 = 125km.\nThời gian về = 125:60 ≈ 2 giờ 5 phút.", answer: "125:60 ≈ 2 giờ 5 phút" },
          { prompt: "Hai người đi bộ ngược chiều từ 2 điểm cách nhau 15km, khởi hành cùng lúc, gặp nhau sau 2 giờ. Người thứ nhất đi vận tốc 4km/h. Tính vận tốc người thứ hai.", solution: "Tổng vận tốc hai người = 15:2 = 7,5km/h.\nVận tốc người thứ hai = 7,5-4 = 3,5km/h.", answer: "3,5km/h" },
          { prompt: "Một xe máy đi từ A lúc 7 giờ, đến B lúc 9 giờ 30 phút, quãng đường AB dài 100km. Muốn đến B sớm hơn 30 phút thì phải đi với vận tốc bao nhiêu?", solution: "Thời gian dự kiến ban đầu = 2,5 giờ. Thời gian mới = 2 giờ.\nVận tốc mới = 100:2 = 50km/h.", answer: "50km/h" },
          { prompt: "Một ô tô đi 240km hết 4 giờ. Tính vận tốc.", solution: "240:4 = 60km/h.", answer: "60km/h" },
          { prompt: "Một người đi bộ với vận tốc 5km/h trong 45 phút. Tính quãng đường.", solution: "45 phút = 0,75 giờ.\nQuãng đường = 5×0,75 = 3,75km.", answer: "3,75km" },
          { prompt: "Một xe máy đi từ A đến B dài 90km với vận tốc 45km/h, khởi hành lúc 7 giờ. Hỏi đến B lúc mấy giờ?", solution: "Thời gian = 90:45 = 2 giờ.\nĐến lúc 7+2 = 9 giờ.", answer: "9 giờ" },
          { prompt: "Hai xe khởi hành cùng lúc từ 2 điểm cách nhau 180km đi ngược chiều, vận tốc 40km/h và 50km/h. Sau bao lâu 2 xe gặp nhau?", solution: "Tổng vận tốc = 90km/h.\nThời gian = 180:90 = 2 giờ.", answer: "2 giờ" },
          { prompt: "Một canô xuôi dòng đi 60km hết 2 giờ, ngược dòng đi 60km hết 3 giờ. Tính vận tốc dòng nước.", solution: "Vận tốc xuôi=30km/h. Vận tốc ngược=20km/h.\nVận tốc dòng nước = (30-20):2 = 5km/h.", answer: "5km/h" },
          { prompt: "Một người đi xe đạp với vận tốc 15km/h trong 1 giờ 20 phút. Tính quãng đường.", solution: "1 giờ 20 phút = 4/3 giờ.\nQuãng đường = 15×4/3 = 20km.", answer: "20km" },
          { prompt: "Một máy bay bay quãng đường 1800km với vận tốc 600km/h. Tính thời gian bay theo phút.", solution: "Thời gian = 1800:600 = 3 giờ = 180 phút.", answer: "180 phút" },
        ],
      },
      {
        id: "thong-ke-xac-suat-5",
        title: "Một số yếu tố thống kê và xác suất",
        questions: [
          { prompt: "Biểu đồ hình quạt tròn dùng để biểu diễn điều gì?", options: ["Tỉ lệ % của các phần trong tổng thể", "Số liệu tăng giảm theo thời gian", "Không dùng để làm gì", "Chỉ 1 giá trị duy nhất"], correct: 0, explain: "Biểu đồ hình quạt tròn thể hiện tỉ lệ phần trăm của từng phần trong một tổng thể." },
          { prompt: "Một lớp có 40 học sinh, biểu đồ hình quạt cho biết 25% thích Toán. Tính số học sinh thích Toán.", options: ["10", "25", "15", "20"], correct: 0, explain: "40×25% = 10 học sinh." },
          { prompt: "Gieo 1 con xúc xắc, xác suất ra mặt 6 chấm là bao nhiêu (dạng phân số)?", options: ["1/6", "1/2", "1/3", "1"], correct: 0, explain: "Xúc xắc có 6 mặt đồng khả năng, xác suất ra mặt 6 chấm là 1/6." },
          { prompt: "Tung 1 đồng xu, có mấy khả năng xảy ra?", options: ["2", "1", "3", "4"], correct: 0, explain: "Đồng xu có 2 mặt: sấp và ngửa." },
          { prompt: "Trong hộp có 3 bi đỏ, 2 bi xanh. Lấy 1 bi, xác suất lấy được bi đỏ là bao nhiêu?", options: ["3/5", "2/5", "3/2", "1/5"], correct: 0, explain: "Tổng 5 bi, 3 bi đỏ: xác suất = 3/5." },
          { prompt: "Bảng số liệu ghi số sách đọc của 4 bạn: 3, 5, 2, 4 quyển. Bạn nào đọc nhiều sách nhất?", options: ["Bạn đọc 5 quyển", "Bạn đọc 3 quyển", "Bạn đọc 2 quyển", "Bạn đọc 4 quyển"], correct: 0, explain: "So sánh 4 số, số lớn nhất là 5 quyển." },
        ],
        exercises: [
          { prompt: "Một lớp 32 học sinh, biểu đồ hình quạt: 50% thích bóng đá, 25% thích cầu lông, còn lại thích môn khác. Tính số học sinh thích bóng đá.", solution: "32×50% = 16 học sinh.", answer: "16 học sinh" },
          { prompt: "Tính số học sinh thích môn khác ở bài trên.", solution: "Tỉ lệ môn khác = 100%-50%-25% = 25%. Số học sinh = 32×25% = 8.", answer: "8" },
          { prompt: "Gieo 1 xúc xắc, tính xác suất ra số chẵn.", solution: "Các số chẵn: 2,4,6 → 3 kết quả trong 6. Xác suất = 3/6 = 1/2.", answer: "1/2" },
          { prompt: "Trong hộp có 4 bi đỏ, 6 bi xanh. Lấy 1 bi, tính xác suất lấy được bi xanh.", solution: "Xác suất = 6/10 = 3/5.", answer: "3/5" },
          { prompt: "Bảng thống kê điểm kiểm tra của tổ: 8, 9, 7, 10, 6. Tính điểm trung bình.", solution: "Trung bình = (8+9+7+10+6)/5 = 40/5 = 8.", answer: "8" },
          { prompt: "Biểu đồ cột ghi số cây trồng của 4 tổ: 15, 20, 18, 12 cây. Tổ nào trồng ít cây nhất?", solution: "So sánh 4 số, số nhỏ nhất là 12 cây.", answer: "So sánh 4 số, số nhỏ nhất là 12 cây" },
          { prompt: "Tính tổng số cây 4 tổ đã trồng ở bài trên (15, 20, 18, 12 cây).", solution: "15+20+18+12 = 65 cây.", answer: "65 cây" },
          { prompt: "Rút 1 lá bài từ 10 lá bài đánh số 1-10, tính xác suất được số lớn hơn 7.", solution: "Các số thỏa mãn: 8,9,10 → 3 kết quả. Xác suất = 3/10.", answer: "3/10" },
          { prompt: "Một cuộc khảo sát 50 người về phương tiện đi lại: 20 người đi xe máy. Tính tỉ lệ %.", solution: "20/50 = 0,4 = 40%.", answer: "40%" },
          { prompt: "Tung một đồng xu 3 lần, liệt kê các khả năng có thể xảy ra.", solution: "Các khả năng: SSS, SSN, SNS, SNN, NSS, NSN, NNS, NNN (8 khả năng).", answer: "8" },
        ],
        advanced: [
          { prompt: "Một lớp 32 học sinh, biểu đồ hình quạt: 50% thích bóng đá, 25% thích cầu lông, còn lại thích bóng bàn. Tính số học sinh thích bóng bàn.", solution: "Tỉ lệ bóng bàn = 100%-50%-25% = 25%.\nSố học sinh = 32×25% = 8.", answer: "8" },
          { prompt: "Gieo 1 xúc xắc 60 lần, mặt 5 chấm xuất hiện 12 lần. Tính xác suất thực nghiệm.", solution: "Xác suất thực nghiệm = 12/60 = 0,2 = 20%.", answer: "20%" },
          { prompt: "Bảng điểm kiểm tra của 6 bạn: 7, 8, 9, 6, 10, 8. Tính điểm trung bình.", solution: "Tổng = 7+8+9+6+10+8 = 48.\nTrung bình = 48:6 = 8.", answer: "8" },
          { prompt: "Biểu đồ hình quạt: lớp 5A có 40% thích Toán, 35% thích Văn, còn lại thích Anh, tổng 40 học sinh. Tính số học sinh thích Anh.", solution: "Anh = 100%-40%-35% = 25%.\nSố học sinh = 40×25% = 10.", answer: "10 học sinh" },
          { prompt: "Trong hộp có 4 bi đỏ, 6 bi xanh. Lấy ngẫu nhiên, tính xác suất lấy được bi đỏ (dạng phân số tối giản).", solution: "4/10 = 2/5.", answer: "2/5" },
          { prompt: "Biểu đồ cột: số cây trồng của 4 tổ lần lượt 15, 20, 18, 22 cây. Tổ nào trồng nhiều nhất?", solution: "Tổ trồng 22 cây là tổ trồng nhiều nhất.", answer: "Tổ trồng 22 cây" },
          { prompt: "Tính tổng số cây 4 tổ ở bài trên (15, 20, 18, 22 cây).", solution: "15+20+18+22 = 75 cây.", answer: "75 cây" },
          { prompt: "Một hộp có 20 vé số, 3 vé trúng thưởng. Tính xác suất rút được vé trúng thưởng.", solution: "3/20.", answer: "3/20" },
          { prompt: "Một lớp 32 học sinh, biểu đồ hình quạt: 25% giỏi, 50% khá, còn lại trung bình. Tính số học sinh trung bình.", solution: "Trung bình = 100%-25%-50% = 25%.\nSố học sinh = 32×25% = 8.", answer: "8 học sinh" },
          { prompt: "Gieo 1 đồng xu 80 lần, có 35 lần ngửa. Tính xác suất thực nghiệm ra mặt sấp.", solution: "Số lần sấp = 80-35 = 45.\nXác suất thực nghiệm = 45/80 = 9/16.", answer: "9/16" },
        ],
      },
    ],
    examSources: [],
  },

  {
    id: 6,
    label: "Lớp 6",

    topics: [
      {
        id: "so-tu-nhien-6",
        title: "Số tự nhiên & phép tính",
        questions: [
          { prompt: "15 + 27 × 3 = ?", options: ["96", "126", "78", "108"], correct: 0, explain: "Nhân trước, cộng sau: 27×3=81, rồi 15+81=96." },
          { prompt: "Số nào là ước của 24 nhưng không là ước của 18?", options: ["8", "6", "3", "2"], correct: 0, explain: "Ước của 24 gồm 1,2,3,4,6,8,12,24; ước của 18 gồm 1,2,3,6,9,18 — chỉ có 8 không thuộc ước của 18." },
          { prompt: "BCNN(4, 6) = ?", options: ["12", "24", "8", "6"], correct: 0, explain: "Bội chung nhỏ nhất của 4 và 6 là 12 (4×3 = 6×2 = 12)." },
          { prompt: "2³ × 2² = ?", options: ["32", "16", "64", "8"], correct: 0, explain: "Cùng cơ số thì cộng số mũ: 2³×2² = 2⁵ = 32." },
          { prompt: "Số nguyên tố nhỏ nhất lớn hơn 10 là?", options: ["11", "12", "13", "9"], correct: 0, explain: "11 chỉ chia hết cho 1 và chính nó, là số nguyên tố đầu tiên sau 10." },
          { prompt: "144 : 12 = ?", options: ["12", "14", "10", "16"], correct: 0, explain: "144 chia 12 được 12 vì 12×12=144." },
        ],
        exercises: [
          { prompt: "Tính giá trị biểu thức: 45 + 3×(12−7)", solution: "Thực hiện trong ngoặc trước: 12-7=5.\nSau đó nhân: 3×5=15.\nCuối cùng cộng: 45+15=60.", answer: "60" },
          { prompt: "Tìm x biết: 2x + 15 = 45", solution: "2x = 45-15 = 30.\nx = 30:2 = 15.", answer: "15" },
          { prompt: "Tính: 2⁴ × 3²", solution: "2⁴=16, 3²=9.\n2⁴×3² = 16×9 = 144.", answer: "144" },
          { prompt: "Tính: 100 − 4×(15−10)", solution: "Trong ngoặc trước: 15-10=5.\nNhân: 4×5=20.\nTrừ: 100-20=80.", answer: "80" },
          { prompt: "Tìm x biết: 3x − 7 = 20", solution: "3x = 20+7 = 27.\nx = 27:3 = 9.", answer: "9" },
          { prompt: "Tính: 5³ − 2⁴", solution: "5³=125, 2⁴=16.\n125-16=109.", answer: "109" },
          { prompt: "So sánh 2¹⁰ và 10². Số nào lớn hơn?", solution: "2¹⁰=1024. 10²=100.\nVì 1024>100 nên 2¹⁰ lớn hơn 10².", answer: "Vì 1024>100 nên 2¹⁰ lớn hơn 10²" },
          { prompt: "Tính: 200 : 5 + 3×8", solution: "Chia và nhân trước: 200:5=40, 3×8=24.\nCộng: 40+24=64.", answer: "64" },
          { prompt: "Tìm số tự nhiên x biết x là ước của 20 và x>10.", solution: "Ước của 20: 1,2,4,5,10,20.\nSố lớn hơn 10 trong danh sách này là 20. Vậy x=20.", answer: "20" },
          { prompt: "Một cửa hàng có 240 quả táo, chia đều vào 8 hộp. Mỗi hộp có bao nhiêu quả?", solution: "Số quả mỗi hộp = 240:8 = 30 quả.", answer: "30 quả" },
        ],
        advanced: [
          { prompt: "Tìm số tự nhiên nhỏ nhất có tổng các chữ số bằng 20.", solution: "Với k chữ số, tổng các chữ số tối đa là 9k. Cần 9k≥20, mà 9×2=18<20 nên cần ít nhất k=3 chữ số.\nVới 3 chữ số, để số nhỏ nhất thì chữ số hàng trăm phải nhỏ nhất có thể, hai chữ số còn lại lớn nhất có thể (9 và 9, tổng 18).\nChữ số hàng trăm = 20-18 = 2.\nVậy số cần tìm là 299.", answer: "299" },
          { prompt: "Không dùng máy tính, tính nhanh tổng: 1+2+3+...+100 bằng cách ghép cặp.", solution: "Ghép cặp đầu với cuối: (1+100), (2+99), (3+98), ..., (50+51).\nCó tất cả 50 cặp, mỗi cặp đều có tổng bằng 101.\nTổng = 50×101 = 5050.", answer: "5050" },
          { prompt: "Tìm hai số tự nhiên biết tổng của chúng là 100 và nếu lấy số lớn chia cho số bé thì được thương là 3, dư 4.", solution: "Gọi số bé là b, số lớn là a = 3b+4 (theo phép chia có dư).\nTa có a+b=100, tức (3b+4)+b=100 → 4b=96 → b=24.\nSuy ra a=100-24=76.\nVậy hai số cần tìm là 24 và 76.", answer: "24 và 76" },
          { prompt: "Tìm số tự nhiên có 2 chữ số biết số đó gấp đúng 4 lần tổng các chữ số của nó (tìm hết các số thỏa mãn).", solution: "Gọi số cần tìm là 10a+b (a từ 1-9, b từ 0-9). Theo đề: 10a+b=4(a+b) → 6a=3b → b=2a.\nVới a=1,2,3,4 (để b≤9): được các số 12, 24, 36, 48.\nKiểm tra: 12=4×(1+2)=12 ✓; 24=4×6=24 ✓; 36=4×9=36 ✓; 48=4×12=48 ✓.", answer: "12, 24, 36, 48" },
          { prompt: "Tính nhanh: 99×101 (không nhân trực tiếp, dùng hằng đẳng thức (100−1)(100+1)).", solution: "99×101 = (100-1)(100+1) = 100²-1² = 10000-1 = 9999.", answer: "9999" },
          { prompt: "Một phép nhân có tích là 1000, một thừa số hơn thừa số kia 15 đơn vị. Tìm hai thừa số.", solution: "Tìm cặp ước của 1000 có hiệu bằng 15: thử 1000=25×40.\nKiểm tra: 40-25=15 ✓.\nVậy hai thừa số là 25 và 40.", answer: "25 và 40" },
          { prompt: "Tìm x biết: x + (x+1) + (x+2) + ... + (x+9) = 145 (tổng 10 số tự nhiên liên tiếp bắt đầu từ x).", solution: "Tổng = 10x + (0+1+2+...+9) = 10x+45.\n10x+45=145 → 10x=100 → x=10.", answer: "10" },
          { prompt: "Một cửa hàng có số kẹo chia hết cho cả 4, 5 và 6, biết số kẹo trong khoảng từ 100 đến 150. Tìm số kẹo đó.", solution: "BCNN(4,5,6)=60. Bội của 60 trong khoảng 100-150: chỉ có 120.\nVậy số kẹo là 120.", answer: "120" },
          { prompt: "Tìm số tự nhiên nhỏ nhất sao cho khi nhân với 6 được một số có tất cả các chữ số giống nhau (dạng aaaaaa).", solution: "Cần số dạng aaaaaa (a từ 1-9) chia hết cho 6 (chia hết cho cả 2 và 3).\nThử a=1: 111111 lẻ, không chia hết cho 2, loại.\nThử a=2: 222222 chẵn, tổng chữ số=12 chia hết 3, nên 222222 chia hết cho 6.\n222222:6=37037. Đây là số nhỏ nhất thỏa mãn.", answer: "37037" },
          { prompt: "Tìm số tự nhiên x sao cho x² < 50 < (x+1)².", solution: "Thử: 7²=49<50. 8²=64>50.\nVậy x=7." , answer: "7" },
        ],
      },
      {
        id: "phan-so-6",
        title: "Phân số",
        questions: [
          { prompt: "1/2 + 1/3 = ?", options: ["5/6", "2/5", "1/6", "2/6"], correct: 0, explain: "Quy đồng mẫu 6: 3/6 + 2/6 = 5/6." },
          { prompt: "Rút gọn phân số 8/12", options: ["2/3", "4/6", "1/2", "3/4"], correct: 0, explain: "Chia cả tử và mẫu cho ƯCLN(8,12)=4, được 2/3." },
          { prompt: "3/4 × 2/5 = ?", options: ["3/10", "5/9", "6/9", "2/3"], correct: 0, explain: "Nhân tử với tử, mẫu với mẫu: 6/20, rút gọn còn 3/10." },
          { prompt: "Phân số nào lớn hơn: 2/3 hay 3/5?", options: ["2/3", "3/5", "Bằng nhau", "Không so sánh được"], correct: 0, explain: "2/3 ≈ 0,667 còn 3/5 = 0,6, nên 2/3 lớn hơn." },
          { prompt: "1 − 1/4 = ?", options: ["3/4", "1/4", "1/2", "3/3"], correct: 0, explain: "1 = 4/4, nên 4/4 − 1/4 = 3/4." },
          { prompt: "Số nghịch đảo của 5/7 là?", options: ["7/5", "5/7", "-5/7", "1"], correct: 0, explain: "Nghịch đảo của một phân số là đảo ngược tử và mẫu: 7/5." },
        ],
        exercises: [
          { prompt: "Tính: 2/3 + 1/4 − 1/6", solution: "Mẫu số chung nhỏ nhất là 12.\n2/3=8/12, 1/4=3/12, 1/6=2/12.\n8/12+3/12-2/12 = 9/12 = 3/4 (rút gọn).", answer: "3/4 (rút gọn)" },
          { prompt: "Một lớp có 40 học sinh, 3/8 số học sinh thích môn Toán. Hỏi có bao nhiêu học sinh thích Toán?", solution: "Số học sinh thích Toán = 40 × 3/8 = 120/8 = 15 học sinh.", answer: "15 học sinh" },
          { prompt: "So sánh hai phân số 5/6 và 7/9.", solution: "Mẫu số chung nhỏ nhất của 6 và 9 là 18.\n5/6 = 15/18, 7/9 = 14/18.\nVì 15/18 > 14/18 nên 5/6 > 7/9.", answer: "Vì 15/18 > 14/18 nên 5/6 > 7/9" },
          { prompt: "Tính: 3/5 − 1/4", solution: "Mẫu số chung là 20: 12/20-5/20=7/20.", answer: "7/20" },
          { prompt: "Tính: 2/7 × 14/9", solution: "(2×14)/(7×9) = 28/63, rút gọn cho 7 được 4/9.", answer: "28/63, rút gọn cho 7 được 4/9" },
          { prompt: "Tính: 3/4 : 1/2", solution: "Chia phân số bằng nhân với nghịch đảo: 3/4 × 2/1 = 6/4 = 3/2.", answer: "3/2" },
          { prompt: "Một bể nước chứa đầy 3/4 dung tích. Nếu dung tích bể là 200 lít, hiện có bao nhiêu lít nước?", solution: "Số lít hiện có = 200 × 3/4 = 150 lít.", answer: "150 lít" },
          { prompt: "Rút gọn phân số 15/25.", solution: "Chia cả tử và mẫu cho 5: 15/25 = 3/5.", answer: "3/5" },
          { prompt: "Sắp xếp theo thứ tự tăng dần: 1/2, 1/3, 2/5.", solution: "Đổi ra thập phân: 1/3≈0,33; 2/5=0,4; 1/2=0,5.\nThứ tự tăng dần: 1/3, 2/5, 1/2.", answer: "Thứ tự tăng dần: 1/3, 2/5, 1/2" },
          { prompt: "Tính tổng: 1/2 + 1/4 + 1/8", solution: "Mẫu số chung là 8: 4/8+2/8+1/8 = 7/8.", answer: "7/8" },
        ],
        advanced: [
          { prompt: "Tính nhanh: 1/2 + 1/6 + 1/12 + 1/20 + 1/30 (gợi ý: mỗi số hạng có dạng 1/(n×(n+1))).", solution: "1/2=1/(1×2), 1/6=1/(2×3), 1/12=1/(3×4), 1/20=1/(4×5), 1/30=1/(5×6).\nÁp dụng 1/(n×(n+1))=1/n−1/(n+1), các số hạng giữa triệt tiêu nhau:\n(1-1/2)+(1/2-1/3)+(1/3-1/4)+(1/4-1/5)+(1/5-1/6) = 1-1/6 = 5/6.", answer: "5/6" },
          { prompt: "Một số quyển sách chia cho 3 bạn: bạn thứ nhất lấy 1/3 số sách, bạn thứ hai lấy 1/4 số còn lại, bạn thứ ba lấy 5 quyển thì vừa hết. Hỏi ban đầu có bao nhiêu quyển sách?", solution: "Sau khi bạn 1 lấy 1/3, còn lại 2/3 tổng số sách.\nBạn 2 lấy 1/4 của số còn lại, tức 1/4×2/3=1/6 tổng số sách, nên còn lại 2/3-1/6=1/2 tổng số sách.\nBạn 3 lấy 5 quyển vừa hết, nghĩa là 1/2 tổng số sách = 5 quyển.\nVậy tổng số sách ban đầu = 10 quyển.", answer: "10 quyển" },
          { prompt: "So sánh hai phân số 17/35 và 19/41 mà không quy đồng trực tiếp (gợi ý: so sánh khoảng cách của mỗi phân số tới 1/2).", solution: "1/2 − 17/35 = (35-34)/70 = 1/70.\n1/2 − 19/41 = (41-38)/82 = 3/82.\nSo sánh 1/70 và 3/82: 1×82=82 và 3×70=210. Vì 82<210 nên 1/70<3/82.\nNghĩa là 17/35 gần 1/2 hơn 19/41, mà cả hai đều nhỏ hơn 1/2, nên phân số nào gần 1/2 hơn thì lớn hơn.\nVậy 17/35 > 19/41.", answer: "17/35 > 19/41" },
          { prompt: "Tính: 1/3 + 1/6 + 1/9 + 1/18 (tìm mẫu số chung hợp lý).", solution: "Mẫu số chung nhỏ nhất là 18: 6/18+3/18+2/18+1/18 = 12/18 = 2/3.", answer: "2/3" },
          { prompt: "Một mảnh vải, lần đầu cắt đi 2/5, lần sau cắt tiếp 1/3 số vải còn lại, cuối cùng còn lại 20m. Hỏi mảnh vải ban đầu dài bao nhiêu mét?", solution: "Sau lần đầu, còn lại 1-2/5=3/5 tổng số vải.\nSau lần 2, cắt 1/3 của 3/5, còn lại 2/3×3/5=2/5 tổng số vải.\n2/5×tổng=20 → tổng=50m.", answer: "50m" },
          { prompt: "So sánh: 2023/2024 và 2024/2025 (gợi ý: xét phần bù với 1).", solution: "1-2023/2024=1/2024. 1-2024/2025=1/2025.\nVì 1/2024>1/2025 nên 2023/2024<2024/2025.", answer: "2023/2024 < 2024/2025" },
          { prompt: "Rút gọn phân số 84/126 về dạng tối giản.", solution: "ƯCLN(84,126)=42. Chia cả tử và mẫu cho 42: 84/126 = 2/3.", answer: "2/3" },
          { prompt: "Một lớp có số học sinh nam bằng 3/4 số học sinh nữ. Nếu chuyển 3 bạn nam sang lớp khác thì số nam còn lại bằng 2/3 số nữ. Tính số học sinh nam, nữ ban đầu.", solution: "Gọi số nữ=4k, khi đó số nam ban đầu=3k (vì nam=3/4 nữ).\nSau khi chuyển: nam mới=3k-3. Theo đề: 3k-3 = (2/3)×4k = 8k/3.\nNhân cả 2 vế với 3: 9k-9=8k → k=9.\nSố nữ=36, số nam ban đầu=27.", answer: "nam: 27, nữ: 36" },
          { prompt: "Tính: 2/(1×3) + 2/(3×5) + 2/(5×7) (mỗi số hạng viết thành hiệu 2 phân số 1/n − 1/(n+2)).", solution: "2/(1×3)=1-1/3. 2/(3×5)=1/3-1/5. 2/(5×7)=1/5-1/7.\nTổng = 1-1/7 = 6/7 (các số hạng giữa triệt tiêu).", answer: "6/7" },
          { prompt: "Tính: 1 − 1/2 − 1/4 − 1/8 − 1/16", solution: "Quy đồng các phân số trừ: 1/2+1/4+1/8+1/16 = 8/16+4/16+2/16+1/16 = 15/16.\n1-15/16 = 1/16." , answer: "1/16" },
        ],
      },
      {
        id: "tinh-chia-het-6",
        title: "Tính chia hết trong tập hợp số tự nhiên",
        questions: [
          { prompt: "Số nào chia hết cho cả 2 và 5?", options: ["20", "15", "22", "35"], correct: 0, explain: "Số chia hết cho cả 2 và 5 phải có chữ số tận cùng là 0: chỉ 20 thỏa mãn." },
          { prompt: "Số nào sau đây là số nguyên tố?", options: ["17", "21", "27", "33"], correct: 0, explain: "17 chỉ chia hết cho 1 và chính nó. Còn 21=3×7, 27=3³, 33=3×11 đều là hợp số." },
          { prompt: "ƯCLN(18, 24) = ?", options: ["6", "12", "3", "18"], correct: 0, explain: "Ước chung lớn nhất của 18 và 24 là 6." },
          { prompt: "BCNN(6, 8) = ?", options: ["24", "48", "12", "14"], correct: 0, explain: "Bội chung nhỏ nhất của 6 và 8 là 24." },
          { prompt: "Số 45 chia hết cho số nào sau đây?", options: ["9", "4", "7", "8"], correct: 0, explain: "45 = 9×5, nên 45 chia hết cho 9." },
          { prompt: "Ước chung của 12 và 16 là tập hợp nào?", options: ["{1,2,4}", "{1,2,3,4}", "{1,4,8}", "{2,4,6}"], correct: 0, explain: "Ước của 12: {1,2,3,4,6,12}; ước của 16: {1,2,4,8,16}. Ước chung là {1,2,4}." },
        ],
        exercises: [
          { prompt: "Tìm ƯCLN và BCNN của 24 và 36.", solution: "Phân tích ra thừa số nguyên tố: 24=2³×3, 36=2²×3².\nƯCLN = lấy thừa số chung, số mũ nhỏ nhất: 2²×3 = 12.\nBCNN = lấy tất cả thừa số, số mũ lớn nhất: 2³×3² = 72.", answer: "72" },
          { prompt: "Số 234 có chia hết cho 3 không? Vì sao?", solution: "Tổng các chữ số: 2+3+4 = 9.\nVì 9 chia hết cho 3, nên theo dấu hiệu chia hết cho 3, số 234 chia hết cho 3.", answer: "3." },
          { prompt: "Tìm tất cả các ước của 30.", solution: "30 = 2×3×5.\nCác ước của 30: 1, 2, 3, 5, 6, 10, 15, 30.", answer: "1, 2, 3, 5, 6, 10, 15, 30" },
          { prompt: "Tìm ƯCLN(15, 20).", solution: "15=3×5, 20=2²×5.\nƯCLN = 5.", answer: "5" },
          { prompt: "Tìm BCNN(10, 15).", solution: "10=2×5, 15=3×5.\nBCNN = 2×3×5 = 30.", answer: "30" },
          { prompt: "Số 4152 có chia hết cho 4 không?", solution: "Xét 2 chữ số cuối: 52. 52:4=13, chia hết.\nVậy 4152 chia hết cho 4.", answer: "4152 chia hết cho 4" },
          { prompt: "Tìm tất cả ước chung của 20 và 30.", solution: "Ước của 20: {1,2,4,5,10,20}. Ước của 30: {1,2,3,5,6,10,15,30}.\nƯớc chung: {1,2,5,10}.", answer: "Ước chung: {1,2,5,10}" },
          { prompt: "Trong các số 13, 21, 29, 31, số nào là hợp số?", solution: "21 = 3×7 là hợp số (có nhiều hơn 2 ước).\nCác số 13, 29, 31 chỉ chia hết cho 1 và chính nó, là số nguyên tố.", answer: "1" },
          { prompt: "Tìm số nhỏ nhất chia hết cho cả 4 và 6.", solution: "Số đó chính là BCNN(4,6) = 12.", answer: "12" },
          { prompt: "Một đội có 18 nam, 24 nữ, muốn chia thành các nhóm bằng nhau, mỗi nhóm có cả nam và nữ. Hỏi chia được nhiều nhất bao nhiêu nhóm?", solution: "Số nhóm nhiều nhất = ƯCLN(18,24) = 6 nhóm.", answer: "6 nhóm" },
        ],
        advanced: [
          { prompt: "Tìm số tự nhiên nhỏ nhất khác 0 chia hết cho tất cả các số từ 1 đến 10.", solution: "Đây chính là BCNN(1,2,...,10). Phân tích ra thừa số nguyên tố cần lấy: 2³ (từ số 8), 3² (từ số 9), 5 (từ số 5 hoặc 10), 7 (từ số 7).\nBCNN = 8×9×5×7 = 2520.", answer: "2520" },
          { prompt: "Chứng tỏ tổng của 5 số tự nhiên liên tiếp luôn chia hết cho 5.", solution: "Gọi 5 số tự nhiên liên tiếp là n, n+1, n+2, n+3, n+4.\nTổng = n+(n+1)+(n+2)+(n+3)+(n+4) = 5n+10 = 5(n+2), luôn chia hết cho 5 với mọi n.", answer: "5(n+2), luôn chia hết cho 5" },
          { prompt: "Một số tự nhiên nhỏ hơn 100, khi chia cho 3 dư 2, khi chia cho 4 dư 3, khi chia cho 5 dư 4. Tìm số đó.", solution: "Nhận xét: nếu gọi số cần tìm là x thì x+1 chia hết cho cả 3, 4 và 5 (vì dư luôn kém số chia đúng 1 đơn vị).\nBCNN(3,4,5) = 60, nên x+1=60 → x=59 (vì x<100 nên không xét x+1=120).\nKiểm tra: 59:3 dư 2 ✓, 59:4 dư 3 ✓, 59:5 dư 4 ✓.", answer: "59" },
          { prompt: "Tìm số tự nhiên nhỏ nhất có 4 chữ số chia hết cho 7.", solution: "1000:7 ≈ 142,86, làm tròn lên 143.\n143×7=1001. Vậy số cần tìm là 1001.", answer: "1001" },
          { prompt: "Tìm các số tự nhiên nhỏ hơn 50 chia hết cho cả 2 và 3 nhưng không chia hết cho 4.", solution: "Chia hết cho cả 2 và 3 nghĩa là chia hết cho 6: 6,12,18,24,30,36,42,48.\nLoại các số chia hết cho 4: 12,24,36,48 (loại).\nCòn lại: 6, 18, 30, 42.", answer: "6, 18, 30, 42" },
          { prompt: "Tìm hai số tự nhiên biết ƯCLN=6, BCNN=90, và tổng hai số bằng 48.", solution: "Gọi hai số là 6a, 6b với ƯCLN(a,b)=1. BCNN=6ab=90 → ab=15.\nCác cặp (a,b) nguyên tố cùng nhau có tích 15: (1,15) hoặc (3,5).\nVới (1,15): hai số là 6,90, tổng=96 (loại). Với (3,5): hai số là 18,30, tổng=48 ✓.\nVậy hai số là 18 và 30.", answer: "18 và 30" },
          { prompt: "Một số có 3 chữ số dạng 54x chia hết cho 9. Tìm các giá trị có thể của x.", solution: "Tổng các chữ số: 5+4+x=9+x phải chia hết cho 9.\nVới x từ 0-9: x=0 (tổng=9) hoặc x=9 (tổng=18) đều chia hết cho 9.\nVậy số đó là 540 hoặc 549.", answer: "x=0 (số 540) hoặc x=9 (số 549)" },
          { prompt: "Trong các số tự nhiên từ 1 đến 100, có bao nhiêu số chia hết cho 3 hoặc chia hết cho 5?", solution: "Số chia hết cho 3: ⌊100/3⌋=33 số. Số chia hết cho 5: ⌊100/5⌋=20 số.\nSố chia hết cho cả 3 và 5 (tức chia hết cho 15): ⌊100/15⌋=6 số.\nTheo nguyên lý bù trừ: 33+20-6=47 số.", answer: "47" },
          { prompt: "Chứng minh tích của hai số tự nhiên liên tiếp luôn chia hết cho 2.", solution: "Gọi hai số tự nhiên liên tiếp là n và n+1.\nTrong hai số liên tiếp, luôn có đúng một số chẵn (chia hết cho 2).\nDo đó tích n×(n+1) luôn chia hết cho 2.", answer: "Luôn chia hết cho 2 (vì có 1 trong 2 số là số chẵn)" },
          { prompt: "Tìm số tự nhiên nhỏ nhất chia hết cho 12 và có tổng các chữ số bằng 9.", solution: "Xét các bội của 12: 12, 24, 36, 48,...\nKiểm tra tổng chữ số: 36 có 3+6=9 ✓ (là bội nhỏ nhất thỏa mãn).\nVậy số cần tìm là 36." , answer: "36" },
        ],
      },
      {
        id: "so-nguyen-6",
        title: "Số nguyên",
        questions: [
          { prompt: "(−5) + 8 = ?", options: ["3", "-3", "13", "-13"], correct: 0, explain: "8 lớn hơn 5 nên kết quả dương: 8-5=3." },
          { prompt: "(−12) − (−4) = ?", options: ["-8", "8", "-16", "16"], correct: 0, explain: "Trừ đi một số âm bằng cộng với số đối: -12+4=-8." },
          { prompt: "(−3) × 6 = ?", options: ["-18", "18", "-9", "9"], correct: 0, explain: "Âm nhân dương ra âm: 3×6=18, nên kết quả là -18." },
          { prompt: "|−9| + |−5| = ?", options: ["14", "-14", "4", "-4"], correct: 0, explain: "Giá trị tuyệt đối luôn dương: 9+5=14." },
          { prompt: "Số đối của −7 là?", options: ["7", "-7", "0", "1"], correct: 0, explain: "Số đối của một số là số có cùng khoảng cách tới 0 nhưng khác dấu: đối của -7 là 7." },
          { prompt: "Sắp xếp tăng dần: −3, 5, −8, 0", options: ["-8, -3, 0, 5", "5, 0, -3, -8", "-3, -8, 0, 5", "0, -3, -8, 5"], correct: 0, explain: "Trên trục số, số càng nhỏ (âm nhiều) càng nằm bên trái: -8 < -3 < 0 < 5." },
        ],
        exercises: [
          { prompt: "Tính: (−15) + 23 − 8", solution: "(-15)+23 = 8.\n8-8 = 0.", answer: "0" },
          { prompt: "Tính: (−4)×(−3) + (−2)×5", solution: "(-4)×(-3) = 12 (âm nhân âm ra dương).\n(-2)×5 = -10.\n12+(-10) = 2.", answer: "2" },
          { prompt: "Sắp xếp các số sau theo thứ tự giảm dần: −10, 5, −3, 0, 8", solution: "Trên trục số, số càng lớn càng nằm bên phải.\nThứ tự giảm dần: 8, 5, 0, -3, -10.", answer: "Thứ tự giảm dần: 8, 5, 0, -3, -10" },
          { prompt: "Tính: 20 − (−15) + (−8)", solution: "20+15-8 = 27.", answer: "27" },
          { prompt: "Tính: (−6) × (−2) − 10", solution: "(-6)×(-2)=12. 12-10=2.", answer: "2" },
          { prompt: "Tìm x biết: x + 5 = −3", solution: "x = -3-5 = -8.", answer: "-8" },
          { prompt: "Nhiệt độ buổi sáng là −3°C, đến trưa tăng thêm 8°C. Nhiệt độ buổi trưa là bao nhiêu?", solution: "Nhiệt độ buổi trưa = -3+8 = 5°C.", answer: "5°C" },
          { prompt: "Tính: |−12| − |−7|", solution: "|-12|=12, |-7|=7. 12-7=5.", answer: "5" },
          { prompt: "Tính: (−2)³ + (−3)²", solution: "(-2)³=-8, (-3)²=9. -8+9=1.", answer: "1" },
          { prompt: "So sánh: (−5)+3 và (−2)", solution: "(-5)+3 = -2. Vậy hai giá trị này bằng nhau.", answer: "-2. Vậy hai giá trị này bằng nhau" },
        ],
        advanced: [
          { prompt: "Tính tổng: (−1)+2+(−3)+4+...+(−99)+100 (100 số hạng, dấu xen kẽ).", solution: "Ghép cặp liên tiếp: (-1+2)+(-3+4)+...+(-99+100).\nCó 50 cặp, mỗi cặp đều bằng 1.\nTổng = 50×1 = 50.", answer: "50" },
          { prompt: "Tìm tất cả số nguyên x thỏa mãn: |x−3| + |x+5| = 8 và −5≤x≤3.", solution: "Với -5≤x≤3: vì x≤3 nên |x-3|=3-x; vì x≥-5 nên |x+5|=x+5.\nTổng = (3-x)+(x+5) = 8, đúng với MỌI x trong khoảng này (x triệt tiêu).\nVậy mọi số nguyên x từ -5 đến 3 đều thỏa mãn: x∈{-5,-4,-3,-2,-1,0,1,2,3}.", answer: "x∈{-5,-4,-3,-2,-1,0,1,2,3}" },
          { prompt: "Tích của 3 số nguyên là một số âm. Hỏi trong 3 số đó có thể có bao nhiêu số âm? (nêu đủ các trường hợp)", solution: "Tích của các số nguyên mang dấu âm khi số lượng thừa số âm là số LẺ.\nVới 3 số, số lẻ có thể là 1 hoặc 3.\nVậy có thể có 1 số âm (và 2 số dương), hoặc cả 3 số đều âm.", answer: "1 số âm hoặc 3 số âm" },
          { prompt: "Tính: 15 + (−8) + (−15) + 8 (nhóm các số đối nhau).", solution: "Nhóm: (15+(-15)) + ((-8)+8) = 0+0 = 0.", answer: "0" },
          { prompt: "Tìm x nguyên biết: (x−3)(x+5) < 0", solution: "Tích âm khi hai nhân tử trái dấu: -5<x<3.\nCác giá trị x nguyên thỏa mãn: -4,-3,-2,-1,0,1,2.", answer: "-4,-3,-2,-1,0,1,2" },
          { prompt: "Một thang máy ở tầng −3 (hầm 3), đi lên 8 tầng rồi đi xuống 5 tầng. Hỏi thang máy đang ở tầng nào?", solution: "Tầng hiện tại = -3+8-5 = 0.\nVậy thang máy đang ở tầng 0 (tầng trệt).", answer: "Tầng 0" },
          { prompt: "Tính tổng: 1−2+3−4+...+99−100 (100 số hạng, dấu xen kẽ).", solution: "Ghép cặp: (1-2)+(3-4)+...+(99-100). Có 50 cặp, mỗi cặp bằng -1.\nTổng = 50×(-1) = -50.", answer: "-50" },
          { prompt: "Tìm hai số nguyên liên tiếp biết tích của chúng bằng 132.", solution: "Gọi hai số liên tiếp là n, n+1: n(n+1)=132.\nThử n=11: 11×12=132 ✓.\nVậy hai số là 11 và 12 (hoặc -12 và -11 cũng thỏa mãn vì (-12)×(-11)=132).", answer: "11 và 12 (hoặc -12 và -11)" },
          { prompt: "Tính: (−2)³ × (−3)² − (−1)¹⁰⁰", solution: "(-2)³=-8. (-3)²=9. (-8)×9=-72.\n(-1)¹⁰⁰=1 (số mũ chẵn).\nKết quả = -72-1 = -73.", answer: "-73" },
          { prompt: "Tính: |−7| − |−3| + (−5)", solution: "|-7|=7, |-3|=3.\n7-3+(-5) = 4-5 = -1." , answer: "-1" },
        ],
      },
      {
        id: "so-thap-phan-6",
        title: "Số thập phân",
        questions: [
          { prompt: "3,5 + 2,75 = ?", options: ["6,25", "6,15", "5,25", "6,5"], correct: 0, explain: "Cộng thẳng hàng các chữ số thập phân: 3,50+2,75=6,25." },
          { prompt: "4,8 − 1,35 = ?", options: ["3,45", "3,55", "3,35", "3,65"], correct: 0, explain: "4,80-1,35=3,45." },
          { prompt: "2,5 × 4 = ?", options: ["10", "8", "12", "9"], correct: 0, explain: "2,5×4=10." },
          { prompt: "7,2 : 3 = ?", options: ["2,4", "2,6", "2,2", "3,4"], correct: 0, explain: "7,2 chia 3 được 2,4." },
          { prompt: "Làm tròn 3,478 đến chữ số thập phân thứ nhất", options: ["3,5", "3,4", "3,48", "3,0"], correct: 0, explain: "Chữ số hàng phần trăm là 7 (≥5) nên làm tròn lên: 3,478 ≈ 3,5." },
          { prompt: "Số nào lớn hơn: 0,6 hay 0,59?", options: ["0,6", "0,59", "Bằng nhau", "Không so sánh được"], correct: 0, explain: "0,6 = 0,60 > 0,59." },
        ],
        exercises: [
          { prompt: "Tính: 12,5 + 3,75 − 2,25", solution: "12,5 + 3,75 = 16,25.\n16,25 - 2,25 = 14.", answer: "14" },
          { prompt: "Một cửa hàng giảm giá 20% cho sản phẩm giá 150.000đ. Giá sau khi giảm là bao nhiêu?", solution: "Số tiền giảm = 150.000 × 20% = 150.000 × 0,2 = 30.000đ.\nGiá sau giảm = 150.000 - 30.000 = 120.000đ.", answer: "120.000đ" },
          { prompt: "Làm tròn số 7,896 đến hàng phần trăm.", solution: "Chữ số hàng phần nghìn là 6, ≥5 nên làm tròn lên.\n7,896 ≈ 7,90.", answer: "7,896 ≈ 7,90" },
          { prompt: "Tính: 6,4 × 0,5", solution: "6,4×0,5 = 3,2.", answer: "3,2" },
          { prompt: "Tính: 15,6 : 4", solution: "15,6:4 = 3,9.", answer: "3,9" },
          { prompt: "Một chiếc áo giá 250.000đ, được giảm 15%. Tính giá sau khi giảm.", solution: "Số tiền giảm = 250.000×0,15 = 37.500đ.\nGiá sau giảm = 250.000-37.500 = 212.500đ.", answer: "212.500đ" },
          { prompt: "So sánh: 3,14 và 3,141", solution: "3,140 < 3,141, vậy 3,141 > 3,14.", answer: "3,140 < 3,141, vậy 3,141 > 3,14" },
          { prompt: "Tính: 8,25 + 1,75", solution: "8,25+1,75 = 10.", answer: "10" },
          { prompt: "Làm tròn số 15,647 đến hàng đơn vị.", solution: "Chữ số hàng phần mười là 6, ≥5 nên làm tròn lên.\n15,647 ≈ 16.", answer: "15,647 ≈ 16" },
          { prompt: "Một xe đi được 45,5km trong 0,5 giờ. Tính vận tốc trung bình (km/h).", solution: "Vận tốc = quãng đường : thời gian = 45,5:0,5 = 91km/h.", answer: "91km/h" },
        ],
        advanced: [
          { prompt: "Tìm số thập phân x biết: x + 2x + 3x = 24,6", solution: "Gộp các số hạng: x+2x+3x = 6x.\n6x = 24,6 → x = 4,1.", answer: "4,1" },
          { prompt: "Không quy đồng, tính nhanh: 34,5×2025 − 34,5×2024", solution: "Đặt thừa số chung: 34,5×2025 − 34,5×2024 = 34,5×(2025−2024) = 34,5×1 = 34,5.", answer: "34,5" },
          { prompt: "Tìm số thập phân có 2 chữ số ở phần thập phân, biết khi xóa dấu phẩy thì số mới hơn số cũ đúng 19,8.", solution: "Gọi số cần tìm là x. Vì có 2 chữ số thập phân, xóa dấu phẩy tương đương với việc nhân x với 100.\nTheo đề: 100x − x = 19,8 → 99x = 19,8 → x = 0,2.\nKiểm tra: viết đủ 2 chữ số thập phân là 0,20; xóa dấu phẩy được 20; 20−0,2=19,8 ✓.", answer: "0,2" },
          { prompt: "Tính: 12,5×8 − 25×4 (nhận xét cả hai tích đều bằng 100).", solution: "12,5×8=100. 25×4=100.\nHiệu = 100-100 = 0.", answer: "0" },
          { prompt: "Tìm số thập phân x biết: 3x − 1,5 = x + 4,5", solution: "3x-x = 4,5+1,5 → 2x=6 → x=3.", answer: "3" },
          { prompt: "So sánh nhanh (không tính trực tiếp): 7,89×99 và 789−7,89.", solution: "7,89×99 = 7,89×(100-1) = 789-7,89.\nVậy hai biểu thức bằng nhau.", answer: "Bằng nhau" },
          { prompt: "Tìm số thập phân x, biết số đó nhân với 10 rồi trừ đi chính nó bằng 40,5.", solution: "10x − x = 40,5 → 9x=40,5 → x=4,5.", answer: "4,5" },
          { prompt: "Một đội xây dựng làm được 0,25 công trình trong 1 ngày (năng suất không đổi). Hỏi cần bao nhiêu ngày để hoàn thành toàn bộ công trình?", solution: "Số ngày cần = 1 : 0,25 = 4 ngày.", answer: "4 ngày" },
          { prompt: "Tính giá trị biểu thức: 1,1+2,2+3,3+...+9,9 (9 số hạng).", solution: "Mỗi số hạng có dạng 1,1×k với k=1,2,...,9.\nTổng = 1,1×(1+2+...+9) = 1,1×45 = 49,5.", answer: "49,5" },
          { prompt: "Tính: 0,5×0,5 + 0,5×0,5", solution: "= 0,25+0,25 = 0,5 (hoặc dùng: 0,5×0,5×2=0,5)." , answer: "0,5" },
        ],
      },
      {
        id: "hinh-hoc-co-ban-6",
        title: "Những hình hình học cơ bản",
        questions: [
          { prompt: "Qua hai điểm phân biệt, vẽ được bao nhiêu đường thẳng?", options: ["Chỉ 1 đường thẳng duy nhất", "2 đường thẳng", "Vô số đường thẳng", "Không vẽ được đường thẳng nào"], correct: 0, explain: "Tiên đề cơ bản: qua hai điểm phân biệt chỉ có duy nhất một đường thẳng." },
          { prompt: "Tia là hình gồm điểm gốc và?", options: ["Một phần đường thẳng bị giới hạn bởi điểm gốc, kéo dài về một phía", "Toàn bộ đường thẳng", "Hai điểm bất kỳ trên mặt phẳng", "Một đoạn thẳng có hai đầu mút"], correct: 0, explain: "Tia có một điểm gốc cố định và kéo dài vô hạn về một phía." },
          { prompt: "Trung điểm của đoạn thẳng AB là điểm nào?", options: ["Điểm nằm giữa A, B và cách đều A, B", "Điểm nằm ngoài đoạn AB", "Trùng với điểm A", "Trùng với điểm B"], correct: 0, explain: "Trung điểm là điểm chia đoạn thẳng thành hai phần bằng nhau." },
          { prompt: "Đoạn thẳng AB dài 10cm, M là trung điểm AB. Độ dài AM bằng?", options: ["5cm", "10cm", "2,5cm", "20cm"], correct: 0, explain: "Trung điểm chia đôi đoạn thẳng: AM = AB/2 = 10/2 = 5cm." },
          { prompt: "Góc vuông có số đo bằng?", options: ["90°", "180°", "45°", "60°"], correct: 0, explain: "Theo định nghĩa, góc vuông có số đo đúng bằng 90°." },
          { prompt: "Góc bẹt có số đo bằng?", options: ["180°", "90°", "360°", "270°"], correct: 0, explain: "Góc bẹt là góc có hai cạnh là hai tia đối nhau, số đo bằng 180°." },
        ],
        exercises: [
          { prompt: "Cho đoạn thẳng AB dài 12cm. Gọi M là trung điểm AB. Tính AM và MB.", solution: "Vì M là trung điểm nên AM = MB = AB/2 = 12/2 = 6cm.", answer: "6cm" },
          { prompt: "Một góc có số đo 35°. Góc đó là góc nhọn, vuông, tù hay bẹt?", solution: "Vì 35° < 90° nên đây là góc nhọn.", answer: "Vì 35° < 90° nên đây là góc nhọn" },
          { prompt: "Cho 3 điểm A, B, C thẳng hàng, B nằm giữa A và C, AB=5cm, BC=7cm. Tính AC.", solution: "Vì B nằm giữa A và C nên AC = AB + BC = 5 + 7 = 12cm.", answer: "12cm" },
          { prompt: "Cho góc xOy = 120°. Tia Oz nằm giữa Ox, Oy sao cho góc xOz=50°. Tính góc zOy.", solution: "Vì Oz nằm giữa Ox và Oy: góc xOz + góc zOy = góc xOy.\ngóc zOy = 120°-50° = 70°.", answer: "70°" },
          { prompt: "Đoạn thẳng AB=8cm. Điểm M nằm giữa A, B sao cho AM=3cm. Tính MB.", solution: "MB = AB - AM = 8-3 = 5cm.", answer: "5cm" },
          { prompt: "Ba điểm A, B, C thẳng hàng, AB=6cm, AC=10cm, B nằm giữa A và C. Tính BC.", solution: "BC = AC - AB = 10-6 = 4cm.", answer: "4cm" },
          { prompt: "Một góc có số đo 150°. Đây là góc nhọn, vuông, tù hay bẹt?", solution: "Vì 90°<150°<180° nên đây là góc tù.", answer: "Vì 90°<150°<180° nên đây là góc tù" },
          { prompt: "Cho đoạn thẳng CD=14cm, N là trung điểm CD. Tính CN.", solution: "CN = CD/2 = 14/2 = 7cm.", answer: "7cm" },
          { prompt: "Hai góc kề bù có tổng số đo bằng bao nhiêu?", solution: "Hai góc kề bù luôn có tổng số đo bằng 180° (góc bẹt).", answer: "180°" },
          { prompt: "Một góc bằng 1/3 góc vuông. Tính số đo góc đó.", solution: "Số đo góc = 90°/3 = 30°.", answer: "30°" },
        ],
        advanced: [
          { prompt: "Cho 5 điểm nằm trên một đường thẳng. Hỏi có bao nhiêu đoạn thẳng được tạo thành từ các cặp điểm đó?", solution: "Mỗi cặp trong 5 điểm tạo thành một đoạn thẳng khác nhau, số cặp là C(5,2) = (5×4)/2 = 10.", answer: "10" },
          { prompt: "Trên tia Ox lấy các điểm A, B, C sao cho OA=3cm, OB=7cm, OC=12cm. Tính AB, BC và so sánh AB+BC với AC.", solution: "Vì A,B,C cùng nằm trên tia Ox theo thứ tự xa dần gốc O nên: AB=OB-OA=7-3=4cm. BC=OC-OB=12-7=5cm. AC=OC-OA=12-3=9cm.\nAB+BC=4+5=9=AC. Vậy AB+BC=AC (vì B nằm giữa A và C).", answer: "AB=4cm, BC=5cm, AB+BC=AC=9cm" },
          { prompt: "Cho góc bẹt xOy. Vẽ 3 tia Oa, Ob, Oc nằm trong góc đó sao cho chia góc bẹt thành 4 góc bằng nhau. Tính góc xOb (Ob là tia thứ hai kể từ Ox).", solution: "Góc bẹt có số đo 180°. Chia thành 4 góc bằng nhau: mỗi góc = 180°:4 = 45°.\nGóc xOb gồm 2 góc nhỏ liên tiếp kể từ Ox: xOb = 2×45° = 90°.", answer: "90°" },
          { prompt: "Cho 6 điểm nằm trên một đường thẳng. Hỏi có bao nhiêu đoạn thẳng được tạo thành?", solution: "Số đoạn thẳng = C(6,2) = (6×5)/2 = 15." , answer: "15" },
          { prompt: "Một góc bẹt được chia bởi 5 tia thành 6 góc bằng nhau. Tính mỗi góc và tính góc tạo bởi tia đầu tiên và tia thứ 3.", solution: "Mỗi góc = 180°:6 = 30°.\nGóc từ tia đầu đến tia thứ 3 = 2×30° = 60°.", answer: "mỗi góc 30°; góc đến tia thứ 3 là 60°" },
          { prompt: "Đoạn thẳng AB=20cm, C là điểm nằm giữa A, B sao cho AC=3×CB. Tính AC, CB.", solution: "AC+CB=20. Vì AC=3CB: 3CB+CB=20 → 4CB=20 → CB=5cm, AC=15cm.", answer: "AC=15cm, CB=5cm" },
          { prompt: "Vẽ 4 đường thẳng đôi một cắt nhau, không có 3 đường nào đồng quy. Hỏi tạo thành nhiều nhất bao nhiêu giao điểm?", solution: "Mỗi cặp đường thẳng cho 1 giao điểm: C(4,2) = 6 giao điểm.", answer: "6" },
          { prompt: "Cho góc AOB=100°. Vẽ tia OC (nằm trong góc) sao cho góc AOC=40°. Tính góc COB, rồi vẽ tiếp tia phân giác OD của góc COB và tính góc AOD.", solution: "COB = AOB-AOC = 100°-40° = 60°.\nTia phân giác OD chia COB thành 2 góc 30° mỗi góc.\nAOD = AOC+COD = 40°+30° = 70°.", answer: "COB=60°, AOD=70°" },
          { prompt: "Trên đường thẳng xy lấy điểm O. Vẽ tia Oz sao cho góc xOz=70°. Tính góc yOz.", solution: "Vì xy là đường thẳng, góc xOz và góc yOz kề bù (tổng 180°).\nyOz = 180°-70° = 110°.", answer: "110°" },
          { prompt: "Tính số đo góc phụ với góc 35°.", solution: "Hai góc phụ nhau có tổng 90°: 90°-35°=55°." , answer: "55°" },
        ],
      },
      {
        id: "du-lieu-xac-suat-6",
        title: "Dữ liệu và xác suất thực nghiệm",
        questions: [
          { prompt: "Biểu đồ cột thường được dùng để làm gì?", options: ["So sánh số liệu giữa các nhóm/đối tượng", "Chỉ để trang trí bài viết", "Thay thế cho phép cộng", "Không có tác dụng gì đặc biệt"], correct: 0, explain: "Biểu đồ cột giúp trực quan hóa và so sánh số liệu giữa các nhóm." },
          { prompt: "Tung một đồng xu 20 lần, ra mặt sấp 12 lần. Xác suất thực nghiệm xuất hiện mặt sấp là?", options: ["0,6", "0,4", "12", "20"], correct: 0, explain: "Xác suất thực nghiệm = số lần xuất hiện / tổng số lần thử = 12/20 = 0,6." },
          { prompt: "Gieo xúc xắc 50 lần, mặt 6 chấm xuất hiện 9 lần. Xác suất thực nghiệm của biến cố ra mặt 6 chấm là?", options: ["9/50", "50/9", "9", "50"], correct: 0, explain: "Xác suất thực nghiệm = số lần thuận lợi / tổng số lần thử = 9/50." },
          { prompt: "Dữ liệu thống kê có thể thu thập bằng cách nào?", options: ["Quan sát, phỏng vấn, hoặc lấy từ nguồn có sẵn", "Chỉ đoán mò không cần căn cứ", "Không cần thu thập gì cả", "Chỉ dùng trí nhớ cá nhân"], correct: 0, explain: "Đây là các phương pháp thu thập dữ liệu cơ bản, đáng tin cậy." },
          { prompt: "Biểu đồ tranh biểu diễn số liệu bằng cách nào?", options: ["Dùng hình ảnh/ký hiệu lặp lại để biểu diễn số lượng", "Chỉ ghi số liệu thô không có hình ảnh", "Vẽ một đường thẳng duy nhất", "Chỉ dùng một hình tròn duy nhất"], correct: 0, explain: "Biểu đồ tranh dùng các ký hiệu hình ảnh lặp lại, mỗi ký hiệu đại diện cho một số lượng nhất định." },
          { prompt: "Kết quả có thể khi gieo một con xúc xắc 6 mặt là?", options: ["1, 2, 3, 4, 5, 6", "Chỉ 1 và 6", "Vô hạn kết quả", "Không thể xác định trước"], correct: 0, explain: "Xúc xắc 6 mặt có đúng 6 kết quả có thể xảy ra, đánh số từ 1 đến 6." },
        ],
        exercises: [
          { prompt: "Tung một đồng xu 50 lần, thấy có 28 lần ra mặt sấp. Tính xác suất thực nghiệm ra mặt sấp.", solution: "Xác suất thực nghiệm = số lần ra mặt sấp / tổng số lần tung = 28/50 = 0,56.", answer: "0,56" },
          { prompt: "Khảo sát môn thể thao yêu thích của 30 bạn trong lớp: 12 bạn thích bóng đá, 10 bạn thích cầu lông, 8 bạn thích bơi. Tính tỉ lệ phần trăm số bạn thích bóng đá.", solution: "Tỉ lệ = 12/30 = 0,4 = 40%.", answer: "40%" },
          { prompt: "Gieo 1 con xúc xắc 60 lần, mặt 3 chấm xuất hiện 11 lần. Tính xác suất thực nghiệm xuất hiện mặt 3 chấm.", solution: "Xác suất thực nghiệm = 11/60 ≈ 0,183 (khoảng 18,3%).", answer: "11/60 ≈ 0,183 (khoảng 18,3%)" },
          { prompt: "Gieo 1 đồng xu 100 lần, có 45 lần ra mặt ngửa. Tính xác suất thực nghiệm ra mặt ngửa.", solution: "Xác suất thực nghiệm = 45/100 = 0,45.", answer: "0,45" },
          { prompt: "Một hộp có bi xanh, đỏ, vàng. Sau 40 lần rút (có hoàn lại), có 15 lần được bi đỏ. Ước lượng xác suất rút được bi đỏ.", solution: "Xác suất thực nghiệm = 15/40 = 0,375.", answer: "0,375" },
          { prompt: "Một lớp 35 học sinh, khảo sát môn thể thao yêu thích: 14 bóng đá, 12 cầu lông, 9 bơi. Tính tỉ lệ % số bạn thích cầu lông.", solution: "Tỉ lệ = 12/35 ≈ 0,343 = 34,3%.", answer: "34,3%" },
          { prompt: "Gieo xúc xắc 30 lần, mặt 1 chấm xuất hiện 6 lần. Tính xác suất thực nghiệm xuất hiện mặt 1 chấm.", solution: "Xác suất thực nghiệm = 6/30 = 0,2.", answer: "0,2" },
          { prompt: "Bảng điểm kiểm tra của 1 tổ 10 bạn: 3 bạn điểm 10, 5 bạn điểm 8, 2 bạn điểm 6. Tính tỉ lệ % số bạn đạt điểm 10.", solution: "Tỉ lệ = 3/10 = 0,3 = 30%.", answer: "30%" },
          { prompt: "Tung một đồng xu 200 lần được 98 lần mặt sấp. Xác suất thực nghiệm ra mặt sấp gần với xác suất lý thuyết (1/2) như thế nào?", solution: "Xác suất thực nghiệm = 98/200 = 0,49, rất gần với xác suất lý thuyết 0,5.", answer: "0,49, rất gần với xác suất lý thuyết 0,5" },
          { prompt: "Trong 50 lần quay 1 vòng quay may mắn có 4 phần bằng nhau, có 11 lần trúng phần \"Quà tặng\". Tính xác suất thực nghiệm trúng \"Quà tặng\".", solution: "Xác suất thực nghiệm = 11/50 = 0,22.", answer: "0,22" },
        ],
        advanced: [
          { prompt: "Gieo 1 đồng xu n lần thấy số lần ra mặt ngửa nhiều hơn số lần ra mặt sấp đúng 3 lần, tổng cộng có 37 lần gieo. Tính số lần ra mặt ngửa.", solution: "Gọi số lần ngửa là x, số lần sấp là y. Ta có x-y=3 và x+y=37.\nCộng hai phương trình: 2x=40 → x=20.", answer: "20" },
          { prompt: "Một hộp có bi đỏ và bi xanh, tổng cộng 29 viên. Nếu lấy ra 1 bi đỏ thì số bi đỏ còn lại đúng bằng một nửa tổng số bi còn lại trong hộp. Tính số bi đỏ ban đầu.", solution: "Gọi số bi đỏ ban đầu là x. Sau khi lấy 1 bi đỏ, hộp còn 29-1=28 viên, trong đó có x-1 bi đỏ.\nTheo đề: x-1 = 28:2 = 14 → x=15.", answer: "15" },
          { prompt: "Một lớp 40 học sinh, số bạn thích Toán nhiều hơn số bạn thích Văn là 8 bạn, có 12 bạn thích cả 2 môn, và mọi bạn đều thích ít nhất 1 trong 2 môn. Tính số bạn chỉ thích Toán.", solution: "Gọi số bạn thích Toán là T, thích Văn là V. Vì mọi bạn thích ít nhất 1 môn nên theo nguyên lý bù trừ: T+V-12=40 → T+V=52.\nMặt khác T-V=8. Cộng hai phương trình: 2T=60 → T=30.\nSố bạn chỉ thích Toán (không thích Văn) = T-12 = 30-12 = 18.", answer: "18" },
          { prompt: "Trong 60 lần tung 1 đồng xu, có x lần sấp, biết x hơn số lần ngửa 12 lần. Tính x.", solution: "Số lần ngửa = x-12. Tổng: x+(x-12)=60 → 2x=72 → x=36.", answer: "36" },
          { prompt: "Một lớp có 2 tổ: tổ 1 có 15 học sinh điểm trung bình 7, tổ 2 có 20 học sinh điểm trung bình 8. Tính điểm trung bình cả lớp.", solution: "Tổng điểm = 15×7+20×8 = 105+160 = 265.\nTổng học sinh = 35. Trung bình = 265:35 ≈ 7,57.", answer: "≈7,57" },
          { prompt: "Gieo 1 xúc xắc 90 lần, mặt 6 chấm xuất hiện với tần số gấp đôi mặt 1 chấm, biết tần số mặt 1 chấm là 12. Tính xác suất thực nghiệm ra mặt 6 chấm.", solution: "Tần số mặt 6 = 2×12 = 24.\nXác suất thực nghiệm = 24/90 = 4/15.", answer: "4/15" },
          { prompt: "Một hộp có tổng 60 viên bi 3 màu đỏ, xanh, vàng theo tỉ lệ 2:3:5. Tính số bi mỗi màu.", solution: "Tổng phần = 2+3+5=10.\nĐỏ = 60×2/10=12. Xanh = 60×3/10=18. Vàng = 60×5/10=30.", answer: "đỏ 12, xanh 18, vàng 30" },
          { prompt: "Biểu đồ cột thể hiện số sách 5 bạn đọc trong tháng: 3, 5, 2, x, 6 với tổng cộng 22 quyển. Tìm x.", solution: "3+5+2+x+6=22 → 16+x=22 → x=6.", answer: "6" },
          { prompt: "Rút thăm trúng thưởng: 1 hộp có 100 phiếu, trong đó 5 phiếu trúng giải. Sau khi 20 người đã rút (không hoàn lại) mà không ai trúng, tính xác suất người thứ 21 rút trúng giải.", solution: "Sau 20 lần rút không trúng, còn lại 80 phiếu, trong đó vẫn còn đủ 5 phiếu trúng.\nXác suất người thứ 21 trúng = 5/80 = 1/16.", answer: "1/16" },
          { prompt: "Gieo 1 đồng xu 40 lần, có 18 lần sấp. Tính xác suất thực nghiệm ra mặt ngửa.", solution: "Số lần ngửa = 40-18=22.\nXác suất thực nghiệm = 22/40 = 11/20." , answer: "11/20" },
        ],
      },
      {
        id: "hinh-phang-thuc-tien-6",
        title: "Một số hình phẳng trong thực tiễn",
        questions: [
          { prompt: "Hình nào có 6 cạnh bằng nhau và 6 góc bằng nhau?", options: ["Lục giác đều", "Hình vuông", "Hình chữ nhật", "Hình thoi"], correct: 0, explain: "Lục giác đều có đúng 6 cạnh bằng nhau và 6 góc bằng nhau." },
          { prompt: "Hình thoi có tính chất nào sau đây?", options: ["Bốn cạnh bằng nhau", "Bốn góc vuông", "Chỉ một cặp cạnh đối song song", "Không có cạnh nào bằng nhau"], correct: 0, explain: "Hình thoi là tứ giác có bốn cạnh bằng nhau." },
          { prompt: "Hình thang cân có tính chất đặc trưng gì?", options: ["Hai cạnh bên bằng nhau", "Bốn cạnh bằng nhau", "Bốn góc vuông", "Hai đường chéo vuông góc"], correct: 0, explain: "Hình thang cân là hình thang có hai cạnh bên bằng nhau." },
          { prompt: "Hình bình hành có các cặp cạnh đối như thế nào?", options: ["Song song và bằng nhau", "Vuông góc với nhau", "Bằng nhau nhưng không song song", "Không liên quan gì"], correct: 0, explain: "Đây là tính chất định nghĩa của hình bình hành." },
          { prompt: "Hình chữ nhật có chiều dài 7cm, chiều rộng 4cm. Diện tích bằng?", options: ["28cm²", "22cm²", "11cm²", "32cm²"], correct: 0, explain: "Diện tích = dài × rộng = 7×4 = 28cm²." },
          { prompt: "Hình vuông có cạnh 5cm. Chu vi bằng?", options: ["20cm", "25cm", "10cm", "15cm"], correct: 0, explain: "Chu vi hình vuông = 4×cạnh = 4×5 = 20cm." },
        ],
        exercises: [
          { prompt: "Một mảnh vườn hình chữ nhật có chiều dài 12m, chiều rộng 8m. Tính chu vi và diện tích.", solution: "Chu vi = 2×(dài+rộng) = 2×(12+8) = 40m.\nDiện tích = dài×rộng = 12×8 = 96m².", answer: "96m²" },
          { prompt: "Hình thoi có hai đường chéo dài 6cm và 8cm. Biết diện tích hình thoi = ½×d1×d2, tính diện tích.", solution: "S = ½ × 6 × 8 = 24cm².", answer: "24cm²" },
          { prompt: "Một hình vuông có chu vi 28cm. Tính diện tích của hình vuông đó.", solution: "Cạnh hình vuông = chu vi/4 = 28/4 = 7cm.\nDiện tích = cạnh² = 7² = 49cm².", answer: "49cm²" },
          { prompt: "Một hình bình hành có đáy 10cm, chiều cao 6cm. Tính diện tích (biết S=đáy×cao).", solution: "S = 10×6 = 60cm².", answer: "60cm²" },
          { prompt: "Hình thang có hai đáy 8cm, 12cm và chiều cao 5cm. Tính diện tích (biết S=(đáy lớn+đáy nhỏ)×cao/2).", solution: "S = (8+12)×5/2 = 100/2 = 50cm².", answer: "50cm²" },
          { prompt: "Một mảnh đất hình chữ nhật có chu vi 60m, chiều dài 20m. Tính chiều rộng.", solution: "Nửa chu vi = 60/2 = 30m.\nChiều rộng = 30-20 = 10m.", answer: "10m" },
          { prompt: "Hình thoi có cạnh 5cm, một đường chéo 6cm, diện tích 24cm². Tính đường chéo còn lại (biết S=½×d1×d2).", solution: "24 = ½×6×d2.\nd2 = 24×2/6 = 8cm.", answer: "8cm" },
          { prompt: "Một sân chơi hình vuông có diện tích 144m². Tính chu vi sân.", solution: "Cạnh = √144 = 12m.\nChu vi = 4×12 = 48m.", answer: "48m" },
          { prompt: "Một hình chữ nhật có diện tích 48cm², chiều rộng 6cm. Tính chiều dài.", solution: "Chiều dài = diện tích : chiều rộng = 48:6 = 8cm.", answer: "8cm" },
          { prompt: "Một hình chữ nhật có chiều dài gấp đôi chiều rộng, chu vi 36cm. Tính chiều dài và chiều rộng.", solution: "Gọi chiều rộng là x, chiều dài là 2x.\nChu vi = 2×(x+2x) = 6x = 36 → x=6.\nVậy chiều rộng=6cm, chiều dài=12cm.", answer: "12cm" },
        ],
        advanced: [
          { prompt: "Một hình chữ nhật có chu vi 40cm. Nếu tăng chiều dài thêm 3cm và giảm chiều rộng đi 3cm thì diện tích tăng thêm 3cm². Tính chiều dài, chiều rộng ban đầu.", solution: "Gọi chiều dài là a, chiều rộng là b: a+b=20 (nửa chu vi).\nDiện tích mới: (a+3)(b-3) = ab+3b-3a-9.\nDiện tích tăng thêm 3: 3b-3a-9=3 → 3(b-a)=12 → b-a=4.\nKết hợp a+b=20 và b-a=4: b=12, a=8.", answer: "dài 8cm, rộng 12cm" },
          { prompt: "Một mảnh đất hình vuông, nếu tăng cạnh thêm 2m thì diện tích tăng thêm 36m². Tính cạnh ban đầu.", solution: "Gọi cạnh ban đầu là x. Diện tích mới trừ diện tích cũ: (x+2)²-x² = 4x+4.\nTheo đề: 4x+4=36 → 4x=32 → x=8m.", answer: "8m" },
          { prompt: "Chia một hình vuông cạnh 12cm thành các hình vuông nhỏ cạnh 1cm bằng nhau. Hỏi cần vẽ ít nhất bao nhiêu đường thẳng (cả ngang và dọc, không tính 4 cạnh hình vuông lớn)?", solution: "Để chia cạnh 12cm thành 12 phần bằng nhau, cần 11 đường thẳng song song với mỗi cạnh (không kể 2 cạnh biên).\nCần 11 đường ngang và 11 đường dọc.\nTổng cộng: 11+11 = 22 đường thẳng.", answer: "22" },
          { prompt: "Một hình chữ nhật có diện tích 96cm², chiều dài hơn chiều rộng 4cm. Tính chu vi.", solution: "Gọi chiều rộng=x, chiều dài=x+4. x(x+4)=96 → x²+4x-96=0.\nGiải: Δ=16+384=400, √Δ=20. x=(-4+20)/2=8.\nChiều rộng=8cm, chiều dài=12cm. Chu vi=2×(8+12)=40cm.", answer: "40cm" },
          { prompt: "Một mảnh đất hình chữ nhật có chu vi 100m. Nếu chiều dài giảm 10m và chiều rộng tăng 10m thì trở thành hình vuông. Tính diện tích ban đầu.", solution: "Dài+rộng=50 (nửa chu vi). Dài-10=rộng+10 → dài-rộng=20.\nKết hợp: dài=35m, rộng=15m.\nDiện tích = 35×15 = 525m².", answer: "525m²" },
          { prompt: "Một hình vuông có diện tích bằng diện tích một hình chữ nhật có chiều dài 16cm, chiều rộng 9cm. Tính cạnh hình vuông.", solution: "Diện tích hình chữ nhật = 16×9 = 144cm².\nCạnh hình vuông = √144 = 12cm.", answer: "12cm" },
          { prompt: "Một khu vườn hình chữ nhật có chiều dài gấp 3 lần chiều rộng. Nếu tăng chiều rộng thêm 4m (giữ nguyên chiều dài) thì diện tích tăng thêm 48m². Tính kích thước ban đầu.", solution: "Gọi rộng=x, dài=3x. Diện tích tăng thêm = dài×4 = 3x×4 = 12x.\n12x=48 → x=4. Rộng=4m, dài=12m.", answer: "rộng 4m, dài 12m" },
          { prompt: "Một hình thoi có chu vi 40cm và một đường chéo dài 12cm. Tính đường chéo còn lại và diện tích.", solution: "Cạnh hình thoi = 40:4 = 10cm. Nửa đường chéo đã biết = 6cm.\nTheo Pytago: nửa đường chéo còn lại = √(10²-6²)=√64=8cm → đường chéo còn lại = 16cm.\nDiện tích = ½×12×16 = 96cm².", answer: "đường chéo 16cm, diện tích 96cm²" },
          { prompt: "Một tấm bìa hình chữ nhật 12cm×8cm được cắt bỏ một góc hình vuông cạnh 3cm. Tính diện tích còn lại.", solution: "Diện tích ban đầu = 12×8 = 96cm². Diện tích cắt bỏ = 3×3 = 9cm².\nDiện tích còn lại = 96-9 = 87cm².", answer: "87cm²" },
          { prompt: "Một hình vuông có chu vi bằng chu vi hình chữ nhật 10cm×6cm. Tính diện tích hình vuông.", solution: "Chu vi hình chữ nhật = 2×(10+6) = 32cm.\nCạnh hình vuông = 32:4 = 8cm.\nDiện tích = 8×8 = 64cm²." , answer: "64cm²" },
        ],
      },
      {
        id: "doi-xung-hinh-phang-6",
        title: "Tính đối xứng của hình phẳng",
        questions: [
          { prompt: "Hình nào sau đây có trục đối xứng?", options: ["Hình tròn", "Hình bình hành thường", "Hình thang thường", "Tam giác thường"], correct: 0, explain: "Hình tròn có vô số trục đối xứng (mọi đường kính); các hình còn lại (không đặc biệt) thường không có trục đối xứng." },
          { prompt: "Chữ cái nào sau đây có trục đối xứng?", options: ["A", "F", "G", "N"], correct: 0, explain: "Chữ A có trục đối xứng thẳng đứng đi qua đỉnh." },
          { prompt: "Hình vuông có bao nhiêu trục đối xứng?", options: ["4", "2", "1", "0"], correct: 0, explain: "Hình vuông có 4 trục đối xứng: 2 đường chéo và 2 đường trung trực của các cạnh." },
          { prompt: "Một hình có tâm đối xứng nghĩa là khi quay 180° quanh tâm đó, hình sẽ?", options: ["Trùng khít với chính nó", "Biến mất", "Đổi kích thước", "Không liên quan gì đến hình ban đầu"], correct: 0, explain: "Đây là định nghĩa của tâm đối xứng." },
          { prompt: "Hình bình hành có tâm đối xứng không?", options: ["Có", "Không", "Chỉ khi là hình chữ nhật", "Chỉ khi là hình thoi"], correct: 0, explain: "Giao điểm hai đường chéo của hình bình hành chính là tâm đối xứng của nó." },
          { prompt: "Tam giác đều có bao nhiêu trục đối xứng?", options: ["3", "1", "0", "6"], correct: 0, explain: "Tam giác đều có 3 trục đối xứng, mỗi trục đi qua một đỉnh và trung điểm cạnh đối diện." },
        ],
        exercises: [
          { prompt: "Kể tên 2 chữ cái in hoa có trục đối xứng và 2 chữ không có trục đối xứng. Giải thích ngắn gọn.", solution: "Có trục đối xứng: chữ A (trục dọc qua đỉnh), chữ H (trục dọc và trục ngang).\nKhông có trục đối xứng: chữ F, chữ G (không có đường nào chia chữ thành hai phần đối xứng nhau).", answer: "chữ F, chữ G (không có đường nào chia chữ thành hai phần đối xứng nhau)" },
          { prompt: "Hình chữ nhật (không phải hình vuông) có bao nhiêu trục đối xứng?", solution: "Hình chữ nhật thường có đúng 2 trục đối xứng: hai đường trung trực của các cặp cạnh đối diện.", answer: "2" },
          { prompt: "Cho hình bình hành ABCD. Tâm đối xứng của hình bình hành nằm ở đâu?", solution: "Tâm đối xứng của hình bình hành là giao điểm của hai đường chéo AC và BD.", answer: "Tâm đối xứng của hình bình hành là giao điểm của hai đường chéo AC và BD" },
          { prompt: "Hình ngũ giác đều có bao nhiêu trục đối xứng?", solution: "Hình ngũ giác đều có 5 trục đối xứng, mỗi trục đi qua một đỉnh và trung điểm cạnh đối diện.", answer: "5" },
          { prompt: "Hình thoi có bao nhiêu trục đối xứng?", solution: "Hình thoi có 2 trục đối xứng, chính là hai đường chéo của nó.", answer: "2" },
          { prompt: "Trong các chữ số từ 0-9, chữ số nào có trục đối xứng (viết theo font chuẩn)?", solution: "Chữ số 0 và 8 có cả trục đối xứng dọc và ngang; chữ số 3 có trục đối xứng ngang.", answer: "3" },
          { prompt: "Hình chữ nhật có tâm đối xứng không?", solution: "Có. Tâm đối xứng của hình chữ nhật là giao điểm hai đường chéo.", answer: "Có. Tâm đối xứng của hình chữ nhật là giao điểm hai đường chéo" },
          { prompt: "Một hình có 2 trục đối xứng vuông góc với nhau thì có tâm đối xứng không?", solution: "Có. Giao điểm của hai trục đối xứng vuông góc chính là tâm đối xứng của hình.", answer: "Có. Giao điểm của hai trục đối xứng vuông góc chính là tâm đối xứng của hình" },
          { prompt: "Hình tròn có tâm đối xứng không? Nếu có, đó là điểm nào?", solution: "Có. Tâm đối xứng của hình tròn chính là tâm của đường tròn đó.", answer: "Có. Tâm đối xứng của hình tròn chính là tâm của đường tròn đó" },
          { prompt: "Tam giác cân (không đều) có bao nhiêu trục đối xứng?", solution: "Có 1 trục đối xứng, chính là đường trung trực của cạnh đáy (cũng là đường phân giác của góc ở đỉnh).", answer: "1" },
        ],
        advanced: [
          { prompt: "Một đa giác đều có đúng 4 trục đối xứng và có tâm đối xứng. Hỏi đa giác đó có bao nhiêu cạnh?", solution: "Đa giác đều n cạnh luôn có đúng n trục đối xứng.\nCần n=4, nên đa giác đó là hình vuông, có 4 cạnh.", answer: "4 cạnh (hình vuông)" },
          { prompt: "Xét chữ số 8 viết theo font chuẩn: nó có tâm đối xứng không? Có bao nhiêu trục đối xứng?", solution: "Chữ số 8 có 1 tâm đối xứng (điểm chính giữa) và có 2 trục đối xứng (một trục ngang, một trục dọc đi qua tâm).", answer: "Có tâm đối xứng; có 2 trục đối xứng" },
          { prompt: "Ghép 2 tam giác đều bằng nhau theo một cạnh chung để được một hình mới. Hình mới có tâm đối xứng không? Vì sao?", solution: "Khi ghép 2 tam giác đều bằng nhau theo một cạnh chung, hình tạo thành là một hình thoi (4 cạnh bằng nhau).\nHình thoi luôn có tâm đối xứng — chính là giao điểm của hai đường chéo.\nVậy hình mới có tâm đối xứng.", answer: "Có, vì hình tạo thành là hình thoi và hình thoi luôn có tâm đối xứng" },
          { prompt: "Vẽ hình lục giác đều. Hỏi có bao nhiêu trục đối xứng và có tâm đối xứng không?", solution: "Lục giác đều có 6 trục đối xứng.\nVì số cạnh (6) là số chẵn, lục giác đều cũng có tâm đối xứng.", answer: "6 trục đối xứng; có tâm đối xứng" },
          { prompt: "Trong các chữ cái in hoa không dấu A, B, C, D, E, H, I, M, O, T, U, V, W, X, Y — chữ nào có trục đối xứng ngang (trên dưới đối xứng nhau)?", solution: "Các chữ có trục đối xứng ngang (nửa trên và nửa dưới giống hệt nhau): B, C, D, E, H, I, O, X.", answer: "B, C, D, E, H, I, O, X" },
          { prompt: "Một hình có 3 trục đối xứng đồng quy tại một điểm. Hình đó có tâm đối xứng không? Giải thích.", solution: "3 trục đối xứng đồng quy là đặc trưng của tam giác đều.\nTam giác đều KHÔNG có tâm đối xứng, vì chỉ đa giác đều có số cạnh CHẴN mới có tâm đối xứng (3 là số lẻ).", answer: "Không có tâm đối xứng (vì 3 là số lẻ)" },
          { prompt: "Ghép 2 hình vuông bằng nhau theo một cạnh chung, tạo thành hình chữ nhật. Hình chữ nhật này có bao nhiêu trục đối xứng?", solution: "Hình chữ nhật tạo thành có tỉ lệ cạnh 2:1 (không phải hình vuông), nên có 2 trục đối xứng (hai đường trung trực của các cặp cạnh)." , answer: "2" },
          { prompt: "Trục đối xứng của hình thoi ABCD là những đường nào?", solution: "Trục đối xứng của hình thoi chính là hai đường chéo AC và BD.", answer: "Hai đường chéo AC và BD" },
          { prompt: "Một ngôi sao 5 cánh đều có bao nhiêu trục đối xứng?", solution: "Ngôi sao 5 cánh đều có 5 trục đối xứng, mỗi trục đi qua 1 đỉnh cánh sao và điểm giữa cạnh đối diện (tương tự đa giác đều 5 cạnh).", answer: "5" },
          { prompt: "Hình chữ nhật có tâm đối xứng ở đâu?", solution: "Tâm đối xứng của hình chữ nhật là giao điểm của hai đường chéo." , answer: "Giao điểm hai đường chéo" },
        ],
      },
    ],
    examSources: [
      { label: "Toán THCS (lớp 6) – chuyên mục trên TOANMATH.com", url: "https://thcs.toanmath.com/" },
    ],
  },
  {
    id: 7,
    label: "Lớp 7",
    topics: [
      {
        id: "so-huu-ti-7",
        title: "Số hữu tỉ",
        questions: [
          { prompt: "(−3) + 5 = ?", options: ["2", "-2", "8", "-8"], correct: 0, explain: "5 lớn hơn 3 nên kết quả mang dấu dương: 5-3=2." },
          { prompt: "(−2) × (−4) = ?", options: ["8", "-8", "6", "-6"], correct: 0, explain: "Âm nhân âm ra dương: 2×4=8." },
          { prompt: "|−7| = ?", options: ["7", "-7", "0", "14"], correct: 0, explain: "Giá trị tuyệt đối luôn không âm, bằng khoảng cách tới 0." },
          { prompt: "(−1/2) + (1/4) = ?", options: ["-1/4", "1/4", "-3/4", "3/4"], correct: 0, explain: "Quy đồng: -2/4 + 1/4 = -1/4." },
          { prompt: "Số nào lớn hơn: −3 hay −5?", options: ["-3", "-5", "Bằng nhau", "Không so sánh được"], correct: 0, explain: "Trên trục số, −3 nằm bên phải −5 nên −3 lớn hơn." },
          { prompt: "(−2)³ = ?", options: ["-8", "8", "-6", "6"], correct: 0, explain: "(-2)×(-2)×(-2) = 4×(-2) = -8." },
        ],
        exercises: [
          { prompt: "Tính: (−2/3) + (5/6)", solution: "Quy đồng mẫu số 6: -4/6 + 5/6 = 1/6.", answer: "1/6" },
          { prompt: "Tính: (−3)² − (−2)³", solution: "(-3)² = 9.\n(-2)³ = -8.\n9 - (-8) = 9+8 = 17.", answer: "17" },
          { prompt: "Sắp xếp theo thứ tự tăng dần: −1/2, 2/3, −3/4, 0", solution: "Đổi ra số thập phân để dễ so sánh: -1/2=-0,5; -3/4=-0,75; 2/3≈0,67.\nThứ tự tăng dần: -3/4, -1/2, 0, 2/3.", answer: "Thứ tự tăng dần: -3/4, -1/2, 0, 2/3" },
          { prompt: "Tính: (−5/6) − (1/3)", solution: "Mẫu số chung là 6: -5/6-2/6 = -7/6.", answer: "-7/6" },
          { prompt: "Tính: (2/5) × (−3/4)", solution: "(2×-3)/(5×4) = -6/20, rút gọn = -3/10.", answer: "-3/10" },
          { prompt: "Tính: (−3/4) : (1/2)", solution: "Chia bằng nhân nghịch đảo: -3/4 × 2 = -6/4 = -3/2.", answer: "-3/2" },
          { prompt: "So sánh: −3/4 và −2/3", solution: "Quy đồng mẫu 12: -3/4=-9/12, -2/3=-8/12.\nVì -9/12<-8/12 nên -3/4<-2/3.", answer: "Vì -9/12<-8/12 nên -3/4<-2/3" },
          { prompt: "Tính: 2 − 3/5", solution: "2=10/5. 10/5-3/5 = 7/5.", answer: "7/5" },
          { prompt: "Tìm x biết: x + 1/2 = 3/4", solution: "x = 3/4-1/2 = 1/4.", answer: "1/4" },
          { prompt: "Tính: (−1)⁵ + (−1)⁴", solution: "(-1)⁵=-1, (-1)⁴=1.\n-1+1 = 0.", answer: "0" },
        ],
        advanced: [
          { prompt: "Tính nhanh: (1−1/2)×(1−1/3)×(1−1/4)×...×(1−1/10) (gợi ý: viết mỗi thừa số dưới dạng phân số rồi rút gọn dây chuyền).", solution: "Mỗi thừa số (1-1/k) = (k-1)/k. Tích trở thành: (1/2)×(2/3)×(3/4)×...×(9/10).\nRút gọn dây chuyền: tử của phân số sau bằng mẫu của phân số liền trước nên triệt tiêu hết, chỉ còn tử đầu tiên (1) và mẫu cuối cùng (10).\nKết quả = 1/10.", answer: "1/10" },
          { prompt: "Tìm giá trị nhỏ nhất của biểu thức |x−1/2| + |x+1/3| và giá trị x đạt được (khoảng giá trị).", solution: "Biểu thức là tổng khoảng cách từ x đến 1/2 và từ x đến -1/3.\nTổng khoảng cách nhỏ nhất khi x nằm giữa hai điểm -1/3 và 1/2 (kể cả hai đầu mút), khi đó tổng bằng đúng khoảng cách giữa hai điểm: 1/2-(-1/3) = 5/6.\nVậy giá trị nhỏ nhất là 5/6, đạt được khi -1/3≤x≤1/2.", answer: "5/6" },
          { prompt: "Biết x/3=y/5 và x−y=−8. Tìm x, y (dùng tính chất dãy tỉ số bằng nhau).", solution: "Áp dụng tính chất dãy tỉ số bằng nhau: x/3=y/5=(x-y)/(3-5)=(-8)/(-2)=4.\nVậy x=3×4=12, y=5×4=20.", answer: "x=12, y=20" },
          { prompt: "Tính: (−1/2)² + (−1/3)³", solution: "(-1/2)²=1/4. (-1/3)³=-1/27.\nQuy đồng mẫu 108: 27/108 - 4/108 = 23/108." , answer: "23/108" },
          { prompt: "Tìm x biết: 2/3 − x = 1/2 × (−3/4)", solution: "Vế phải = -3/8.\n2/3-x=-3/8 → x=2/3+3/8. Quy đồng mẫu 24: 16/24+9/24=25/24." , answer: "25/24" },
          { prompt: "So sánh: (−2/3)¹⁰ và (2/3)¹⁰ (không tính giá trị cụ thể).", solution: "Lũy thừa bậc chẵn của một số âm bằng lũy thừa cùng bậc của số đối (dương) của nó.\nVậy (-2/3)¹⁰ = (2/3)¹⁰, tức hai số này bằng nhau." , answer: "Bằng nhau" },
          { prompt: "Tính nhanh: 1/2 × 2/3 × 3/4 × ... × 9/10 (tích các phân số liên tiếp).", solution: "Rút gọn dây chuyền: tử của phân số sau bằng mẫu của phân số liền trước, triệt tiêu hết.\nKết quả = 1/10 (chỉ còn tử đầu 1 và mẫu cuối 10)." , answer: "1/10" },
          { prompt: "Ba số hữu tỉ a, b, c thỏa a/2=b/3=c/5 và a−b+c=8. Tìm a, b, c.", solution: "Đặt a=2k, b=3k, c=5k. a-b+c=2k-3k+5k=4k=8 → k=2.\nVậy a=4, b=6, c=10." , answer: "a=4, b=6, c=10" },
          { prompt: "Tìm x nguyên biết: −3 < x/2 < 2", solution: "Nhân cả 2 vế với 2: -6<x<4.\nCác giá trị x nguyên thỏa mãn: -5,-4,-3,-2,-1,0,1,2,3." , answer: "-5,-4,-3,-2,-1,0,1,2,3" },
          { prompt: "Tính: (1/2−1/3)×(1/3−1/4)×(1/4−1/5)", solution: "1/2-1/3=1/6. 1/3-1/4=1/12. 1/4-1/5=1/20.\nTích = 1/6×1/12×1/20 = 1/1440." , answer: "1/1440" },
        ],
      },
      {
        id: "so-thuc-7",
        title: "Số thực",
        questions: [
          { prompt: "Số 0,333... (3 lặp lại vô hạn) là loại số thập phân nào?", options: ["Vô hạn tuần hoàn", "Hữu hạn", "Vô hạn không tuần hoàn", "Số nguyên"], correct: 0, explain: "Chữ số 3 lặp lại mãi mãi theo một chu kỳ, đây là số thập phân vô hạn tuần hoàn." },
          { prompt: "Số nào sau đây là số vô tỉ?", options: ["√2", "1/3", "0,25", "5"], correct: 0, explain: "√2 là số thập phân vô hạn không tuần hoàn, không viết được dưới dạng phân số." },
          { prompt: "Căn bậc hai số học của 25 là?", options: ["5", "-5", "±5", "25"], correct: 0, explain: "Căn bậc hai số học chỉ lấy giá trị không âm: √25 = 5." },
          { prompt: "√2 thuộc tập hợp số nào nhưng không thuộc tập hợp số hữu tỉ?", options: ["Số thực (ℝ)", "Số nguyên (ℤ)", "Số tự nhiên (ℕ)", "Không thuộc tập nào"], correct: 0, explain: "√2 là số vô tỉ, nằm trong tập số thực nhưng không phải số hữu tỉ." },
          { prompt: "Tập hợp số thực gồm những loại số nào?", options: ["Số hữu tỉ và số vô tỉ", "Chỉ số hữu tỉ", "Chỉ số nguyên", "Chỉ số tự nhiên"], correct: 0, explain: "Tập số thực ℝ là hợp của tập số hữu tỉ và tập số vô tỉ." },
          { prompt: "Số 1,414213562... (không lặp lại) là loại số nào?", options: ["Số vô tỉ", "Số hữu tỉ", "Số nguyên", "Phân số"], correct: 0, explain: "Số thập phân vô hạn không tuần hoàn chính là số vô tỉ." },
        ],
        exercises: [
          { prompt: "Tính: √81 + √16", solution: "√81 = 9, √16 = 4.\n9+4 = 13.", answer: "13" },
          { prompt: "So sánh √3 và 1,7.", solution: "√3 ≈ 1,732.\nVì 1,732 > 1,7 nên √3 > 1,7.", answer: "Vì 1,732 > 1,7 nên √3 > 1,7" },
          { prompt: "Tính giá trị biểu thức: (√25 − √9) × 2", solution: "√25=5, √9=3.\n5-3=2.\n2×2=4.", answer: "4" },
          { prompt: "Tính: √121 − √64", solution: "√121=11, √64=8.\n11-8 = 3.", answer: "3" },
          { prompt: "Tính: (√2)² + (√3)²", solution: "(√2)²=2, (√3)²=3.\n2+3 = 5.", answer: "5" },
          { prompt: "So sánh √5 và 2,3", solution: "√5 ≈ 2,236.\nVì 2,236 < 2,3 nên √5 < 2,3.", answer: "Vì 2,236 < 2,3 nên √5 < 2,3" },
          { prompt: "Tính: √(4×9)", solution: "√(4×9) = √36 = 6.", answer: "6" },
          { prompt: "Số nào là số hữu tỉ trong các số: √4, √5, √9?", solution: "√4=2, √9=3 đều là số nguyên (hữu tỉ).\n√5 không đưa về được số nguyên/phân số, là số vô tỉ.", answer: "5" },
          { prompt: "Ước lượng √10 nằm giữa hai số nguyên nào?", solution: "3²=9<10<16=4², nên 3<√10<4.", answer: "4², nên 3<√10<4" },
          { prompt: "Tính √0,25", solution: "0,5² = 0,25, nên √0,25 = 0,5.", answer: "0,5" },
        ],
        advanced: [
          { prompt: "Tính: √(1+2+...+9+10+9+...+2+1) (gợi ý: biểu thức trong căn là tổng 1+2+...+10 rồi cộng ngược lại 9+8+...+1).", solution: "Tổng trong căn = (1+2+...+10) + (9+8+...+1) = 55+45 = 100 = 10².\nVậy √100 = 10.", answer: "10" },
          { prompt: "So sánh (không dùng máy tính): √2+√3 và √10.", solution: "Bình phương hai vế (cả hai đều dương nên giữ nguyên chiều so sánh):\n(√2+√3)² = 2+3+2√6 = 5+2√6.\n(√10)² = 10.\nSo sánh 5+2√6 với 10, tức so sánh 2√6 với 5, tức so sánh √6 với 2,5, tức so sánh 6 với 6,25.\nVì 6<6,25 nên √6<2,5, suy ra 5+2√6<10.\nVậy √2+√3 < √10.", answer: "√2+√3 < √10" },
          { prompt: "Tìm số nguyên n lớn nhất sao cho √n < 15.", solution: "Vì cả hai vế đều dương, bình phương giữ nguyên chiều bất đẳng thức: √n<15 ⟺ n<225.\nSố nguyên lớn nhất thỏa mãn n<225 là n=224.", answer: "224" },
          { prompt: "Tính: √(2²×3²×5²) (rút gọn trước khi khai căn).", solution: "√(2²×3²×5²) = 2×3×5 = 30 (vì căn bậc hai của tích các bình phương bằng tích các căn)." , answer: "30" },
          { prompt: "Chứng minh √3 là số vô tỉ (bằng phản chứng).", solution: "Giả sử √3=a/b (phân số tối giản). Bình phương: 3b²=a², suy ra a² chia hết cho 3, nên a chia hết cho 3.\nĐặt a=3k: 3b²=9k² → b²=3k², suy ra b cũng chia hết cho 3.\nCả a và b đều chia hết cho 3, mâu thuẫn với giả thiết phân số tối giản. Vậy √3 là số vô tỉ." , answer: "Vô tỉ (chứng minh bằng phản chứng)" },
          { prompt: "So sánh: 5√2 và 7 (không dùng máy tính).", solution: "Bình phương hai vế: (5√2)²=50. 7²=49.\nVì 50>49 nên 5√2>7." , answer: "5√2 > 7" },
          { prompt: "Tìm x biết: x² = 121 (liệt kê tất cả nghiệm).", solution: "x=11 hoặc x=-11." , answer: "x=11 hoặc x=-11" },
          { prompt: "Sắp xếp theo thứ tự tăng dần: √50, 7, √48", solution: "7²=49. So sánh 48 và 49: 48<49 nên √48<7.\nSo sánh 50 và 49: 50>49 nên √50>7.\nVậy: √48 < 7 < √50." , answer: "√48 < 7 < √50" },
          { prompt: "Tính giá trị biểu thức: (√5)² − (√3)² × 2", solution: "(√5)²=5. (√3)²=3.\n5-3×2 = 5-6 = -1." , answer: "-1" },
          { prompt: "Tính: √16 + √25 − √9", solution: "4+5-3 = 6." , answer: "6" },
        ],
      },
      {
        id: "goc-duong-thang-song-song-7",
        title: "Góc và đường thẳng song song",
        questions: [
          { prompt: "Hai góc đối đỉnh thì có số đo như thế nào?", options: ["Bằng nhau", "Bù nhau", "Phụ nhau", "Không liên quan"], correct: 0, explain: "Tính chất cơ bản: hai góc đối đỉnh luôn bằng nhau." },
          { prompt: "Tia phân giác của một góc chia góc đó thành hai góc như thế nào?", options: ["Bằng nhau", "Không bằng nhau", "Bù nhau", "Kề bù"], correct: 0, explain: "Theo định nghĩa, tia phân giác chia góc thành hai góc bằng nhau." },
          { prompt: "Hai đường thẳng song song là hai đường thẳng?", options: ["Không có điểm chung", "Có 1 điểm chung", "Có vô số điểm chung", "Trùng nhau"], correct: 0, explain: "Theo định nghĩa, hai đường thẳng song song không cắt nhau, tức không có điểm chung." },
          { prompt: "Theo tiên đề Euclid, qua một điểm ở ngoài một đường thẳng, có bao nhiêu đường thẳng song song với đường thẳng đã cho?", options: ["Chỉ 1 đường thẳng duy nhất", "2 đường thẳng", "Vô số đường thẳng", "Không có đường thẳng nào"], correct: 0, explain: "Đây chính là nội dung tiên đề Euclid về đường thẳng song song." },
          { prompt: "Hai đường thẳng song song bị cắt bởi một đường thẳng thứ ba thì hai góc so le trong có quan hệ gì?", options: ["Bằng nhau", "Bù nhau", "Phụ nhau", "Kề nhau"], correct: 0, explain: "Tính chất của hai đường thẳng song song: các cặp góc so le trong bằng nhau." },
          { prompt: "Hai đường thẳng song song bị cắt bởi một cát tuyến thì hai góc đồng vị có quan hệ gì?", options: ["Bằng nhau", "Bù nhau", "Phụ nhau", "Không liên quan"], correct: 0, explain: "Tính chất của hai đường thẳng song song: các cặp góc đồng vị bằng nhau." },
        ],
        exercises: [
          { prompt: "Cho hai đường thẳng song song bị cắt bởi một cát tuyến, một góc so le trong bằng 65°. Tính góc so le trong còn lại.", solution: "Hai góc so le trong của hai đường thẳng song song luôn bằng nhau.\nVậy góc còn lại cũng bằng 65°.", answer: "góc còn lại cũng bằng 65°" },
          { prompt: "Một góc có số đo 40°. Tính số đo góc đối đỉnh với nó.", solution: "Hai góc đối đỉnh luôn bằng nhau.\nVậy góc đối đỉnh cũng có số đo 40°.", answer: "góc đối đỉnh cũng có số đo 40°" },
          { prompt: "Cho góc A=50°. Tia phân giác chia góc A thành 2 góc bằng nhau. Tính số đo mỗi góc.", solution: "Tia phân giác chia đôi góc: mỗi góc = 50°/2 = 25°.", answer: "25°" },
          { prompt: "Hai góc kề bù có tổng số đo bằng bao nhiêu?", solution: "Hai góc kề bù luôn có tổng số đo bằng 180°.", answer: "180°" },
          { prompt: "Cho hai đường thẳng song song bị cắt bởi cát tuyến, một góc trong cùng phía bằng 70°. Tính góc trong cùng phía còn lại.", solution: "Hai góc trong cùng phía bù nhau: 180°-70° = 110°.", answer: "110°" },
          { prompt: "Góc phụ với góc 35° có số đo bao nhiêu?", solution: "Hai góc phụ nhau có tổng 90°: 90°-35° = 55°.", answer: "55°" },
          { prompt: "Góc bù với góc 110° có số đo bao nhiêu?", solution: "Hai góc bù nhau có tổng 180°: 180°-110° = 70°.", answer: "70°" },
          { prompt: "Cho đường thẳng a//b, góc tạo bởi a với cát tuyến là 65° (góc đồng vị). Tính góc tương ứng trên b.", solution: "Hai góc đồng vị của hai đường thẳng song song luôn bằng nhau: góc trên b cũng bằng 65°.", answer: "góc trên b cũng bằng 65°" },
          { prompt: "Một góc có số đo gấp đôi góc phụ với nó. Tính số đo góc đó.", solution: "Gọi góc cần tìm là x, góc phụ là 90°-x.\nTheo đề: x = 2(90°-x) → x = 180°-2x → 3x=180° → x=60°.", answer: "60°" },
          { prompt: "Cho hai đường thẳng song song bị cắt bởi một cát tuyến, một góc bằng 55°. Tính góc kề bù với nó.", solution: "Hai góc kề bù có tổng 180°: 180°-55° = 125°.", answer: "125°" },
        ],
        advanced: [
          { prompt: "Cho hai đường thẳng song song a, b bị cắt bởi đường thẳng c lần lượt tại A và B. Hai tia phân giác của một cặp góc so le trong tại A và B có song song với nhau không? Giải thích.", solution: "Vì a//b nên cặp góc so le trong tại A và B bằng nhau.\nTia phân giác chia đôi mỗi góc bằng nhau đó thành hai góc bằng nhau, nên các góc so le trong tạo bởi hai tia phân giác cũng bằng nhau.\nVậy hai tia phân giác đó song song với nhau.", answer: "Có, hai tia phân giác đó song song với nhau" },
          { prompt: "Cho góc xOy=130°. Tia Oz nằm trong góc sao cho góc xOz − góc zOy = 30°. Tính góc xOz.", solution: "xOz+zOy=130° (vì Oz nằm trong góc xOy).\nxOz-zOy=30°.\nCộng hai phương trình: 2×xOz=160° → xOz=80°.", answer: "80°" },
          { prompt: "Ba đường thẳng phân biệt, đôi một cắt nhau. Hỏi chúng tạo thành nhiều nhất bao nhiêu giao điểm?", solution: "Mỗi cặp đường thẳng cho tối đa 1 giao điểm. Số cặp trong 3 đường thẳng là C(3,2)=3.\nVậy tối đa 3 giao điểm (khi không có 3 đường nào đồng quy).", answer: "3" },
          { prompt: "Cho góc AOB=140°, tia OC là tia phân giác. Vẽ tia OD sao cho góc AOD=30° (D nằm trong góc AOC). Tính góc DOC và góc DOB.", solution: "Góc AOC = 140°/2 = 70° (OC là phân giác).\nDOC = AOC-AOD = 70°-30° = 40°.\nDOB = AOB-AOD = 140°-30° = 110°." , answer: "DOC=40°, DOB=110°" },
          { prompt: "Hai góc kề nhau tạo bởi 2 đường thẳng cắt nhau là (3x+10)° và (2x+30)°. Tìm x.", solution: "Hai góc kề bù có tổng 180°: (3x+10)+(2x+30)=180 → 5x+40=180 → 5x=140 → x=28." , answer: "28" },
          { prompt: "Cho 3 đường thẳng a, b, c đôi một song song. Khoảng cách giữa a và b là 3cm, giữa b và c là 5cm. Tính khoảng cách có thể có giữa a và c.", solution: "Trường hợp b nằm giữa a và c: khoảng cách a,c = 3+5 = 8cm.\nTrường hợp b không nằm giữa (a hoặc c nằm giữa hai đường kia): khoảng cách a,c = 5-3 = 2cm.\nVậy có 2 khả năng: 8cm hoặc 2cm." , answer: "8cm hoặc 2cm" },
          { prompt: "Tính tổng số đo tất cả các góc tạo bởi một đường thẳng cắt hai đường thẳng song song (8 góc tại 2 giao điểm).", solution: "Tại mỗi giao điểm có 4 góc với tổng 360°. Có 2 giao điểm nên tổng tất cả 8 góc = 2×360° = 720°." , answer: "720°" },
          { prompt: "Cho góc xOy=90°, tia Oz nằm trong góc sao cho xOz=2×zOy. Tính góc zOy.", solution: "xOz+zOy=90°. Vì xOz=2zOy: 2zOy+zOy=90° → 3zOy=90° → zOy=30°." , answer: "30°" },
          { prompt: "Trên một đường thẳng vẽ 5 tia chung gốc, không có 2 tia nào trùng nhau. Hỏi tạo thành nhiều nhất bao nhiêu góc?", solution: "Mỗi cặp trong 5 tia tạo thành 1 góc: số góc = C(5,2) = 10." , answer: "10" },
          { prompt: "Hai góc có tổng 130° và hiệu 30°. Tính mỗi góc.", solution: "Gọi 2 góc x,y: x+y=130, x-y=30. Cộng: 2x=160 → x=80°, y=50°." , answer: "80° và 50°" },
        ],
      },
      {
        id: "tam-giac-bang-nhau-7",
        title: "Tam giác bằng nhau",
        questions: [
          { prompt: "Tổng ba góc trong một tam giác bằng?", options: ["180°", "90°", "360°", "270°"], correct: 0, explain: "Đây là định lý cơ bản về tổng ba góc của một tam giác." },
          { prompt: "Hai tam giác bằng nhau theo trường hợp cạnh-cạnh-cạnh (c.c.c) khi nào?", options: ["Ba cạnh tương ứng bằng nhau", "Hai cạnh bằng nhau", "Một cạnh bằng nhau", "Ba góc bằng nhau"], correct: 0, explain: "Trường hợp c.c.c: nếu ba cạnh của tam giác này bằng ba cạnh tương ứng của tam giác kia thì hai tam giác bằng nhau." },
          { prompt: "Trường hợp bằng nhau cạnh-góc-cạnh (c.g.c) yêu cầu điều gì?", options: ["Hai cạnh và góc xen giữa tương ứng bằng nhau", "Ba cạnh bằng nhau", "Ba góc bằng nhau", "Một cạnh và một góc bất kỳ"], correct: 0, explain: "Trường hợp c.g.c yêu cầu hai cặp cạnh và góc xen giữa hai cạnh đó tương ứng bằng nhau." },
          { prompt: "Tam giác cân có hai cạnh bên bằng nhau thì hai góc đáy như thế nào?", options: ["Bằng nhau", "Bù nhau", "Phụ nhau", "Không liên quan"], correct: 0, explain: "Tính chất tam giác cân: hai góc ở đáy (đối diện hai cạnh bên) luôn bằng nhau." },
          { prompt: "Đường trung trực của một đoạn thẳng là đường thẳng như thế nào?", options: ["Vuông góc với đoạn thẳng tại trung điểm của nó", "Đi qua một đầu mút của đoạn thẳng", "Song song với đoạn thẳng", "Cắt đoạn thẳng tại điểm bất kỳ"], correct: 0, explain: "Theo định nghĩa, đường trung trực vuông góc với đoạn thẳng và đi qua trung điểm." },
          { prompt: "Hai tam giác vuông bằng nhau nếu có hai cạnh góc vuông tương ứng như thế nào?", options: ["Bằng nhau", "Không bằng nhau", "Vuông góc với nhau", "Không liên quan"], correct: 0, explain: "Đây là một trong các trường hợp bằng nhau của tam giác vuông: cạnh góc vuông - cạnh góc vuông." },
        ],
        exercises: [
          { prompt: "Tam giác ABC có góc A=70°, góc B=50°. Tính góc C.", solution: "Tổng ba góc trong tam giác = 180°.\nGóc C = 180° - 70° - 50° = 60°.", answer: "60°" },
          { prompt: "Tam giác ABC cân tại A có góc A=40°. Tính hai góc đáy B và C.", solution: "Tổng hai góc đáy = 180° - 40° = 140°.\nVì tam giác cân nên hai góc đáy bằng nhau: mỗi góc = 140°/2 = 70°.", answer: "70°" },
          { prompt: "Cho tam giác ABC và tam giác DEF có AB=DE, AC=DF, BC=EF. Hai tam giác này bằng nhau theo trường hợp nào?", solution: "Ba cặp cạnh tương ứng bằng nhau (AB=DE, AC=DF, BC=EF).\nĐây là trường hợp bằng nhau cạnh-cạnh-cạnh (c.c.c).", answer: "Đây là trường hợp bằng nhau cạnh-cạnh-cạnh (c.c.c)" },
          { prompt: "Tam giác ABC vuông tại A có góc B=35°. Tính góc C.", solution: "Tổng hai góc nhọn trong tam giác vuông = 90°.\nGóc C = 90°-35° = 55°.", answer: "55°" },
          { prompt: "Tam giác đều có cạnh dài 8cm. Tính chu vi.", solution: "Chu vi tam giác đều = 3×cạnh = 3×8 = 24cm.", answer: "24cm" },
          { prompt: "Tam giác ABC có AB=AC (cân tại A), góc B=65°. Tính góc A.", solution: "Vì tam giác cân nên góc C=góc B=65°.\nGóc A = 180°-65°-65° = 50°.", answer: "50°" },
          { prompt: "Hai tam giác ABC và DEF bằng nhau (theo trường hợp c.g.c), biết AB=5cm. Tính DE.", solution: "Vì hai tam giác bằng nhau nên các cạnh tương ứng bằng nhau: DE = AB = 5cm.", answer: "5cm" },
          { prompt: "Tam giác cân có góc ở đỉnh 100°. Tính mỗi góc đáy.", solution: "Tổng hai góc đáy = 180°-100° = 80°.\nVì cân nên mỗi góc đáy = 80°/2 = 40°.", answer: "40°" },
          { prompt: "Tam giác ABC bằng tam giác MNP theo trường hợp g.c.g, biết góc A=góc M=50°, góc B=góc N=60°. Tính góc P.", solution: "Góc C = 180°-50°-60° = 70°.\nVì hai tam giác bằng nhau nên góc P = góc C = 70°.", answer: "70°" },
          { prompt: "Tam giác vuông có hai cạnh góc vuông bằng nhau. Đây là loại tam giác đặc biệt gì?", solution: "Đây là tam giác vuông cân.", answer: "Đây là tam giác vuông cân" },
        ],
        advanced: [
          { prompt: "Tam giác ABC cân tại A, biết góc B = 2×góc A. Tính ba góc của tam giác.", solution: "Vì cân tại A nên góc B = góc C.\nTổng ba góc: góc A + góc B + góc C = 180°. Thay góc B=góc C=2×góc A: góc A+2×góc A+2×góc A=180° → 5×góc A=180° → góc A=36°.\nVậy góc A=36°, góc B=góc C=72°.", answer: "góc A=36°, góc B=góc C=72°" },
          { prompt: "Tam giác ABC có AB=AC, M là trung điểm BC. Biết AM vuông góc BC. Tính góc AMB.", solution: "Xét tam giác ABM và ACM: AB=AC (giả thiết), BM=CM (M là trung điểm), AM chung → hai tam giác bằng nhau (c.c.c) → góc AMB=góc AMC.\nHai góc này kề bù (tổng 180°) và bằng nhau, nên mỗi góc bằng 90°.\nGóc AMB=90° (đây cũng chính là lý do AM luôn vuông góc BC trong tam giác cân).", answer: "90°" },
          { prompt: "Tam giác ABC có D, E lần lượt là trung điểm AB, AC, biết DE=5cm. Trên tia đối của tia ED lấy F sao cho EF=ED. Tứ giác DBCF là hình gì? Tính BC.", solution: "DE là đường trung bình của tam giác ABC nên DE//BC và BC=2×DE=10cm.\nVì D, E, F thẳng hàng (F trên tia đối ED) và DE//BC nên DF//BC. Mặt khác DF=DE+EF=2×DE=10cm=BC.\nVì DF//BC và DF=BC nên tứ giác DBCF là hình bình hành. BC=10cm.", answer: "Hình bình hành; BC=10cm" },
          { prompt: "Tam giác ABC có AB=AC=5cm, BC=6cm. Tính đường cao AH từ A.", solution: "Trong tam giác cân, H (chân đường cao từ đỉnh cân) là trung điểm BC, nên BH=3cm.\nTheo Pytago: AH=√(AB²-BH²)=√(25-9)=√16=4cm." , answer: "4cm" },
          { prompt: "Cho tam giác ABC = tam giác DEF (theo đúng thứ tự đỉnh). Biết góc A=50°, góc E=60°. Tính góc C.", solution: "Vì hai tam giác bằng nhau theo thứ tự A-D, B-E, C-F: góc B=góc E=60°.\nGóc C = 180°-50°-60° = 70°." , answer: "70°" },
          { prompt: "Cho tam giác đều ABC cạnh a. M, N, P lần lượt là trung điểm AB, BC, CA. Chứng minh tam giác MNP đều, tính chu vi MNP theo a.", solution: "MN, NP, PM đều là đường trung bình của tam giác ABC, mỗi đoạn bằng nửa cạnh đối diện.\nVì AB=BC=CA=a, nên MN=NP=PM=a/2, tam giác MNP đều.\nChu vi MNP = 3×a/2 = 3a/2." , answer: "3a/2" },
          { prompt: "Tam giác ABC cân tại A có góc B=50°. Tia phân giác của góc C cắt AB tại D. Tính góc ADC.", solution: "Vì cân tại A: góc C=góc B=50°. Góc A=180°-50°-50°=80°.\nTia phân giác chia góc C thành 2 phần: góc ACD=25°.\nTrong tam giác ADC: góc ADC=180°-góc A-góc ACD=180°-80°-25°=75°." , answer: "75°" },
          { prompt: "Hai tam giác ABC và A'B'C' bằng nhau. Biết chu vi tam giác ABC là 30cm, AB=8cm, BC=12cm. Tính cạnh A'C'.", solution: "AC = 30-8-12 = 10cm.\nVì hai tam giác bằng nhau, A'C' = AC = 10cm." , answer: "10cm" },
          { prompt: "Tam giác ABC vuông cân tại A, cạnh góc vuông = 4cm. Tính cạnh huyền BC.", solution: "BC = √(4²+4²) = √32 = 4√2 cm." , answer: "4√2 cm" },
          { prompt: "Tam giác ABC vuông tại A, đường cao AH. Trường hợp nào của tam giác ABC thì tam giác ABH = tam giác ACH?", solution: "Điều này xảy ra khi và chỉ khi AB=AC (tam giác ABC cân tại A), vì khi đó AH vừa là đường cao vừa là trung tuyến, tạo 2 tam giác bằng nhau theo trường hợp c.g.c." , answer: "Khi AB=AC (tam giác cân tại A)" },
        ],
      },
      {
        id: "thu-thap-bieu-dien-du-lieu-7",
        title: "Thu thập và biểu diễn dữ liệu",
        questions: [
          { prompt: "Biểu đồ hình quạt tròn thường dùng để biểu diễn điều gì?", options: ["Tỉ lệ phần trăm giữa các phần trong một tổng thể", "Số liệu tăng giảm theo thời gian", "Số liệu rời rạc không liên quan gì nhau", "Không dùng để biểu diễn gì"], correct: 0, explain: "Biểu đồ hình quạt tròn thể hiện tỉ lệ (%) của từng phần so với tổng thể." },
          { prompt: "Biểu đồ đoạn thẳng thường dùng để thể hiện điều gì?", options: ["Xu hướng thay đổi số liệu theo thời gian", "Tỉ lệ phần trăm cố định", "Chỉ một giá trị duy nhất", "Không có tác dụng gì"], correct: 0, explain: "Biểu đồ đoạn thẳng giúp quan sát xu hướng tăng giảm của số liệu qua thời gian." },
          { prompt: "Dữ liệu định lượng là loại dữ liệu như thế nào?", options: ["Biểu diễn bằng số, đo đếm được", "Biểu diễn bằng chữ, không đo đếm được", "Không thể phân loại", "Chỉ có 2 giá trị"], correct: 0, explain: "Dữ liệu định lượng là dữ liệu dạng số, có thể đo đếm và tính toán." },
          { prompt: "Khi thống kê sở thích môn học của học sinh (Toán, Văn, Anh...), đây là loại dữ liệu nào?", options: ["Dữ liệu định tính (theo tên môn học)", "Dữ liệu về cân nặng", "Dữ liệu về ngày sinh", "Dữ liệu về chiều cao"], correct: 0, explain: "Tên môn học là dữ liệu định tính (không phải số đo lường)." },
          { prompt: "Một lớp có 40 học sinh, biểu đồ hình quạt cho thấy 25% thích Toán. Số học sinh thích Toán là?", options: ["10", "25", "15", "20"], correct: 0, explain: "Số học sinh = 25% × 40 = 0,25×40 = 10." },
          { prompt: "Khi thu thập dữ liệu, bước đầu tiên cần làm là gì?", options: ["Xác định vấn đề/mục tiêu cần thống kê", "Vẽ biểu đồ ngay lập tức", "Tính trung bình cộng trước", "Sắp xếp số liệu ngẫu nhiên"], correct: 0, explain: "Trước khi thu thập, cần xác định rõ mục tiêu để biết cần thu thập dữ liệu gì." },
        ],
        exercises: [
          { prompt: "Một lớp khảo sát 40 bạn về màu áo yêu thích: 15 bạn thích xanh, 10 bạn thích đỏ, còn lại thích màu khác. Tính tỉ lệ % số bạn thích màu xanh.", solution: "Tỉ lệ = 15/40 = 0,375 = 37,5%.", answer: "37,5%" },
          { prompt: "Biểu đồ đoạn thẳng biểu diễn nhiệt độ trong 5 ngày: 20, 22, 25, 23, 21 (°C). Ngày nào có nhiệt độ cao nhất?", solution: "So sánh 5 giá trị, số lớn nhất là 25°C, ứng với ngày thứ 3.", answer: "3." },
          { prompt: "Trong 40 bạn khảo sát ở bài trên (15 thích xanh, 10 thích đỏ), có bao nhiêu bạn thích màu khác?", solution: "Số bạn thích màu khác = 40 - 15 - 10 = 15 bạn.", answer: "15 bạn" },
          { prompt: "Một lớp 32 học sinh, biểu đồ hình quạt cho biết 25% thích đọc sách. Tính số học sinh thích đọc sách.", solution: "Số học sinh = 32×25% = 32×0,25 = 8 học sinh.", answer: "8 học sinh" },
          { prompt: "Doanh thu 3 tháng: T1: 20 triệu, T2: 25 triệu, T3: 30 triệu. Tổng doanh thu 3 tháng là bao nhiêu?", solution: "Tổng = 20+25+30 = 75 triệu đồng.", answer: "75 triệu đồng" },
          { prompt: "Một lớp có 40 học sinh, 60% là nữ. Tính số học sinh nam.", solution: "Số nữ = 40×0,6 = 24. Số nam = 40-24 = 16 học sinh.", answer: "16 học sinh" },
          { prompt: "Khảo sát 50 người về phương tiện đi làm: 20 người đi xe máy, 15 người đi ô tô, 15 người khác. Tính tỉ lệ % đi xe máy.", solution: "Tỉ lệ = 20/50 = 0,4 = 40%.", answer: "40%" },
          { prompt: "Dữ liệu \"chiều cao học sinh tính bằng cm\" là dữ liệu định lượng hay định tính?", solution: "Đây là dữ liệu định lượng, vì chiều cao là một giá trị đo lường được bằng số.", answer: "Đây là dữ liệu định lượng, vì chiều cao là một giá trị đo lường được bằng số" },
          { prompt: "Biểu đồ cột thể hiện số sách đọc trong 4 tháng: 5, 8, 6, 10 quyển. Tháng nào đọc ít sách nhất?", solution: "So sánh 4 giá trị, số nhỏ nhất là 5 quyển, ứng với tháng 1.", answer: "1." },
          { prompt: "Một cửa hàng bán được 120 sản phẩm trong tuần, trong đó 45 sản phẩm loại A. Tính tỉ lệ % sản phẩm loại A.", solution: "Tỉ lệ = 45/120 = 0,375 = 37,5%.", answer: "37,5%" },
        ],
        advanced: [
          { prompt: "Một lớp có điểm trung bình môn Toán là 7,2. Nếu bớt đi 1 bạn có điểm 4 thì điểm trung bình của các bạn còn lại là 7,4. Hỏi lớp có bao nhiêu học sinh?", solution: "Gọi số học sinh là n. Tổng điểm cả lớp = 7,2n.\nSau khi bớt bạn điểm 4: tổng điểm còn lại = 7,2n-4, số bạn còn lại = n-1.\nTheo đề: (7,2n-4)/(n-1) = 7,4 → 7,2n-4 = 7,4n-7,4 → 7,4-4 = 7,4n-7,2n → 3,4=0,2n → n=17.", answer: "17 học sinh" },
          { prompt: "Bảng điểm của 5 bạn có điểm trung bình là 8, biết không bạn nào có điểm giống nhau và tất cả đều là số nguyên từ 6 đến 10. Tìm 5 điểm số đó.", solution: "Tổng điểm = 8×5=40. Cần 5 số nguyên phân biệt trong khoảng 6 đến 10 có tổng bằng 40.\nCác số 6,7,8,9,10 vừa đủ 5 số phân biệt trong khoảng đó, và tổng của chúng = 6+7+8+9+10=40, khớp hoàn toàn.\nVậy 5 điểm số là 6, 7, 8, 9, 10.", answer: "6, 7, 8, 9, 10" },
          { prompt: "Trong một khảo sát, 60% số người thích trà, 45% thích cà phê, 20% thích cả hai loại. Hỏi bao nhiêu % không thích loại nào trong hai loại đó?", solution: "Theo nguyên lý bù trừ: tỉ lệ thích ít nhất một loại = 60%+45%-20% = 85%.\nTỉ lệ không thích loại nào = 100%-85% = 15%.", answer: "15%" },
          { prompt: "Một lớp có 40 học sinh, khảo sát 2 môn thể thao: 25 thích bóng đá, 20 thích bóng chuyền, 10 thích cả 2 môn. Hỏi có bao nhiêu bạn không thích môn nào?", solution: "Số bạn thích ít nhất 1 môn = 25+20-10 = 35.\nSố bạn không thích môn nào = 40-35 = 5." , answer: "5" },
          { prompt: "Bảng điểm 4 bài kiểm tra của 1 bạn có điểm trung bình 8. Biết 3 bài đầu có điểm 7, 8, 9. Tìm điểm bài thứ 4.", solution: "Tổng 4 bài = 8×4=32. Tổng 3 bài đầu = 7+8+9=24.\nĐiểm bài 4 = 32-24 = 8." , answer: "8" },
          { prompt: "Trung bình cộng của 7 số là 15. Nếu bớt số lớn nhất và số nhỏ nhất thì trung bình 5 số còn lại là 14. Biết số lớn nhất hơn số nhỏ nhất 20. Tìm 2 số đó.", solution: "Tổng 7 số=105. Tổng 5 số còn lại=70. Tổng 2 số bị bớt=105-70=35.\nGọi số lớn L, số nhỏ N: L+N=35, L-N=20. Cộng: 2L=55 → L=27,5, N=7,5." , answer: "27,5 và 7,5" },
          { prompt: "Một lớp 45 học sinh có tỉ lệ nam:nữ=4:5. Sau khi 3 bạn nam chuyển đi và 2 bạn nữ chuyển đến, tỉ lệ nam:nữ mới là bao nhiêu (viết dạng số:số)?", solution: "Nam ban đầu=45×4/9=20. Nữ ban đầu=45×5/9=25.\nSau thay đổi: nam=20-3=17, nữ=25+2=27.\nTỉ lệ mới = 17:27." , answer: "17:27" },
          { prompt: "Một mẫu số liệu 5 giá trị tăng dần: 2, 5, x, 10, 15 có trung vị bằng 8. Tìm x.", solution: "Với 5 giá trị đã sắp tăng dần, trung vị là giá trị đứng giữa (thứ 3) = x.\nVậy x=8." , answer: "8" },
          { prompt: "Tổng của 10 số là 250. Thêm vào 1 số nữa để tổng 11 số có trung bình bằng 24. Tìm số thêm vào.", solution: "Tổng 11 số = 24×11 = 264.\nSố thêm vào = 264-250 = 14." , answer: "14" },
          { prompt: "Một cửa hàng có doanh số 5 ngày liên tiếp tăng đều (cấp số cộng), ngày đầu 10 triệu, ngày cuối (ngày 5) 30 triệu. Tính tổng doanh số 5 ngày.", solution: "Công sai = (30-10)/4 = 5 triệu/ngày. Doanh số: 10,15,20,25,30.\nTổng = 10+15+20+25+30 = 100 triệu." , answer: "100 triệu" },
        ],
      },
      {
        id: "ti-le-thuc-dai-luong-ti-le-7",
        title: "Tỉ lệ thức và đại lượng tỉ lệ",
        questions: [
          { prompt: "Tỉ lệ thức là đẳng thức giữa hai tỉ số có dạng nào?", options: ["a/b = c/d", "a+b = c+d", "a-b = c-d", "a×b = c×d"], correct: 0, explain: "Tỉ lệ thức là đẳng thức của hai tỉ số: a/b = c/d." },
          { prompt: "Từ tỉ lệ thức a/b = c/d, ta suy ra được đẳng thức nào?", options: ["ad = bc", "a+d = b+c", "a-b = c-d", "a+b = c-d"], correct: 0, explain: "Tính chất cơ bản của tỉ lệ thức: tích trung tỉ bằng tích ngoại tỉ, ad=bc." },
          { prompt: "y tỉ lệ thuận với x theo hệ số k=3. Khi x=4 thì y=?", options: ["12", "7", "4/3", "1"], correct: 0, explain: "y=kx=3×4=12." },
          { prompt: "x và y tỉ lệ nghịch, xy=24. Khi x=6 thì y=?", options: ["4", "18", "3", "144"], correct: 0, explain: "y = 24/x = 24/6 = 4." },
          { prompt: "Tính chất dãy tỉ số bằng nhau: nếu a/b=c/d thì tỉ số đó còn bằng?", options: ["(a+c)/(b+d)", "(a-c)/(b+d)", "(a×c)/(b×d)", "ad/bc"], correct: 0, explain: "Tính chất dãy tỉ số bằng nhau: a/b=c/d=(a+c)/(b+d), với điều kiện b+d≠0." },
          { prompt: "3 người làm xong việc trong 8 ngày. Nếu 6 người (cùng năng suất) làm việc đó thì mất bao lâu?", options: ["4 ngày", "16 ngày", "2 ngày", "24 ngày"], correct: 0, explain: "Số người và số ngày tỉ lệ nghịch: 3×8 = 6×t, nên t=4 ngày." },
        ],
        exercises: [
          { prompt: "Tìm x trong tỉ lệ thức: x/4 = 15/20", solution: "Áp dụng tính chất tỉ lệ thức: x×20 = 4×15 = 60.\nx = 60/20 = 3.", answer: "3" },
          { prompt: "Ba số x, y, z tỉ lệ với 2, 3, 5 và có tổng bằng 100. Tìm x, y, z.", solution: "x/2 = y/3 = z/5 = (x+y+z)/(2+3+5) = 100/10 = 10.\nVậy x=2×10=20, y=3×10=30, z=5×10=50.", answer: "50" },
          { prompt: "y tỉ lệ nghịch với x, biết x=4 thì y=9. Tìm y khi x=6.", solution: "Hằng số tỉ lệ: xy = 4×9 = 36.\nKhi x=6: y = 36/6 = 6.", answer: "6" },
          { prompt: "Tìm y biết: 3/y = 9/15", solution: "3×15 = 9y → y = 45/9 = 5.", answer: "5" },
          { prompt: "Cho x, y tỉ lệ thuận, hệ số tỉ lệ k=1,5. Tính y khi x=8.", solution: "y = k×x = 1,5×8 = 12.", answer: "12" },
          { prompt: "5 công nhân làm xong một công việc trong 6 ngày. Hỏi 3 công nhân (cùng năng suất) làm xong công việc đó trong bao nhiêu ngày?", solution: "Số người và số ngày tỉ lệ nghịch: 5×6 = 3×t → t = 10 ngày.", answer: "10 ngày" },
          { prompt: "Ba số a, b, c tỉ lệ với 3, 4, 5. Biết a=6. Tính b và c.", solution: "Hệ số chung: a/3 = 6/3 = 2.\nb = 4×2 = 8. c = 5×2 = 10.", answer: "10" },
          { prompt: "Tìm x trong tỉ lệ thức: 4/9 = x/27", solution: "x = 4×27/9 = 12.", answer: "12" },
          { prompt: "Hai đại lượng x, y tỉ lệ nghịch, khi x=3 thì y=8. Tìm y khi x=4.", solution: "Hằng số tỉ lệ: xy = 3×8 = 24.\nKhi x=4: y = 24/4 = 6.", answer: "6" },
          { prompt: "Tìm x, y biết x/3=y/5 và x+y=24.", solution: "Theo tính chất dãy tỉ số bằng nhau: x/3=y/5=(x+y)/8=24/8=3.\nx=3×3=9. y=5×3=15.", answer: "15" },
        ],
        advanced: [
          { prompt: "Ba đội công nhân có số người tỉ lệ với 3, 4, 5; cùng làm một công việc với năng suất mỗi người như nhau nên thời gian hoàn thành tỉ lệ nghịch với số người. Đội có tỉ lệ 3 hoàn thành trong 20 ngày. Hỏi đội có tỉ lệ 5 hoàn thành trong bao nhiêu ngày?", solution: "Thời gian tỉ lệ nghịch với số người, nên tỉ lệ thuận với 1/3, 1/4, 1/5.\nQuy đồng: 1/3:1/4:1/5 = 20:15:12 (mẫu chung 60).\nĐội tỉ lệ 3 (ứng với phần 20) mất 20 ngày, suy ra mỗi phần ứng với 1 ngày.\nĐội tỉ lệ 5 (ứng với phần 12) mất 12 ngày.", answer: "12 ngày" },
          { prompt: "Cho a/2=b/3=c/4 và a+2b−c=6. Tìm a, b, c.", solution: "Đặt a/2=b/3=c/4=k, suy ra a=2k, b=3k, c=4k.\nThay vào a+2b-c=6: 2k+6k-4k=6 → 4k=6 → k=1,5.\nVậy a=3, b=4,5, c=6.", answer: "a=3, b=4,5, c=6" },
          { prompt: "Một khu vườn hình chữ nhật có tỉ số chiều dài : chiều rộng = 5:3. Nếu giảm chiều dài 5m và tăng chiều rộng 5m thì trở thành hình vuông. Tính diện tích khu vườn ban đầu.", solution: "Gọi chiều dài=5x, chiều rộng=3x. Khi giảm dài 5m và tăng rộng 5m thành hình vuông: 5x-5=3x+5 → 2x=10 → x=5.\nChiều dài=25m, chiều rộng=15m.\nDiện tích = 25×15 = 375m².", answer: "375m²" },
          { prompt: "Tìm x, y, z biết x/2=y/3=z/4 và x+y+z=54.", solution: "Đặt x=2k, y=3k, z=4k. x+y+z=2k+3k+4k=9k=54 → k=6.\nVậy x=12, y=18, z=24." , answer: "x=12, y=18, z=24" },
          { prompt: "Một ô tô đi từ A đến B với vận tốc v₁ hết t₁ giờ. Nếu đi với vận tốc v₂=1,2×v₁ thì hết bao nhiêu thời gian (theo t₁)?", solution: "Vì quãng đường không đổi, vận tốc và thời gian tỉ lệ nghịch: v₁×t₁=v₂×t₂.\nv₁×t₁ = 1,2v₁×t₂ → t₂ = t₁/1,2 = 5t₁/6." , answer: "5t₁/6" },
          { prompt: "Ba đội thợ có năng suất tỉ lệ với 2, 3, 4, cùng làm chung 1 công việc trong 12 ngày thì xong. Nếu chỉ đội có năng suất tỉ lệ 2 làm một mình thì mất bao lâu?", solution: "Tổng năng suất = 2+3+4=9 phần. Công việc = 9×12=108 (đơn vị).\nĐội tỉ lệ 2 làm một mình: thời gian = 108/2 = 54 ngày." , answer: "54 ngày" },
          { prompt: "Cho y tỉ lệ nghịch với x, khi x=6 thì y=8. Hỏi khi x tăng gấp 3 thì y bằng bao nhiêu?", solution: "Hằng số tỉ lệ: xy=6×8=48.\nKhi x tăng gấp 3 (x'=18): y'=48/18=8/3." , answer: "8/3" },
          { prompt: "Tìm 3 số biết chúng tỉ lệ với 3, 5, 7 và tổng bình phương của chúng bằng 332.", solution: "Đặt 3 số là 3k, 5k, 7k. (3k)²+(5k)²+(7k)²=9k²+25k²+49k²=83k²=332 → k²=4 → k=2.\nBa số: 6, 10, 14." , answer: "6, 10, 14" },
          { prompt: "Một hình chữ nhật có tỉ số 2 cạnh là 3:4, đường chéo dài 20cm. Tính diện tích.", solution: "Gọi 2 cạnh là 3x, 4x. Theo Pytago: (3x)²+(4x)²=20² → 25x²=400 → x²=16 → x=4.\nHai cạnh: 12cm, 16cm. Diện tích = 12×16 = 192cm²." , answer: "192cm²" },
          { prompt: "Đại lượng y tỉ lệ thuận với x². Biết x=3 thì y=27. Tìm y khi x=5.", solution: "y=kx². 27=k×9 → k=3.\nKhi x=5: y=3×25=75." , answer: "75" },
        ],
      },
      {
        id: "bieu-thuc-da-thuc-7",
        title: "Biểu thức đại số và đa thức một biến",
        questions: [
          { prompt: "Biểu thức nào sau đây là đơn thức một biến?", options: ["3x²", "3x+2", "x/(x-1)", "√x"], correct: 0, explain: "3x² là tích của một số với lũy thừa của biến x, là đơn thức." },
          { prompt: "Bậc của đa thức 2x³−5x+1 là?", options: ["3", "1", "5", "2"], correct: 0, explain: "Bậc của đa thức là số mũ cao nhất của biến, ở đây là x³ nên bậc là 3." },
          { prompt: "Cho đa thức P(x)=x²−3x+2. Tính P(1).", options: ["0", "1", "2", "-1"], correct: 0, explain: "P(1) = 1²-3×1+2 = 1-3+2 = 0." },
          { prompt: "(x²+2x) + (3x²−x) = ?", options: ["4x²+x", "4x²-x", "2x²+x", "4x²+2x"], correct: 0, explain: "Cộng các hạng tử đồng dạng: (x²+3x²)+(2x-x) = 4x²+x." },
          { prompt: "(5x³−2x) − (2x³−x) = ?", options: ["3x³-x", "3x³-3x", "3x³+x", "7x³-3x"], correct: 0, explain: "(5x³-2x³)+(-2x-(-x)) = 3x³-x." },
          { prompt: "Đa thức một biến bậc hai có dạng tổng quát nào?", options: ["ax²+bx+c (a≠0)", "ax+b", "ax³+bx²+cx+d", "a/x+b"], correct: 0, explain: "Đa thức bậc hai một biến có dạng ax²+bx+c với hệ số a khác 0." },
        ],
        exercises: [
          { prompt: "Tính giá trị của biểu thức 3x²−2x+1 tại x=2.", solution: "3(2)²-2(2)+1 = 3×4-4+1 = 12-4+1 = 9.", answer: "9" },
          { prompt: "Thu gọn đa thức: 5x³−2x²+3x³−x²", solution: "Nhóm các hạng tử đồng dạng: (5x³+3x³)+(-2x²-x²) = 8x³-3x².", answer: "8x³-3x²" },
          { prompt: "Tìm bậc và hệ số cao nhất của đa thức −4x⁵+2x³−7.", solution: "Số mũ cao nhất của biến x là 5, nên bậc của đa thức là 5.\nHệ số của hạng tử bậc cao nhất (x⁵) là -4.", answer: "-4." },
          { prompt: "Tính giá trị đa thức P(x)=2x²−x+3 tại x=−1.", solution: "P(-1) = 2(-1)²-(-1)+3 = 2+1+3 = 6.", answer: "6" },
          { prompt: "Thu gọn: (2x²−3x+1)−(x²−x−2)", solution: "(2x²-x²)+(-3x-(-x))+(1-(-2)) = x²-2x+3.", answer: "x²-2x+3" },
          { prompt: "Tìm nghiệm của đa thức P(x)=2x−6.", solution: "2x-6=0 → x=3.", answer: "3" },
          { prompt: "Nhân đa thức: (x−1)(x+4)", solution: "x×x+x×4+(-1)×x+(-1)×4 = x²+4x-x-4 = x²+3x-4.", answer: "x²+3x-4" },
          { prompt: "Cho đa thức Q(x)=x³−2x+1. Tính Q(2).", solution: "Q(2) = 8-4+1 = 5.", answer: "5" },
          { prompt: "Sắp xếp đa thức 3x − x³ + 2x² − 5 theo lũy thừa giảm dần của x.", solution: "-x³+2x²+3x-5.", answer: "-x³+2x²+3x-5" },
          { prompt: "Tính giá trị đa thức tại x=0: P(x)=5x³−3x+7", solution: "P(0) = 5(0)-3(0)+7 = 7.", answer: "7" },
        ],
        advanced: [
          { prompt: "Tìm đa thức bậc hai P(x)=ax²+bx+c biết P(0)=1, P(1)=4, P(−1)=2.", solution: "P(0)=c=1.\nP(1)=a+b+c=4 → a+b=3.\nP(-1)=a-b+c=2 → a-b=1.\nCộng hai phương trình: 2a=4 → a=2, suy ra b=1.\nVậy P(x)=2x²+x+1.", answer: "P(x)=2x²+x+1" },
          { prompt: "Cho đa thức P(x) thỏa mãn P(x)+P(1−x)=1 với mọi x. Tính P(0)+P(1).", solution: "Thay x=0 vào đẳng thức đã cho: P(0)+P(1-0)=1, tức P(0)+P(1)=1.", answer: "1" },
          { prompt: "Tìm số giá trị x thỏa mãn: (x−1)(x−2)(x−3)...(x−2024) = 0", solution: "Tích bằng 0 khi và chỉ khi có ít nhất một nhân tử bằng 0, tức x=1, x=2, x=3, ..., hoặc x=2024.\nCó tất cả 2024 giá trị x thỏa mãn (mỗi giá trị cho đúng 1 nghiệm).", answer: "2024" },
          { prompt: "Cho đa thức P(x)=x²−5x+6. Tìm tất cả nghiệm của P(x) và viết P(x) dưới dạng tích 2 nhân tử bậc nhất.", solution: "Giải x²-5x+6=0 → (x-2)(x-3)=0 → x=2 hoặc x=3.\nVậy P(x)=(x-2)(x-3)." , answer: "P(x)=(x-2)(x-3); nghiệm x=2, x=3" },
          { prompt: "Tính giá trị của đa thức A=x²−2xy+y² tại x=13, y=3 (dùng hằng đẳng thức để tính nhanh).", solution: "A=(x-y)² = (13-3)² = 10² = 100." , answer: "100" },
          { prompt: "Tìm đa thức bậc nhất P(x)=ax+b biết P(2)=5 và P(−1)=−4.", solution: "2a+b=5. -a+b=-4. Trừ hai phương trình: 3a=9 → a=3, b=-1.\nVậy P(x)=3x-1." , answer: "P(x)=3x-1" },
          { prompt: "Cho đa thức Q(x) bậc 3 có 3 nghiệm là 1, 2, −3 và hệ số cao nhất là 1. Viết Q(x) dưới dạng tích, rồi tính Q(0).", solution: "Q(x)=(x-1)(x-2)(x+3).\nQ(0)=(-1)(-2)(3)=6." , answer: "Q(x)=(x-1)(x-2)(x+3); Q(0)=6" },
          { prompt: "Rút gọn: (x+1)² − (x−1)² (dùng hằng đẳng thức hiệu hai bình phương).", solution: "Đặt a=x+1, b=x-1: a-b=2, a+b=2x.\nKết quả = (a-b)(a+b) = 2×2x = 4x." , answer: "4x" },
          { prompt: "Cho 2 đa thức P(x)=2x²−3x+1 và Q(x)=x²+3x−4. Tìm đa thức P(x)−Q(x) và nghiệm của nó (nếu có).", solution: "P(x)-Q(x) = 2x²-3x+1-x²-3x+4 = x²-6x+5.\nGiải x²-6x+5=0 → (x-1)(x-5)=0 → x=1 hoặc x=5." , answer: "x²-6x+5; nghiệm x=1, x=5" },
          { prompt: "Tìm m để đa thức P(x)=x²−(m+1)x+2m có nghiệm x=2 (hãy tính P(2) theo m trước).", solution: "P(2)=4-2(m+1)+2m = 4-2m-2+2m = 2, không phụ thuộc m.\nVì P(2)=2≠0 với mọi m, nên không có giá trị m nào để x=2 là nghiệm của P(x)." , answer: "Không có m nào thỏa mãn (P(2) luôn bằng 2)" },
        ],
      },
      {
        id: "bien-co-xac-suat-7",
        title: "Làm quen với biến cố và xác suất của biến cố",
        questions: [
          { prompt: "Biến cố chắc chắn là biến cố như thế nào?", options: ["Luôn luôn xảy ra", "Không bao giờ xảy ra", "Có thể xảy ra hoặc không", "Không xác định được"], correct: 0, explain: "Biến cố chắc chắn là biến cố mà kết quả của phép thử luôn làm nó xảy ra." },
          { prompt: "Biến cố không thể là biến cố như thế nào?", options: ["Không bao giờ xảy ra", "Luôn luôn xảy ra", "Có thể xảy ra", "Xảy ra một nửa số lần"], correct: 0, explain: "Biến cố không thể là biến cố mà không có kết quả nào của phép thử làm nó xảy ra." },
          { prompt: "Gieo một con xúc xắc 6 mặt, biến cố \"ra số chấm lớn hơn 6\" là loại biến cố gì?", options: ["Biến cố không thể", "Biến cố chắc chắn", "Biến cố ngẫu nhiên", "Không xác định"], correct: 0, explain: "Xúc xắc chỉ có tối đa 6 chấm nên không bao giờ ra số lớn hơn 6 — đây là biến cố không thể." },
          { prompt: "Xác suất của biến cố chắc chắn bằng?", options: ["1", "0", "0,5", "Không xác định"], correct: 0, explain: "Biến cố chắc chắn luôn xảy ra nên có xác suất bằng 1." },
          { prompt: "Gieo một đồng xu, xác suất xuất hiện mặt ngửa là?", options: ["1/2", "1", "0", "1/4"], correct: 0, explain: "Đồng xu có 2 mặt đồng khả năng, xác suất ra mặt ngửa là 1/2." },
          { prompt: "Rút 1 thẻ từ hộp có 10 thẻ đánh số từ 1 đến 10, xác suất rút được thẻ số chẵn là?", options: ["1/2", "1/10", "1/5", "1"], correct: 0, explain: "Có 5 số chẵn trong 10 số (2,4,6,8,10), xác suất = 5/10 = 1/2." },
        ],
        exercises: [
          { prompt: "Trong hộp có 3 bi đỏ, 5 bi xanh. Lấy ngẫu nhiên 1 bi. Tính xác suất lấy được bi đỏ.", solution: "Tổng số bi = 3+5 = 8.\nXác suất lấy được bi đỏ = 3/8.", answer: "3/8" },
          { prompt: "Gieo 1 xúc xắc, biến cố \"ra số lớn hơn 4\" gồm những kết quả nào? Tính xác suất.", solution: "Các kết quả thỏa mãn: 5 và 6 → 2 kết quả trong 6.\nXác suất = 2/6 = 1/3.", answer: "1/3" },
          { prompt: "Một hộp có 10 thẻ đánh số từ 1 đến 10. Tính xác suất rút được thẻ là bội của 3.", solution: "Bội của 3 trong khoảng 1-10: 3, 6, 9 → 3 kết quả.\nXác suất = 3/10.", answer: "3/10" },
          { prompt: "Gieo 1 xúc xắc, tính xác suất ra số nhỏ hơn 3.", solution: "Kết quả thỏa mãn: 1, 2 → 2 kết quả. Xác suất = 2/6 = 1/3.", answer: "1/3" },
          { prompt: "Một hộp có 6 bi giống hệt nhau về kích thước: 2 đỏ, 4 xanh. Tính xác suất lấy được bi xanh.", solution: "Xác suất = 4/6 = 2/3.", answer: "2/3" },
          { prompt: "Tung một đồng xu 2 lần, liệt kê không gian mẫu.", solution: "Không gian mẫu: {SS, SN, NS, NN} — có 4 kết quả.", answer: "{SS, SN, NS, NN} — có 4 kết quả" },
          { prompt: "Từ không gian mẫu ở bài trên, tính xác suất có đúng 1 lần ngửa.", solution: "Kết quả thỏa mãn: {SN, NS} → 2 kết quả trong 4.\nXác suất = 2/4 = 1/2.", answer: "1/2" },
          { prompt: "Một túi có 10 quả bóng đánh số 1-10. Tính xác suất lấy được số lớn hơn 7.", solution: "Kết quả thỏa mãn: 8, 9, 10 → 3 kết quả. Xác suất = 3/10.", answer: "3/10" },
          { prompt: "Biến cố \"Gieo xúc xắc ra 7 chấm\" là loại biến cố gì?", solution: "Vì xúc xắc chỉ có tối đa 6 chấm, đây là biến cố không thể (không bao giờ xảy ra).", answer: "6" },
          { prompt: "Biến cố \"Mặt trời mọc ở hướng Đông\" là loại biến cố gì?", solution: "Đây là biến cố chắc chắn, vì luôn xảy ra trong thực tế.", answer: "Đây là biến cố chắc chắn, vì luôn xảy ra trong thực tế" },
        ],
        advanced: [
          { prompt: "Gieo 2 xúc xắc. Tính xác suất để tích hai số chấm là một số chính phương (1, 4, 9, 16, 25, 36).", solution: "Liệt kê các cặp có tích là số chính phương:\nTích=1: (1,1) → 1 cách.\nTích=4: (1,4),(4,1),(2,2) → 3 cách.\nTích=9: (3,3) → 1 cách.\nTích=16: (4,4) → 1 cách.\nTích=25: (5,5) → 1 cách.\nTích=36: (6,6) → 1 cách.\nTổng = 1+3+1+1+1+1 = 8 cách trong 36.\nXác suất = 8/36 = 2/9.", answer: "2/9" },
          { prompt: "Một hộp có 3 loại bi đỏ, xanh, vàng theo tỉ lệ 2:3:5, tổng cộng 40 viên. Lấy ngẫu nhiên 1 viên, tính xác suất không phải bi đỏ.", solution: "Tổng số phần = 2+3+5=10. Số bi đỏ = 40×2/10 = 8.\nSố bi không đỏ = 40-8 = 32.\nXác suất = 32/40 = 4/5.", answer: "4/5" },
          { prompt: "Ba bạn An, Bình, Chi xếp ngẫu nhiên thành một hàng dọc. Tính xác suất để An đứng đầu hàng.", solution: "Tổng số cách xếp 3 người: 3!=6.\nSố cách để An đứng đầu: cố định An ở đầu, xếp 2 bạn còn lại: 2!=2 cách.\nXác suất = 2/6 = 1/3.", answer: "1/3" },
          { prompt: "Một hộp có 20 thẻ đánh số 1-20. Rút 1 thẻ, tính xác suất được số chia hết cho 3 hoặc chia hết cho 4.", solution: "Chia hết cho 3: 6 số (3,...,18). Chia hết cho 4: 5 số (4,...,20). Chia hết cả 2 (tức 12): 1 số (chỉ 12, vì 24>20).\nTheo bao hàm trừ giao: 6+5-1=10. Xác suất = 10/20 = 1/2." , answer: "1/2" },
          { prompt: "Gieo 1 xúc xắc 2 lần. Tính xác suất để lần 2 ra số lớn hơn lần 1.", solution: "Tổng 36 kết quả. Số cặp bằng nhau (1,1),...,(6,6): 6 cách.\nSố cặp khác nhau = 36-6=30, chia đôi cho 2 chiều (lần2>lần1 hoặc ngược lại): 15 cách mỗi chiều.\nXác suất = 15/36 = 5/12." , answer: "5/12" },
          { prompt: "Một túi có 4 bi đỏ, 3 bi xanh, 2 bi vàng (tổng 9 bi). Lấy ngẫu nhiên 2 bi cùng lúc. Tính xác suất 2 bi khác màu.", solution: "Tổng cách chọn 2 từ 9: C(9,2)=36.\nCách 2 cùng màu: C(4,2)+C(3,2)+C(2,2)=6+3+1=10.\nKhác màu = 36-10=26. Xác suất = 26/36=13/18." , answer: "13/18" },
          { prompt: "Ba bạn A, B, C mỗi người viết ngẫu nhiên 1 số từ 1-3 (có thể trùng). Tính xác suất cả 3 bạn viết số giống nhau.", solution: "Tổng cách = 3³=27.\nSố cách cả 3 giống nhau: cùng viết 1, hoặc cùng viết 2, hoặc cùng viết 3: 3 cách.\nXác suất = 3/27 = 1/9." , answer: "1/9" },
          { prompt: "Gieo 4 đồng xu cùng lúc. Tính xác suất có đúng 2 mặt ngửa.", solution: "C(4,2)=6 cách chọn vị trí 2 mặt ngửa trong 4 đồng. Tổng 2⁴=16 kết quả.\nXác suất = 6/16 = 3/8." , answer: "3/8" },
          { prompt: "Một hộp có 5 lá thăm đánh số 1-5. Rút liên tiếp 2 lá không hoàn lại. Tính xác suất tổng 2 số là số chẵn.", solution: "Tổng chẵn khi cả 2 cùng chẵn hoặc cả 2 cùng lẻ. Số chẵn: 2,4 (2 số). Số lẻ: 1,3,5 (3 số).\nCách chọn 2 chẵn: C(2,2)=1. Cách chọn 2 lẻ: C(3,2)=3. Tổng=4.\nTổng cách chọn 2 từ 5: C(5,2)=10. Xác suất = 4/10 = 2/5." , answer: "2/5" },
          { prompt: "Một lớp có 12 nam, 18 nữ. Chọn ngẫu nhiên 2 bạn làm lớp trưởng và lớp phó (2 vai trò khác nhau). Tính xác suất cả 2 đều là nam.", solution: "Tổng cách chọn có thứ tự 2 người từ 30: 30×29=870.\nSố cách 2 nam: 12×11=132.\nXác suất = 132/870 = 22/145." , answer: "22/145" },
        ],
      },
      {
        id: "quan-he-yeu-to-tam-giac-7",
        title: "Quan hệ giữa các yếu tố trong tam giác",
        questions: [
          { prompt: "Trong một tam giác, góc đối diện với cạnh lớn hơn thì như thế nào?", options: ["Lớn hơn", "Nhỏ hơn", "Bằng nhau", "Không liên quan"], correct: 0, explain: "Quan hệ giữa góc và cạnh đối diện: cạnh lớn hơn thì góc đối diện cũng lớn hơn." },
          { prompt: "Đường vuông góc kẻ từ một điểm đến một đường thẳng so với đường xiên kẻ từ điểm đó thì như thế nào?", options: ["Ngắn hơn mọi đường xiên", "Dài hơn mọi đường xiên", "Bằng đường xiên", "Không so sánh được"], correct: 0, explain: "Trong các đoạn nối từ một điểm đến một đường thẳng, đường vuông góc là đoạn ngắn nhất." },
          { prompt: "Ba đoạn thẳng a, b, c là ba cạnh của một tam giác khi nào?", options: ["Tổng hai cạnh bất kỳ lớn hơn cạnh còn lại", "Ba cạnh bằng nhau", "Tổng ba cạnh bằng 180", "Hiệu hai cạnh bằng cạnh còn lại"], correct: 0, explain: "Đây là bất đẳng thức tam giác: tổng độ dài hai cạnh bất kỳ phải lớn hơn cạnh còn lại." },
          { prompt: "Tam giác có 3 cạnh 3cm, 4cm, 8cm có tồn tại không?", options: ["Không tồn tại", "Có tồn tại", "Tồn tại và là tam giác vuông", "Không xác định được"], correct: 0, explain: "3+4=7<8, không thỏa mãn bất đẳng thức tam giác nên không tồn tại tam giác này." },
          { prompt: "Trong tam giác ABC, nếu AB > AC thì so sánh góc C và góc B như thế nào?", options: ["Góc C lớn hơn góc B", "Góc B lớn hơn góc C", "Hai góc bằng nhau", "Không xác định được"], correct: 0, explain: "Cạnh AB đối diện góc C, cạnh AC đối diện góc B. AB>AC nên góc C > góc B." },
          { prompt: "Hình chiếu của một đường xiên càng dài thì đường xiên đó càng như thế nào?", options: ["Dài hơn", "Ngắn hơn", "Bằng nhau", "Không liên quan"], correct: 0, explain: "Quan hệ đường xiên - hình chiếu: hình chiếu dài hơn thì đường xiên tương ứng cũng dài hơn." },
        ],
        exercises: [
          { prompt: "Tam giác ABC có AB=5cm, AC=7cm, BC=x. Tìm điều kiện của x để ABC là một tam giác.", solution: "Theo bất đẳng thức tam giác: |7-5| < x < 7+5, tức 2 < x < 12.", answer: "|7-5| < x < 7+5, tức 2 < x < 12" },
          { prompt: "Tam giác ABC vuông tại A, AB=3cm, AC=4cm. So sánh cạnh BC với AB, AC.", solution: "Theo Pytago: BC² = AB²+AC² = 9+16 = 25, nên BC = 5cm.\nVì BC=5 > AB=3 và BC=5 > AC=4, cạnh huyền BC luôn là cạnh lớn nhất trong tam giác vuông.", answer: "4," },
          { prompt: "Cho tam giác ABC có góc B > góc C. So sánh cạnh AC và AB.", solution: "Cạnh đối diện góc lớn hơn thì lớn hơn: AC đối diện góc B, AB đối diện góc C.\nVì góc B > góc C nên AC > AB.", answer: "Vì góc B > góc C nên AC > AB" },
          { prompt: "Tam giác ABC có AB=4cm, BC=6cm. Tìm khoảng giá trị của AC.", solution: "Theo bất đẳng thức tam giác: |6-4| < AC < 6+4, tức 2 < AC < 10.", answer: "|6-4| < AC < 6+4, tức 2 < AC < 10" },
          { prompt: "Tam giác ABC vuông tại A. So sánh cạnh huyền BC với hai cạnh góc vuông AB, AC.", solution: "Cạnh huyền BC đối diện góc vuông (góc lớn nhất), nên BC là cạnh lớn nhất trong tam giác.", answer: "Cạnh huyền BC đối diện góc vuông (góc lớn nhất), nên BC là cạnh lớn nhất trong tam giác" },
          { prompt: "Trong tam giác ABC, góc A lớn nhất. Cạnh nào của tam giác lớn nhất?", solution: "Cạnh đối diện với góc lớn nhất là cạnh lớn nhất: cạnh BC (đối diện góc A) lớn nhất.", answer: "cạnh BC (đối diện góc A) lớn nhất" },
          { prompt: "Ba đoạn thẳng 3cm, 4cm, 9cm có tạo thành một tam giác không?", solution: "3+4=7<9, không thỏa mãn bất đẳng thức tam giác, nên ba đoạn này không tạo thành tam giác.", answer: "9," },
          { prompt: "Cho điểm M nằm ngoài đường thẳng d. Đoạn nào từ M đến d là ngắn nhất?", solution: "Đoạn vuông góc từ M đến d luôn là đoạn ngắn nhất trong các đoạn nối M với d.", answer: "Đoạn vuông góc từ M đến d luôn là đoạn ngắn nhất trong các đoạn nối M với d" },
          { prompt: "Tam giác ABC có góc A=80°, góc B=60°. Cạnh nào của tam giác lớn nhất?", solution: "Góc C = 180°-80°-60° = 40°. Vì góc A=80° lớn nhất, cạnh BC (đối diện góc A) lớn nhất.", answer: "80°" },
          { prompt: "Hai đường xiên kẻ từ một điểm đến một đường thẳng có hình chiếu bằng nhau. So sánh hai đường xiên đó.", solution: "Khi hình chiếu bằng nhau thì hai đường xiên đó cũng bằng nhau.", answer: "Khi hình chiếu bằng nhau thì hai đường xiên đó cũng bằng nhau" },
        ],
        advanced: [
          { prompt: "Tam giác ABC có hai cạnh 7cm và 10cm. Cạnh còn lại là số nguyên (cm). Hỏi cạnh còn lại có thể nhận bao nhiêu giá trị nguyên?", solution: "Theo bất đẳng thức tam giác: |10-7|<cạnh<10+7, tức 3<cạnh<17.\nCác giá trị nguyên thỏa mãn: 4,5,6,...,16 — có tất cả 16-4+1=13 giá trị.", answer: "13 giá trị" },
          { prompt: "Tam giác ABC vuông tại A có AB=6cm, AC=8cm, đường cao AH. Tính AH.", solution: "Theo Pytago: BC=√(6²+8²)=√100=10cm.\nDiện tích tam giác tính hai cách: ½×AB×AC = ½×AH×BC.\n½×6×8 = ½×AH×10 → 24=5×AH → AH=4,8cm.", answer: "4,8cm" },
          { prompt: "Tam giác ABC có góc A=90°, đường trung tuyến AM (M là trung điểm BC). Biết BC=10cm. Tính AM.", solution: "Tính chất: trong tam giác vuông, đường trung tuyến ứng với cạnh huyền bằng nửa cạnh huyền.\nAM = BC/2 = 10/2 = 5cm.", answer: "5cm" },
          { prompt: "Tam giác ABC có góc A=50°, góc B=60°. So sánh 3 cạnh AB, BC, CA.", solution: "Góc C=180°-50°-60°=70° (lớn nhất) → cạnh AB (đối diện C) lớn nhất.\nGóc A nhỏ nhất (50°) → cạnh BC (đối diện A) nhỏ nhất.\nVậy BC<CA<AB." , answer: "BC<CA<AB" },
          { prompt: "Tam giác ABC vuông tại A, AB<AC. So sánh góc B và góc C.", solution: "Cạnh AB<AC, mà góc C đối diện AB, góc B đối diện AC.\nCạnh nhỏ hơn thì góc đối diện nhỏ hơn: góc C<góc B." , answer: "góc C < góc B" },
          { prompt: "Ba đoạn thẳng có độ dài x, x+2, x+4 (x>0) tạo thành một tam giác. Tìm điều kiện của x.", solution: "Cạnh lớn nhất (x+4) phải nhỏ hơn tổng hai cạnh còn lại: x+4<x+(x+2) → x+4<2x+2 → x>2." , answer: "x>2" },
          { prompt: "Tam giác cân ABC (AB=AC) có góc đáy B=70°. So sánh cạnh AB với BC.", solution: "Góc C=70° (cân). Góc A=180°-70°-70°=40° (nhỏ nhất).\nCạnh đối diện góc nhỏ nhất là cạnh nhỏ nhất: BC (đối diện A) nhỏ nhất.\nVậy BC<AB." , answer: "BC < AB" },
          { prompt: "Tam giác ABC có AB=7cm, AC=9cm, BC=x (x nguyên, lẻ). Tìm giá trị lớn nhất của x.", solution: "Theo bất đẳng thức tam giác: |9-7|<x<9+7, tức 2<x<16.\nSố nguyên lẻ lớn nhất thỏa mãn: x=15." , answer: "15" },
          { prompt: "Tam giác ABC có góc A=90°, phân giác góc B cắt AC tại D. Biết AB=6cm, BC=10cm. Tính AD.", solution: "AC=√(BC²-AB²)=√(100-36)=8cm (Pytago).\nTheo tính chất phân giác: AD/DC=AB/BC=6/10=3/5.\nAD+DC=8. AD = 8×3/8 = 3cm." , answer: "3cm" },
          { prompt: "Cho tam giác ABC vuông tại A, đường trung tuyến AM=5cm. Tính độ dài cạnh huyền BC.", solution: "Trong tam giác vuông, trung tuyến ứng với cạnh huyền bằng nửa cạnh huyền.\nBC = 2×AM = 10cm." , answer: "10cm" },
        ],
      },
      {
        id: "hinh-khoi-thuc-tien-7",
        title: "Một số hình khối trong thực tiễn",
        questions: [
          { prompt: "Hình hộp chữ nhật có bao nhiêu mặt?", options: ["6", "8", "12", "4"], correct: 0, explain: "Hình hộp chữ nhật có 6 mặt là các hình chữ nhật." },
          { prompt: "Hình lập phương cạnh a có thể tích bằng?", options: ["a³", "a²", "6a²", "4a"], correct: 0, explain: "Thể tích hình lập phương = cạnh×cạnh×cạnh = a³." },
          { prompt: "Hình lăng trụ đứng tam giác có bao nhiêu mặt bên?", options: ["3", "4", "2", "6"], correct: 0, explain: "Lăng trụ đứng tam giác có đáy là tam giác (3 cạnh) nên có 3 mặt bên là hình chữ nhật." },
          { prompt: "Thể tích hình hộp chữ nhật có 3 kích thước a, b, c là?", options: ["abc", "a+b+c", "2(ab+bc+ca)", "abc/2"], correct: 0, explain: "Thể tích hình hộp chữ nhật = dài×rộng×cao = abc." },
          { prompt: "Diện tích xung quanh của hình hộp chữ nhật tính bằng công thức nào (với chu vi đáy C, chiều cao h)?", options: ["C×h", "C+h", "C/h", "C×h/2"], correct: 0, explain: "Diện tích xung quanh = chu vi đáy × chiều cao." },
          { prompt: "Hình lăng trụ đứng tứ giác có đáy là hình chữ nhật thì được gọi là hình gì?", options: ["Hình hộp chữ nhật", "Hình lập phương", "Hình chóp", "Hình trụ"], correct: 0, explain: "Lăng trụ đứng tứ giác có đáy hình chữ nhật chính là hình hộp chữ nhật." },
        ],
        exercises: [
          { prompt: "Một hình hộp chữ nhật có kích thước 5cm×4cm×3cm. Tính thể tích.", solution: "V = dài×rộng×cao = 5×4×3 = 60cm³.", answer: "60cm³" },
          { prompt: "Một hình lập phương có cạnh 6cm. Tính diện tích toàn phần (6 mặt).", solution: "Diện tích 1 mặt = 6² = 36cm².\nDiện tích toàn phần = 6×36 = 216cm².", answer: "216cm²" },
          { prompt: "Một bể nước hình hộp chữ nhật có đáy 2m×1,5m, cao 1m. Tính thể tích bể (đổi ra lít, biết 1m³=1000 lít).", solution: "V = 2×1,5×1 = 3m³.\nĐổi ra lít: 3×1000 = 3000 lít.", answer: "3000 lít" },
          { prompt: "Hình lập phương có thể tích 125cm³. Tính độ dài cạnh.", solution: "Cạnh = ∛125 = 5cm.", answer: "5cm" },
          { prompt: "Một hình hộp chữ nhật có chiều dài 6cm, rộng 4cm, cao 5cm. Tính diện tích xung quanh (Sxq=2×(dài+rộng)×cao).", solution: "Sxq = 2×(6+4)×5 = 2×10×5 = 100cm².", answer: "100cm²" },
          { prompt: "Tính diện tích toàn phần hình lập phương cạnh 4cm.", solution: "Diện tích toàn phần = 6×cạnh² = 6×16 = 96cm².", answer: "96cm²" },
          { prompt: "Một bể cá hình hộp chữ nhật có đáy 40cm×30cm, cao 25cm. Tính thể tích.", solution: "V = 40×30×25 = 30.000cm³ = 30 lít.", answer: "30 lít" },
          { prompt: "Hình lăng trụ đứng tam giác có đáy diện tích 12cm², chiều cao 7cm. Tính thể tích (V=diện tích đáy×cao).", solution: "V = 12×7 = 84cm³.", answer: "84cm³" },
          { prompt: "Tính thể tích hình hộp chữ nhật có các kích thước 2m, 3m, 1,5m.", solution: "V = 2×3×1,5 = 9m³.", answer: "9m³" },
          { prompt: "Một hộp quà hình lập phương cạnh 15cm. Tính diện tích giấy gói tối thiểu (bằng diện tích toàn phần).", solution: "Diện tích toàn phần = 6×cạnh² = 6×225 = 1350cm².", answer: "1350cm²" },
        ],
        advanced: [
          { prompt: "Một bể nước hình hộp chữ nhật đáy hình vuông cạnh 40cm, cao 60cm, đang chứa nước cao 30cm. Thả vào bể một khối lập phương cạnh 20cm ngập hoàn toàn. Hỏi mực nước dâng lên bao nhiêu cm?", solution: "Thể tích khối lập phương = 20³ = 8000cm³.\nDiện tích đáy bể = 40×40 = 1600cm².\nMực nước dâng thêm = 8000:1600 = 5cm.", answer: "5cm" },
          { prompt: "Một hình hộp chữ nhật có 3 kích thước là số nguyên (cm), thể tích bằng 60cm³. Tìm bộ kích thước sao cho diện tích toàn phần nhỏ nhất, và tính diện tích đó.", solution: "Diện tích toàn phần nhỏ nhất khi 3 kích thước gần bằng nhau nhất (gần khối lập phương nhất).\nPhân tích 60=3×4×5 cho 3 số gần nhau nhất trong các cách phân tích có thể.\nDiện tích toàn phần = 2×(3×4+4×5+3×5) = 2×(12+20+15) = 2×47 = 94cm².", answer: "3cm×4cm×5cm, diện tích toàn phần 94cm²" },
          { prompt: "Một khối gỗ lập phương cạnh 10cm được sơn đỏ toàn bộ mặt ngoài, sau đó cắt thành các khối lập phương nhỏ cạnh 1cm. Hỏi có bao nhiêu khối nhỏ có đúng 2 mặt được sơn đỏ?", solution: "Các khối có đúng 2 mặt sơn nằm dọc theo các cạnh của khối lớn (không tính 2 đầu là góc, vì góc có 3 mặt sơn).\nKhối lập phương có 12 cạnh, mỗi cạnh dài 10cm nên có 10 khối nhỏ dọc theo cạnh, trừ đi 2 khối ở hai đầu (là góc): còn 8 khối có đúng 2 mặt sơn trên mỗi cạnh.\nTổng = 12×8 = 96 khối.", answer: "96 khối" },
          { prompt: "Một hình lập phương có tổng độ dài tất cả các cạnh là 96cm. Tính thể tích.", solution: "Hình lập phương có 12 cạnh bằng nhau: cạnh = 96/12 = 8cm.\nThể tích = 8³ = 512cm³." , answer: "512cm³" },
          { prompt: "Một bể nước hình hộp chữ nhật dài 2m, rộng 1,5m, cao 1m, chứa đầy nước. Người ta múc ra 1200 lít. Hỏi mực nước còn lại cao bao nhiêu?", solution: "Thể tích bể = 2×1,5×1 = 3m³ = 3000 lít. Còn lại = 3000-1200 = 1800 lít = 1,8m³.\nDiện tích đáy = 2×1,5 = 3m². Chiều cao còn lại = 1,8/3 = 0,6m." , answer: "0,6m" },
          { prompt: "Hai hình lập phương có cạnh lần lượt là 3cm và 6cm. Tính tỉ số thể tích của chúng.", solution: "Tỉ số thể tích = (tỉ số cạnh)³ = (3/6)³ = (1/2)³ = 1/8." , answer: "1/8" },
          { prompt: "Một khối gỗ hình hộp chữ nhật 6cm×4cm×5cm được sơn toàn bộ mặt ngoài rồi cắt thành các khối lập phương nhỏ cạnh 1cm. Hỏi có bao nhiêu khối không có mặt nào được sơn?", solution: "Khối không có mặt nào sơn nằm hoàn toàn bên trong, có kích thước (6-2)×(4-2)×(5-2) = 4×2×3 = 24 khối." , answer: "24 khối" },
          { prompt: "Một cái hộp không nắp hình hộp chữ nhật kích thước 20cm×15cm×10cm. Tính diện tích bìa cần dùng để làm hộp (đáy + 4 mặt bên).", solution: "Đáy = 20×15 = 300cm². Hai mặt bên (20×10): 2×200=400cm². Hai mặt bên còn lại (15×10): 2×150=300cm².\nTổng = 300+400+300 = 1000cm²." , answer: "1000cm²" },
          { prompt: "Người ta xếp các khối lập phương cạnh 2cm vào 1 hộp hình hộp chữ nhật 10cm×8cm×6cm (vừa khít). Hỏi xếp được bao nhiêu khối lập phương?", solution: "Số khối theo mỗi chiều: 10/2=5, 8/2=4, 6/2=3.\nTổng số khối = 5×4×3 = 60." , answer: "60" },
          { prompt: "Một hình lập phương có thể tích bằng thể tích hình hộp chữ nhật kích thước 2cm×4cm×8cm. Tính cạnh hình lập phương.", solution: "Thể tích hình hộp = 2×4×8 = 64cm³.\nCạnh hình lập phương = ∛64 = 4cm." , answer: "4cm" },
        ],
      },
    ],
    examSources: [
      { label: "Toán THCS (lớp 7) – chuyên mục trên TOANMATH.com", url: "https://thcs.toanmath.com/" },
    ],
  },
  {
    id: 8,
    label: "Lớp 8",
    topics: [
      {
        id: "da-thuc-8",
        title: "Đa thức",
        questions: [
          { prompt: "Biểu thức nào sau đây là đơn thức?", options: ["5x²y", "3x+2", "1/x", "x-1"], correct: 0, explain: "Đơn thức là tích của số với các biến (có lũy thừa nguyên không âm): 5x²y là đơn thức." },
          { prompt: "Đa thức 3x²−5x+2 có bậc bằng bao nhiêu?", options: ["2", "3", "5", "1"], correct: 0, explain: "Bậc của đa thức là số mũ cao nhất của biến, ở đây là x² nên bậc là 2." },
          { prompt: "(2x+3) + (x−1) = ?", options: ["3x+2", "3x+4", "x+2", "2x+2"], correct: 0, explain: "Cộng các hạng tử đồng dạng: (2x+x)+(3-1) = 3x+2." },
          { prompt: "(5x−2) − (2x−3) = ?", options: ["3x+1", "3x-5", "7x-5", "3x-1"], correct: 0, explain: "(5x-2x)+(-2-(-3)) = 3x+1." },
          { prompt: "x²(x+3) = ?", options: ["x³+3x²", "x³+3x", "x²+3x²", "x³+3"], correct: 0, explain: "Nhân đơn thức với đa thức: x²×x+x²×3 = x³+3x²." },
          { prompt: "(6x³+4x²) chia cho đơn thức 2x² bằng?", options: ["3x+2", "3x²+2x", "3x+2x²", "6x+4"], correct: 0, explain: "Chia từng hạng tử: 6x³/2x²=3x và 4x²/2x²=2, kết quả 3x+2." },
        ],
        exercises: [
          { prompt: "Thu gọn: (3x²+2x−1)+(x²−5x+4)", solution: "Nhóm hạng tử đồng dạng: (3x²+x²)+(2x-5x)+(-1+4) = 4x²-3x+3.", answer: "4x²-3x+3" },
          { prompt: "Tính: (x+2)(x−3)", solution: "Nhân từng hạng tử: x×x+x×(-3)+2×x+2×(-3) = x²-3x+2x-6 = x²-x-6.", answer: "x²-x-6" },
          { prompt: "Chia đa thức: (6x³−9x²) ÷ 3x²", solution: "6x³÷3x² = 2x.\n-9x²÷3x² = -3.\nKết quả: 2x-3.", answer: "2x-3" },
          { prompt: "Tính: (3x²−x+2) − (x²+4x−1)", solution: "(3x²-x²)+(-x-4x)+(2-(-1)) = 2x²-5x+3.", answer: "2x²-5x+3" },
          { prompt: "Thu gọn đa thức: 4x³−2x²+3x³−x²+5", solution: "(4x³+3x³)+(-2x²-x²)+5 = 7x³-3x²+5.", answer: "7x³-3x²+5" },
          { prompt: "Tính giá trị đa thức P(x)=2x²−3x+1 tại x=2.", solution: "P(2) = 2(4)-3(2)+1 = 8-6+1 = 3.", answer: "3" },
          { prompt: "Chia đa thức: (8x⁴−4x²) ÷ 4x²", solution: "8x⁴÷4x² = 2x². -4x²÷4x² = -1.\nKết quả: 2x²-1.", answer: "2x²-1" },
          { prompt: "Tìm bậc của đa thức: 5x⁴−3x²+7x−2.", solution: "Số mũ cao nhất của biến x là 4, nên bậc của đa thức là 4.", answer: "4." },
          { prompt: "Nhân đơn thức với đa thức: 3x(x²−2x+1)", solution: "3x×x²+3x×(-2x)+3x×1 = 3x³-6x²+3x.", answer: "3x³-6x²+3x" },
          { prompt: "Tính: (2x+1)(3x−2)", solution: "2x×3x+2x×(-2)+1×3x+1×(-2) = 6x²-4x+3x-2 = 6x²-x-2.", answer: "6x²-x-2" },
        ],
        advanced: [
          { prompt: "Cho x+y=5, xy=6. Tính x³+y³ (không cần tìm x, y cụ thể).", solution: "Áp dụng: x³+y³ = (x+y)³ − 3xy(x+y) = 5³ − 3×6×5 = 125-90 = 35.", answer: "35" },
          { prompt: "Chứng minh n³−n chia hết cho 6 với mọi số tự nhiên n (gợi ý: phân tích thành tích 3 số tự nhiên liên tiếp).", solution: "n³-n = n(n²-1) = n(n-1)(n+1) = tích của 3 số tự nhiên liên tiếp (n-1, n, n+1).\nTrong 3 số tự nhiên liên tiếp luôn có ít nhất 1 số chia hết cho 2, và luôn có đúng 1 số chia hết cho 3.\nDo đó tích chia hết cho cả 2 và 3, tức chia hết cho 6.", answer: "n(n-1)(n+1), luôn chia hết cho 6" },
          { prompt: "Tìm số dư khi chia x¹⁰⁰ cho x²−1 (gợi ý: viết x²=1+(x²−1)).", solution: "Ta có x¹⁰⁰=(x²)⁵⁰. Viết x²=1+(x²-1), nên x¹⁰⁰=(1+(x²-1))⁵⁰.\nKhi khai triển, mọi số hạng chứa (x²-1) đều chia hết cho (x²-1), chỉ còn số hạng không chứa nó là 1⁵⁰=1.\nVậy số dư khi chia x¹⁰⁰ cho x²-1 là 1.", answer: "1" },
          { prompt: "Cho đa thức P(x)=x³+ax²+bx+c chia hết cho (x−1), (x−2), (x−3). Tìm a, b, c.", solution: "Vì P(x) chia hết cho cả 3 nhân tử bậc nhất phân biệt, P(x)=(x-1)(x-2)(x-3).\nKhai triển: (x-1)(x-2)=x²-3x+2. Nhân tiếp (x-3): x³-3x²-3x²+9x+2x-6=x³-6x²+11x-6.\nVậy a=-6, b=11, c=-6." , answer: "a=-6, b=11, c=-6" },
          { prompt: "Tính giá trị của biểu thức x³−3x²+3x−1 tại x=101 (dùng hằng đẳng thức).", solution: "x³-3x²+3x-1 = (x-1)³ (hằng đẳng thức lập phương của hiệu).\nTại x=101: (100)³ = 1.000.000." , answer: "1.000.000" },
          { prompt: "Cho x+y+z=0. Rút gọn biểu thức x³+y³+z³−3xyz.", solution: "Theo hằng đẳng thức, khi x+y+z=0 thì x³+y³+z³=3xyz.\nVậy biểu thức = 3xyz-3xyz = 0." , answer: "0" },
          { prompt: "Tìm x biết: x³−3x²+3x−1 = 8 (dùng hằng đẳng thức lập phương).", solution: "x³-3x²+3x-1 = (x-1)³ = 8 = 2³.\nSuy ra x-1=2 → x=3." , answer: "3" },
          { prompt: "Chứng minh: (a+b+c)² ≥ 3(ab+bc+ca) với mọi số thực a, b, c.", solution: "(a+b+c)²-3(ab+bc+ca) = a²+b²+c²+2ab+2bc+2ca-3ab-3bc-3ca = a²+b²+c²-ab-bc-ca.\n= ½[(a-b)²+(b-c)²+(c-a)²] ≥ 0.\nVậy bất đẳng thức đúng, dấu bằng khi a=b=c." , answer: "Đúng (hiệu bằng ½ tổng 3 bình phương, luôn ≥0)" },
          { prompt: "Rút gọn: (2x−1)(2x+1)(4x²+1)", solution: "(2x-1)(2x+1) = 4x²-1 (hiệu 2 bình phương).\nNhân tiếp: (4x²-1)(4x²+1) = 16x⁴-1." , answer: "16x⁴-1" },
          { prompt: "Chứng minh n³−n chia hết cho 6 với mọi số tự nhiên n.", solution: "n³-n = n(n-1)(n+1), tích của 3 số tự nhiên liên tiếp.\nTrong 3 số liên tiếp luôn có 1 số chia hết cho 2 và 1 số chia hết cho 3, nên tích chia hết cho 6." , answer: "Luôn chia hết cho 6" },
        ],
      },
      {
        id: "hang-dang-thuc-8",
        title: "Hằng đẳng thức đáng nhớ và ứng dụng",
        questions: [
          { prompt: "(a+b)² = ?", options: ["a²+2ab+b²", "a²+b²", "a²-2ab+b²", "a²+ab+b²"], correct: 0, explain: "Bình phương một tổng: a² + 2ab + b²." },
          { prompt: "(a−b)² = ?", options: ["a²-2ab+b²", "a²+2ab+b²", "a²-b²", "a²-ab+b²"], correct: 0, explain: "Bình phương một hiệu: a² - 2ab + b²." },
          { prompt: "a² − b² = ?", options: ["(a-b)(a+b)", "(a-b)²", "(a+b)²", "a²+b²"], correct: 0, explain: "Hiệu hai bình phương bằng tích của hiệu và tổng." },
          { prompt: "(x+2)² tại x=3 bằng?", options: ["25", "11", "9", "13"], correct: 0, explain: "(3+2)² = 5² = 25." },
          { prompt: "a³+b³ phân tích bằng công thức tổng hai lập phương là?", options: ["(a+b)(a²-ab+b²)", "(a+b)(a²+ab+b²)", "(a-b)(a²+ab+b²)", "(a+b)³"], correct: 0, explain: "Công thức tổng hai lập phương: a³+b³ = (a+b)(a²-ab+b²)." },
          { prompt: "Khai triển đầu tiên của (a+b)³ là số hạng nào?", options: ["a³", "3a²b", "3ab²", "b³"], correct: 0, explain: "(a+b)³ = a³+3a²b+3ab²+b³, số hạng đầu là a³." },
        ],
        exercises: [
          { prompt: "Khai triển (2x+3)²", solution: "Áp dụng (a+b)²=a²+2ab+b² với a=2x, b=3:\n(2x)²+2×2x×3+3² = 4x²+12x+9.", answer: "4x²+12x+9" },
          { prompt: "Tính nhanh 98² bằng cách viết 98=100−2.", solution: "98² = (100-2)² = 100²-2×100×2+2² = 10000-400+4 = 9604.", answer: "9604" },
          { prompt: "Phân tích thành nhân tử: x²−9", solution: "Đây là hiệu hai bình phương: x²-9 = x²-3² = (x-3)(x+3).", answer: "(x-3)(x+3)" },
          { prompt: "Khai triển (x−5)²", solution: "Áp dụng (a-b)²=a²-2ab+b²: x²-10x+25.", answer: "a²-2ab+b²: x²-10x+25" },
          { prompt: "Tính nhanh 102² bằng cách viết 102=100+2.", solution: "102² = (100+2)² = 100²+2×100×2+2² = 10000+400+4 = 10404.", answer: "10404" },
          { prompt: "Phân tích thành nhân tử: 4x²−25", solution: "4x²-25 = (2x)²-5² = (2x-5)(2x+5).", answer: "(2x-5)(2x+5)" },
          { prompt: "Khai triển (x+1)³", solution: "Áp dụng (a+b)³=a³+3a²b+3ab²+b³: x³+3x²+3x+1.", answer: "a³+3a²b+3ab²+b³: x³+3x²+3x+1" },
          { prompt: "Tính: (a+2)² − (a−2)²", solution: "Khai triển: (a²+4a+4)-(a²-4a+4) = 8a.", answer: "8a" },
          { prompt: "Phân tích thành nhân tử: x²+6x+9", solution: "Đây là bình phương một tổng: x²+6x+9 = (x+3)².", answer: "(x+3)²" },
          { prompt: "Tính nhanh: 25²−15² (dùng hiệu hai bình phương)", solution: "25²-15² = (25-15)(25+15) = 10×40 = 400.", answer: "400" },
        ],
        advanced: [
          { prompt: "Phân tích thành nhân tử: x⁴+4 (gợi ý: thêm bớt 4x² để tạo hằng đẳng thức hiệu hai bình phương).", solution: "x⁴+4 = x⁴+4x²+4−4x² = (x²+2)²−(2x)² = (x²+2-2x)(x²+2+2x).\nVậy x⁴+4 = (x²-2x+2)(x²+2x+2).", answer: "(x²-2x+2)(x²+2x+2)" },
          { prompt: "Cho a+b+c=0. Chứng minh a³+b³+c³=3abc, áp dụng tính: (a-b)³+(b-c)³+(c-a)³ theo a,b,c (gợi ý: đặt x=a-b,y=b-c,z=c-a).", solution: "Áp dụng hằng đẳng thức a³+b³+c³-3abc=(a+b+c)(a²+b²+c²-ab-bc-ca): khi a+b+c=0, vế phải bằng 0, nên a³+b³+c³=3abc.\nĐặt x=a-b, y=b-c, z=c-a: ta có x+y+z=0 (vì (a-b)+(b-c)+(c-a)=0).\nÁp dụng kết quả trên cho x,y,z: x³+y³+z³=3xyz.\nVậy (a-b)³+(b-c)³+(c-a)³ = 3(a-b)(b-c)(c-a).", answer: "3(a-b)(b-c)(c-a)" },
          { prompt: "Biết a+b+c=0 và abc=6. Tính giá trị của a³+b³+c³.", solution: "Vì a+b+c=0, theo hằng đẳng thức a³+b³+c³-3abc=(a+b+c)(...)=0, nên a³+b³+c³=3abc=3×6=18.", answer: "18" },
          { prompt: "Tính nhanh: 2024²−2023² (dùng hiệu hai bình phương).", solution: "= (2024-2023)(2024+2023) = 1×4047 = 4047." , answer: "4047" },
          { prompt: "Cho x−y=5, xy=6. Tính x²+y² và (x+y)².", solution: "x²+y² = (x-y)²+2xy = 25+12 = 37.\n(x+y)² = (x-y)²+4xy = 25+24 = 49." , answer: "x²+y²=37; (x+y)²=49" },
          { prompt: "Tìm giá trị nhỏ nhất của biểu thức x²−6x+11.", solution: "x²-6x+11 = (x-3)²+2.\nVì (x-3)²≥0 với mọi x, giá trị nhỏ nhất của biểu thức là 2, đạt khi x=3." , answer: "2 (đạt khi x=3)" },
          { prompt: "Phân tích thành nhân tử: x³+3x²+3x+1−y³ (nhận biết phần đầu là (x+1)³).", solution: "x³+3x²+3x+1 = (x+1)³.\nBiểu thức = (x+1)³-y³ = [(x+1)-y][(x+1)²+(x+1)y+y²]." , answer: "[(x+1)-y][(x+1)²+(x+1)y+y²]" },
          { prompt: "Tính: 99,8² (viết 99,8=100−0,2 rồi dùng hằng đẳng thức).", solution: "(100-0,2)² = 100²-2×100×0,2+0,2² = 10000-40+0,04 = 9960,04." , answer: "9960,04" },
          { prompt: "Chứng minh: a⁴+b⁴ ≥ 2a²b² với mọi a, b.", solution: "a⁴+b⁴-2a²b² = (a²-b²)² ≥ 0.\nVậy bất đẳng thức đúng, dấu bằng khi a²=b²." , answer: "Đúng (hiệu bằng (a²-b²)² ≥0)" },
          { prompt: "Phân tích thành nhân tử: x⁴+4 (thêm bớt 4x²).", solution: "x⁴+4 = x⁴+4x²+4-4x² = (x²+2)²-(2x)² = (x²-2x+2)(x²+2x+2)." , answer: "(x²-2x+2)(x²+2x+2)" },
        ],
      },
      {
        id: "tu-giac-8",
        title: "Tứ giác",
        questions: [
          { prompt: "Tổng các góc trong một tứ giác bằng?", options: ["360°", "180°", "270°", "720°"], correct: 0, explain: "Tứ giác chia được thành 2 tam giác, mỗi tam giác 180°, nên tổng là 360°." },
          { prompt: "Hình bình hành có tính chất nào sau đây?", options: ["Các cạnh đối song song và bằng nhau", "Bốn cạnh bằng nhau", "Bốn góc vuông", "Hai đường chéo bằng nhau"], correct: 0, explain: "Đây là tính chất định nghĩa của hình bình hành." },
          { prompt: "Hình chữ nhật là hình bình hành có thêm tính chất gì?", options: ["Có một góc vuông", "Bốn cạnh bằng nhau", "Hai đường chéo vuông góc", "Không có đường chéo bằng nhau"], correct: 0, explain: "Hình bình hành có 1 góc vuông thì tất cả các góc đều vuông, trở thành hình chữ nhật." },
          { prompt: "Hình thoi có tính chất đặc trưng nào?", options: ["Bốn cạnh bằng nhau", "Bốn góc vuông", "Chỉ hai cạnh đối song song", "Không có trục đối xứng"], correct: 0, explain: "Hình thoi là hình bình hành có bốn cạnh bằng nhau." },
          { prompt: "Hình vuông có tính chất của những hình nào?", options: ["Vừa là hình chữ nhật, vừa là hình thoi", "Chỉ là hình chữ nhật", "Chỉ là hình thoi", "Không liên quan đến hình nào"], correct: 0, explain: "Hình vuông có bốn góc vuông (như hình chữ nhật) và bốn cạnh bằng nhau (như hình thoi)." },
          { prompt: "Hình thang cân có tính chất gì đặc trưng?", options: ["Hai cạnh bên bằng nhau", "Bốn cạnh bằng nhau", "Bốn góc vuông", "Hai đường chéo vuông góc"], correct: 0, explain: "Hình thang cân là hình thang có hai cạnh bên bằng nhau." },
        ],
        exercises: [
          { prompt: "Tứ giác ABCD có góc A=80°, góc B=100°, góc C=95°. Tính góc D.", solution: "Tổng bốn góc của tứ giác = 360°.\nGóc D = 360° - 80° - 100° - 95° = 85°.", answer: "85°" },
          { prompt: "Hình bình hành ABCD có AB=5cm, AD=3cm. Tính chu vi.", solution: "Chu vi = 2×(AB+AD) = 2×(5+3) = 16cm.", answer: "16cm" },
          { prompt: "Hình chữ nhật có đường chéo dài 10cm. Nếu một cạnh dài 6cm, tính cạnh còn lại (dùng định lý Pytago).", solution: "Trong hình chữ nhật, đường chéo là cạnh huyền của tam giác vuông tạo bởi 2 cạnh.\ncạnh² = 10² - 6² = 100-36 = 64.\ncạnh = 8cm.", answer: "8cm" },
          { prompt: "Hình thoi có hai đường chéo 8cm và 6cm. Tính diện tích (S=½×d1×d2).", solution: "S = ½×8×6 = 24cm².", answer: "24cm²" },
          { prompt: "Hình bình hành có góc A=70°. Tính góc B (kề với góc A).", solution: "Hai góc kề của hình bình hành bù nhau: góc B = 180°-70° = 110°.", answer: "110°" },
          { prompt: "Hình thang có đáy lớn 14cm, đáy nhỏ 8cm, chiều cao 5cm. Tính diện tích.", solution: "S = (đáy lớn+đáy nhỏ)×cao/2 = (14+8)×5/2 = 55cm².", answer: "55cm²" },
          { prompt: "Hình chữ nhật có chu vi 26cm, chiều dài hơn chiều rộng 3cm. Tìm chiều dài và chiều rộng.", solution: "Nửa chu vi = 13cm, nên dài+rộng=13.\nMặt khác dài-rộng=3.\nGiải ra: dài=8cm, rộng=5cm.", answer: "5cm" },
          { prompt: "Tứ giác có 3 góc lần lượt 90°, 100°, 85°. Tính góc còn lại.", solution: "Tổng 4 góc = 360°.\nGóc còn lại = 360°-90°-100°-85° = 85°.", answer: "85°" },
          { prompt: "Hình thoi có cạnh 5cm, một đường chéo 6cm. Tính đường chéo còn lại (dùng Pytago với nửa đường chéo).", solution: "Nửa đường chéo đã biết = 3cm.\nTheo Pytago: 3²+x² = 5² → x² = 16 → x=4.\nĐường chéo còn lại = 2×4 = 8cm.", answer: "8cm" },
          { prompt: "Hình vuông có đường chéo 10cm. Tính cạnh hình vuông (dùng Pytago: cạnh×√2=đường chéo).", solution: "cạnh = 10/√2 = 5√2 ≈ 7,07cm.", answer: "5√2 ≈ 7,07cm" },
        ],
        advanced: [
          { prompt: "Cho hình chữ nhật ABCD và điểm M bất kỳ. Biết hệ thức MA²+MC²=MB²+MD² luôn đúng. Áp dụng: MA=3cm, MB=4cm, MC=5cm. Tính MD.", solution: "Theo hệ thức đã cho: MD² = MA²+MC²−MB² = 9+25-16 = 18.\nMD = √18 = 3√2 cm.", answer: "3√2 cm" },
          { prompt: "Hình bình hành ABCD có diện tích 48cm², O là giao điểm hai đường chéo. Gọi M, N lần lượt là trung điểm OA, OC. Biết BMDN cũng là hình bình hành có diện tích bằng nửa diện tích ABCD, tính diện tích BMDN.", solution: "Vì O là trung điểm cả hai đường chéo AC và BD (tính chất hình bình hành), và M, N lần lượt là trung điểm OA, OC nên BD và MN cùng bị chia đôi bởi O — do đó BMDN là hình bình hành.\nTheo tính chất cho trước: diện tích BMDN = ½ × diện tích ABCD = ½×48 = 24cm².", answer: "24cm²" },
          { prompt: "Tứ giác ABCD có hai đường chéo AC, BD vuông góc với nhau, AC=8cm, BD=6cm. Tính diện tích tứ giác (dùng công thức tổng quát S=½×d₁×d₂ khi hai đường chéo vuông góc).", solution: "S = ½ × AC × BD = ½ × 8 × 6 = 24cm².", answer: "24cm²" },
          { prompt: "Cho hình bình hành ABCD, M là trung điểm AB. Đường thẳng DM cắt AC tại I. Chứng minh AI=1/3 AC.", solution: "Vì AM=½AB=½DC (M trung điểm AB), trong tam giác ACD, đường thẳng DM cắt AC tại I với tỉ số AI/IC=AM/DC=1/2.\nSuy ra AI/AC = AI/(AI+IC) = 1/(1+2) = 1/3." , answer: "1/3 AC (đã chứng minh)" },
          { prompt: "Hình thang ABCD (AB//CD) có góc A=90°, AB=6cm, CD=10cm, AD=8cm (đường cao). Tính diện tích hình thang.", solution: "S = (AB+CD)×AD/2 = (6+10)×8/2 = 64cm²." , answer: "64cm²" },
          { prompt: "Cho hình vuông ABCD cạnh a. M là trung điểm cạnh BC. Tính độ dài AM theo a.", solution: "AM² = AB²+BM² = a²+(a/2)² = 5a²/4.\nAM = a√5/2." , answer: "a√5/2" },
          { prompt: "Một hình bình hành có hai cạnh kề 6cm và 8cm, góc xen giữa 60°. Tính diện tích (dùng công thức S=ab·sin(góc)).", solution: "S = 6×8×sin60° = 48×(√3/2) = 24√3 cm²." , answer: "24√3 cm²" },
          { prompt: "Tứ giác ABCD có AC⊥BD tại O, AO=3, OC=5, BO=4, OD=6. Tính diện tích tứ giác.", solution: "AC=AO+OC=8. BD=BO+OD=10.\nVì AC⊥BD: S = ½×AC×BD = ½×8×10 = 40cm²." , answer: "40cm²" },
          { prompt: "Hình chữ nhật ABCD có AB=12cm, BC=5cm. Tính độ dài đường chéo AC.", solution: "AC = √(12²+5²) = √(144+25) = √169 = 13cm." , answer: "13cm" },
          { prompt: "Hình bình hành ABCD có diện tích 48cm². Gọi M, N lần lượt là trung điểm OA, OC (O là giao điểm 2 đường chéo). Tính diện tích tứ giác BMDN.", solution: "Vì O là trung điểm cả AC và BD, và M, N là trung điểm OA, OC nên BMDN cũng là hình bình hành có diện tích bằng nửa ABCD.\nDiện tích BMDN = 48/2 = 24cm²." , answer: "24cm²" },
        ],
      },
      {
        id: "dinh-li-thales-8",
        title: "Định lí Thalès",
        questions: [
          { prompt: "Định lí Thalès trong tam giác phát biểu về quan hệ giữa điều gì?", options: ["Đường thẳng song song với một cạnh và các đoạn thẳng tỉ lệ trên hai cạnh còn lại", "Tổng ba góc của tam giác", "Diện tích tam giác", "Chu vi tam giác"], correct: 0, explain: "Định lí Thalès: nếu một đường thẳng song song với một cạnh của tam giác thì nó định ra trên hai cạnh còn lại những đoạn thẳng tương ứng tỉ lệ." },
          { prompt: "Đường trung bình của tam giác là đoạn thẳng nối gì?", options: ["Trung điểm hai cạnh của tam giác", "Một đỉnh với trung điểm cạnh đối diện", "Hai đỉnh bất kỳ", "Trung điểm một cạnh với đỉnh đối diện"], correct: 0, explain: "Đường trung bình nối trung điểm hai cạnh của tam giác." },
          { prompt: "Đường trung bình của tam giác có độ dài bằng bao nhiêu so với cạnh thứ ba?", options: ["Bằng một nửa cạnh thứ ba", "Bằng cạnh thứ ba", "Gấp đôi cạnh thứ ba", "Không liên quan gì đến cạnh thứ ba"], correct: 0, explain: "Đường trung bình song song và có độ dài bằng nửa cạnh thứ ba." },
          { prompt: "Đường phân giác trong của một góc của tam giác chia cạnh đối diện theo tỉ lệ nào?", options: ["Tỉ lệ với hai cạnh kề", "Chia đôi cạnh đối diện luôn", "Không có quy luật", "Tỉ lệ với chu vi tam giác"], correct: 0, explain: "Tính chất đường phân giác: chia cạnh đối diện thành hai đoạn tỉ lệ với hai cạnh kề góc đó." },
          { prompt: "Tam giác ABC có DE song song với BC (D∈AB, E∈AC), AD=2, DB=4, AE=3. Tính EC.", options: ["6", "3", "1,5", "9"], correct: 0, explain: "Theo định lí Thalès: AD/DB = AE/EC, nên 2/4 = 3/EC, suy ra EC = 6." },
          { prompt: "Trong tam giác, đường trung bình song song với cạnh nào?", options: ["Cạnh thứ ba (không đi qua hai trung điểm đó)", "Không song song với cạnh nào", "Vuông góc với cạnh thứ ba", "Trùng với cạnh thứ ba"], correct: 0, explain: "Đường trung bình luôn song song với cạnh thứ ba của tam giác." },
        ],
        exercises: [
          { prompt: "Tam giác ABC có DE // BC (D∈AB, E∈AC), AD=3, DB=6, AC=12. Tính AE.", solution: "Theo Thalès: AD/DB = AE/EC → 3/6 = AE/EC → EC = 2AE.\nVì AE+EC=12, ta có AE+2AE=12 → AE=4.", answer: "4" },
          { prompt: "Đường trung bình MN của tam giác ABC (M, N là trung điểm AB, AC) có BC=16cm. Tính MN.", solution: "Đường trung bình bằng nửa cạnh thứ ba: MN = BC/2 = 16/2 = 8cm.", answer: "8cm" },
          { prompt: "Trong tam giác ABC, đường phân giác AD chia BC theo tỉ lệ DB/DC=AB/AC. Biết AB=6, AC=9, BC=10. Tính DB, DC.", solution: "DB/DC = AB/AC = 6/9 = 2/3.\nVì DB+DC=10, ta có DB=4, DC=6 (chia theo tỉ lệ 2:3).", answer: "6 (chia theo tỉ lệ 2:3)" },
          { prompt: "Tam giác ABC có DE//BC, AD/DB=2/3. Biết AE=4cm, tính EC.", solution: "Theo Thalès: AE/EC = AD/DB = 2/3.\nEC = AE×3/2 = 4×3/2 = 6cm.", answer: "6cm" },
          { prompt: "Đường trung bình của một tam giác có độ dài 7cm. Tính cạnh đáy tương ứng.", solution: "Cạnh đáy = 2×đường trung bình = 2×7 = 14cm.", answer: "14cm" },
          { prompt: "Tam giác ABC có M, N là trung điểm AB, AC. Biết MN=5cm. Tính BC.", solution: "MN là đường trung bình, nên BC = 2×MN = 2×5 = 10cm.", answer: "10cm" },
          { prompt: "Cho hình thang ABCD (AB//CD), hai đường chéo AC và BD cắt nhau tại O. Biết AB=6cm, CD=9cm. Tính tỉ số OA/OC.", solution: "Theo tính chất hình thang: OA/OC = AB/CD = 6/9 = 2/3.", answer: "2/3" },
          { prompt: "Tam giác ABC có DE//BC, AD=4, DB=8, DE=3cm. Tính BC.", solution: "DE/BC = AD/AB = 4/(4+8) = 4/12 = 1/3.\nBC = 3×3 = 9cm.", answer: "9cm" },
          { prompt: "Trong tam giác ABC, đường trung bình MN song song BC. Biết chu vi tam giác AMN=12cm và tỉ số đồng dạng của AMN với ABC là 1/2. Tính chu vi tam giác ABC.", solution: "Vì tỉ số đồng dạng 1/2, chu vi ABC gấp đôi chu vi AMN: 2×12 = 24cm.", answer: "24cm" },
          { prompt: "Tam giác ABC có DE//BC, AD=3cm, AB=9cm, BC=12cm. Tính DE.", solution: "AD/AB = DE/BC (Thalès) → 3/9 = DE/12 → DE = 4cm.", answer: "4cm" },
        ],
        advanced: [
          { prompt: "Hình thang ABCD (AB//CD), hai đường chéo cắt nhau tại O. Biết diện tích tam giác AOB=4cm², diện tích tam giác COD=16cm². Tính diện tích hình thang ABCD.", solution: "Vì AB//CD, tam giác AOB đồng dạng tam giác COD theo tỉ số k=AB/CD. Tỉ số diện tích k²=4/16=1/4 → k=1/2.\nTính chất quen thuộc trong hình thang: diện tích tam giác AOD = diện tích tam giác BOC = √(S_AOB × S_COD) = √(4×16) = 8cm².\nDiện tích hình thang = S_AOB+S_COD+S_AOD+S_BOC = 4+16+8+8 = 36cm².", answer: "36cm²" },
          { prompt: "Tam giác ABC có trọng tâm G. Đường thẳng qua G song song với BC cắt AB, AC lần lượt tại M, N. Tính tỉ số MN/BC.", solution: "Trọng tâm G chia trung tuyến AM' (M' là trung điểm BC) theo tỉ lệ AG/AM'=2/3.\nVì MN//BC và đi qua G, theo định lí Thalès: MN/BC = AG/AM' = 2/3.", answer: "2/3" },
          { prompt: "Tam giác ABC có D, E lần lượt là trung điểm AB, AC. G là trọng tâm tam giác ABC. Tính tỉ số diện tích tam giác GDE với diện tích tam giác ABC.", solution: "DE là đường trung bình nên tam giác ADE đồng dạng ABC theo tỉ số 1/2, diện tích ADE = 1/4 diện tích ABC.\nG cũng đóng vai trò như trọng tâm trong tam giác ADE (vì phép vị tự tỉ số 1/2 tâm A biến ABC thành ADE và biến G thành chính G), nên diện tích GDE = 1/3 diện tích ADE = 1/3×1/4 = 1/12 diện tích ABC.", answer: "1/12" },
          { prompt: "Tam giác ABC, D thuộc AB sao cho AD/AB=1/3. Qua D kẻ đường thẳng song song BC cắt AC tại E. Tính tỉ số diện tích ADE với tứ giác DECB.", solution: "S_ADE/S_ABC=(1/3)²=1/9.\nS_DECB=S_ABC-S_ADE=8/9 S_ABC.\nTỉ số S_ADE:S_DECB = 1/9 : 8/9 = 1:8." , answer: "1:8" },
          { prompt: "Hình thang ABCD (AB//CD), M, N lần lượt là trung điểm AD, BC. Tính MN theo AB, CD.", solution: "MN là đường trung bình của hình thang: MN=(AB+CD)/2." , answer: "MN=(AB+CD)/2" },
          { prompt: "Tam giác ABC có D trên AB, E trên AC sao cho AD=2, DB=3, AE=4. Tìm EC để DE//BC.", solution: "Theo định lí Thalès: AD/DB=AE/EC → 2/3=4/EC → EC=6." , answer: "6" },
          { prompt: "Cho tam giác ABC, đường trung tuyến BM và CN cắt nhau tại trọng tâm G. Biết BM=9cm. Tính BG và GM.", solution: "BG = 2/3×BM = 6cm.\nGM = 1/3×BM = 3cm." , answer: "BG=6cm, GM=3cm" },
          { prompt: "Hình thang ABCD (AB//CD) có AB=8cm, CD=20cm. Gọi E là giao điểm hai đường chéo. Tính tỉ số diện tích tam giác ABE và tam giác CDE.", solution: "Tam giác ABE đồng dạng tam giác CDE (AB//CD) theo tỉ số AB/CD=8/20=2/5.\nTỉ số diện tích = (2/5)² = 4/25." , answer: "4/25" },
          { prompt: "Tam giác ABC có ba đường trung tuyến đồng quy tại trọng tâm G. Biết diện tích ABC=90cm². Tính diện tích tam giác BGC.", solution: "Trọng tâm chia tam giác thành 3 tam giác (AGB, BGC, CGA) có diện tích bằng nhau, mỗi phần = 1/3 diện tích ABC = 30cm²." , answer: "30cm²" },
          { prompt: "Tam giác ABC có D trên AB, D' trên AC sao cho DD'//BC và AD=1/2 DB. Tính tỉ số diện tích ADD' với diện tích ABC.", solution: "AD/AB = 1/3 (vì AD=1/2 DB nghĩa là AD:DB=1:2, nên AD:AB=1:3).\nTỉ số diện tích = (AD/AB)² = 1/9." , answer: "1/9" },
        ],
      },
      {
        id: "du-lieu-bieu-do-8",
        title: "Dữ liệu và biểu đồ",
        questions: [
          { prompt: "Bước đầu tiên khi thu thập dữ liệu là gì?", options: ["Xác định vấn đề cần thống kê", "Vẽ biểu đồ ngay", "Tính trung bình cộng", "Phân loại dữ liệu ngẫu nhiên"], correct: 0, explain: "Cần xác định rõ mục tiêu/vấn đề trước khi tiến hành thu thập dữ liệu." },
          { prompt: "Dữ liệu định tính là loại dữ liệu như thế nào?", options: ["Biểu diễn bằng chữ, không phải là số đo lường", "Chỉ là số đo lường được", "Không thể phân loại", "Luôn là số nguyên"], correct: 0, explain: "Dữ liệu định tính biểu diễn tính chất, không phải số đo lường (ví dụ: màu sắc, tên loại)." },
          { prompt: "Biểu đồ nào phù hợp để biểu diễn tỉ lệ phần trăm giữa các phần của một tổng thể?", options: ["Biểu đồ hình quạt tròn", "Biểu đồ đoạn thẳng", "Bảng số liệu thô", "Không có loại biểu đồ phù hợp"], correct: 0, explain: "Biểu đồ hình quạt tròn thể hiện rõ tỉ lệ phần trăm của từng phần trong tổng thể." },
          { prompt: "Khi phân tích số liệu thống kê dựa vào biểu đồ, ta cần chú ý điều gì đầu tiên?", options: ["Đọc kỹ tiêu đề và chú thích của biểu đồ", "Chỉ nhìn màu sắc", "Bỏ qua trục số liệu", "Chỉ đếm số cột"], correct: 0, explain: "Hiểu đúng tiêu đề và chú thích giúp đọc và phân tích biểu đồ chính xác." },
          { prompt: "Biểu đồ đoạn thẳng phù hợp nhất để thể hiện điều gì?", options: ["Xu hướng thay đổi số liệu theo thời gian", "Tỉ lệ phần trăm cố định", "Chỉ một giá trị duy nhất", "Không thể hiện được gì"], correct: 0, explain: "Biểu đồ đoạn thẳng giúp quan sát xu hướng biến động số liệu qua các mốc thời gian." },
          { prompt: "Một lớp 30 học sinh, biểu đồ hình quạt cho thấy 40% học sinh thích môn Toán. Số học sinh thích Toán là?", options: ["12", "10", "15", "40"], correct: 0, explain: "Số học sinh = 40% × 30 = 0,4×30 = 12." },
        ],
        exercises: [
          { prompt: "Một cửa hàng khảo sát doanh số 4 tháng: T1: 50 triệu, T2: 60 triệu, T3: 45 triệu, T4: 70 triệu. Tháng nào doanh số cao nhất?", solution: "So sánh 4 giá trị, số lớn nhất là 70 triệu, ứng với Tháng 4.", answer: "4." },
          { prompt: "Biểu đồ hình quạt cho biết 30% học sinh thích Toán trong một lớp 40 học sinh. Tính số học sinh thích Toán.", solution: "Số học sinh thích Toán = 40 × 30% = 40×0,3 = 12 học sinh.", answer: "12 học sinh" },
          { prompt: "Tính tổng doanh số 4 tháng ở bài đầu tiên (50, 60, 45, 70 triệu).", solution: "Tổng = 50+60+45+70 = 225 triệu đồng.", answer: "225 triệu đồng" },
          { prompt: "Một lớp 40 học sinh, biểu đồ hình quạt: 20% giỏi, 50% khá, còn lại trung bình. Tính số học sinh trung bình.", solution: "Giỏi = 40×0,2=8. Khá = 40×0,5=20.\nTrung bình = 40-8-20 = 12 học sinh.", answer: "12 học sinh" },
          { prompt: "Bảng số liệu nhiệt độ 5 ngày: 25, 28, 26, 30, 27°C. Tính nhiệt độ trung bình.", solution: "Trung bình = (25+28+26+30+27)/5 = 136/5 = 27,2°C.", answer: "27,2°C" },
          { prompt: "Doanh số 4 quý: Q1: 100tr, Q2: 120tr, Q3: 90tr, Q4: 150tr. Quý nào doanh số thấp nhất?", solution: "So sánh 4 giá trị, số nhỏ nhất là 90 triệu, ứng với Quý 3.", answer: "3." },
          { prompt: "Tính tổng doanh số 4 quý ở bài trên (100, 120, 90, 150 triệu).", solution: "Tổng = 100+120+90+150 = 460 triệu đồng.", answer: "460 triệu đồng" },
          { prompt: "Một cuộc khảo sát 60 người về sở thích đọc sách: 25 người thích tiểu thuyết. Tính tỉ lệ %.", solution: "Tỉ lệ = 25/60 ≈ 0,417 = 41,7%.", answer: "41,7%" },
          { prompt: "Cho bảng số sản phẩm lỗi trong 5 ngày: 2, 3, 1, 4, 0. Tính tổng sản phẩm lỗi trong 5 ngày.", solution: "Tổng = 2+3+1+4+0 = 10 sản phẩm.", answer: "10 sản phẩm" },
          { prompt: "Biểu đồ cột thể hiện số học sinh giỏi qua 3 năm: 20, 25, 30. Năm nào tăng nhiều nhất so với năm trước?", solution: "Năm 2 tăng 25-20=5. Năm 3 tăng 30-25=5. Cả hai năm tăng đều nhau, mỗi năm tăng 5 học sinh.", answer: "5" },
        ],
        advanced: [
          { prompt: "Một lớp có điểm trung bình 6,5. Nếu chuyển điểm của 1 bạn từ 4 thành 9 thì điểm trung bình cả lớp tăng lên 6,7. Hỏi lớp có bao nhiêu học sinh?", solution: "Khi đổi điểm 1 bạn từ 4 thành 9, tổng điểm tăng thêm 9-4=5.\nMức tăng của trung bình = (tổng tăng thêm)/(số học sinh): 5/n = 6,7-6,5 = 0,2 → n=25.", answer: "25 học sinh" },
          { prompt: "Doanh thu một công ty tăng đều mỗi năm theo cùng một số tiền. Năm 2020 doanh thu 500 triệu, năm 2023 doanh thu 800 triệu. Nếu xu hướng tiếp tục, doanh thu năm 2025 là bao nhiêu?", solution: "Từ 2020 đến 2023 (3 năm) tăng 800-500=300 triệu, mỗi năm tăng 100 triệu.\nTừ 2023 đến 2025 là 2 năm, tăng thêm 200 triệu.\nDoanh thu 2025 = 800+200 = 1000 triệu.", answer: "1000 triệu" },
          { prompt: "Trong 30 học sinh, có 18 bạn thích Toán, 15 bạn thích Lý, 8 bạn thích cả hai môn. Hỏi có bao nhiêu bạn không thích môn nào trong hai môn đó?", solution: "Số bạn thích ít nhất một môn (nguyên lý bù trừ) = 18+15-8 = 25.\nSố bạn không thích môn nào = 30-25 = 5.", answer: "5" },
          { prompt: "Doanh số 6 tháng tăng đều theo cấp số cộng. Tháng 1: 50 triệu, tháng 6: 100 triệu. Tính tổng doanh số 6 tháng.", solution: "Tổng cấp số cộng = số hạng × (đầu+cuối)/2 = 6×(50+100)/2 = 6×75 = 450 triệu." , answer: "450 triệu" },
          { prompt: "Một lớp 40 học sinh, 25% đạt giỏi, 45% đạt khá, còn lại đạt trung bình hoặc yếu theo tỉ lệ 3:1. Tính số học sinh yếu.", solution: "Giỏi+khá = 70%. Còn lại = 30% = 12 học sinh.\nTỉ lệ TB:yếu=3:1 (4 phần). Yếu = 12×1/4 = 3 học sinh." , answer: "3 học sinh" },
          { prompt: "Điểm trung bình môn của lớp A (30hs) là 7, lớp B (20hs) là 8. Ghép 2 lớp, tính điểm trung bình chung.", solution: "Tổng điểm = 30×7+20×8 = 210+160 = 370.\nTổng học sinh = 50. Trung bình = 370/50 = 7,4." , answer: "7,4" },
          { prompt: "Khảo sát 500 người có 60% ủng hộ đề xuất A. Sau đó 50 người đổi ý (từ ủng hộ sang không ủng hộ). Tính tỉ lệ ủng hộ mới.", solution: "Ủng hộ ban đầu = 500×60% = 300. Sau đổi ý: 300-50=250.\nTỉ lệ mới = 250/500 = 50%." , answer: "50%" },
          { prompt: "Một lớp có tỉ lệ nam 40%. Nếu thêm 5 học sinh nữ vào lớp thì tỉ lệ nam giảm còn 35%. Tính số học sinh nam.", solution: "Gọi tổng ban đầu T, nam=0,4T. Sau khi thêm 5 nữ: 0,4T/(T+5)=0,35 → 0,4T=0,35T+1,75 → 0,05T=1,75 → T=35.\nSố nam = 0,4×35 = 14." , answer: "14 học sinh" },
          { prompt: "Bảng số liệu 7 số có trung bình 20. Nếu bỏ đi 2 số có tổng 50 thì trung bình 5 số còn lại là bao nhiêu?", solution: "Tổng 7 số = 140. Tổng 5 số còn lại = 140-50 = 90.\nTrung bình = 90/5 = 18." , answer: "18" },
          { prompt: "Một nhóm 20 người có tuổi trung bình 30. Sau khi 1 người 50 tuổi rời nhóm và 1 người 20 tuổi gia nhập, tính tuổi trung bình mới.", solution: "Tổng tuổi ban đầu = 20×30=600. Sau thay đổi: 600-50+20=570.\nSố người vẫn 20. Trung bình mới = 570/20 = 28,5." , answer: "28,5" },
        ],
      },
      {
        id: "phan-thuc-8",
        title: "Phân thức đại số",
        questions: [
          { prompt: "Điều kiện xác định của phân thức 1/(x−2) là?", options: ["x ≠ 2", "x = 2", "x > 2", "x < 2"], correct: 0, explain: "Phân thức xác định khi mẫu khác 0, tức x-2≠0, hay x≠2." },
          { prompt: "Rút gọn phân thức (x²−1)/(x−1) với x≠1", options: ["x + 1", "x − 1", "x² − 1", "1"], correct: 0, explain: "x²-1=(x-1)(x+1), chia cho (x-1) còn lại x+1." },
          { prompt: "(2/x) + (3/x) = ? (x ≠ 0)", options: ["5/x", "6/x²", "5/x²", "6/x"], correct: 0, explain: "Cùng mẫu thì cộng tử: 2/x+3/x=5/x." },
          { prompt: "(x/(x+1)) × ((x+1)/2) = ? (x ≠ −1)", options: ["x/2", "x²/2", "x/(2x+2)", "2/x"], correct: 0, explain: "Nhân tử với tử, mẫu với mẫu rồi rút gọn (x+1): kết quả là x/2." },
          { prompt: "Mẫu thức chung của 1/(2x) và 1/(3x) là?", options: ["6x", "5x", "6x²", "2x+3x"], correct: 0, explain: "BCNN(2,3)=6, nên mẫu chung là 6x." },
          { prompt: "Phân thức nào bằng 0 khi x=3 (với x≠1)?", options: ["(x−3)/(x−1)", "(x−1)/(x−3)", "(x+3)/(x−1)", "1/(x−3)"], correct: 0, explain: "Phân thức bằng 0 khi tử bằng 0: tại x=3, tử x-3=0." },
        ],
        exercises: [
          { prompt: "Rút gọn: (x²−4)/(x−2), với x≠2", solution: "x²-4 = (x-2)(x+2).\n(x-2)(x+2)/(x-2) = x+2.", answer: "x+2" },
          { prompt: "Tính: 3/(x−1) + 2/(x−1), với x≠1", solution: "Cùng mẫu, cộng tử: (3+2)/(x-1) = 5/(x-1).", answer: "5/(x-1)" },
          { prompt: "Tìm điều kiện xác định của phân thức (x+1)/(x²−9)", solution: "Mẫu khác 0: x²-9≠0 → (x-3)(x+3)≠0 → x≠3 và x≠-3.", answer: "x²-9≠0 → (x-3)(x+3)≠0 → x≠3 và x≠-3" },
          { prompt: "Rút gọn: (2x)/(4x²), với x≠0", solution: "Chia cả tử và mẫu cho 2x: (2x)/(4x²) = 1/(2x).", answer: "1/(2x)" },
          { prompt: "Tính: (x/(x−1)) − (1/(x−1)), với x≠1", solution: "Cùng mẫu, trừ tử: (x-1)/(x-1) = 1.", answer: "1" },
          { prompt: "Tìm điều kiện xác định của phân thức: 5/(x²−4)", solution: "Mẫu khác 0: x²-4≠0 → x≠2 và x≠-2.", answer: "Mẫu khác 0: x²-4≠0 → x≠2 và x≠-2" },
          { prompt: "Tính: (3/(x+2)) × ((x+2)/6), với x≠−2", solution: "Rút gọn (x+2): 3/6 = 1/2.", answer: "1/2" },
          { prompt: "Rút gọn: (x²+2x)/x, với x≠0", solution: "x²+2x = x(x+2). Chia cho x: (x+2).", answer: "x(x+2). Chia cho x: (x+2)" },
          { prompt: "Tính: (2/(x−3)) + (1/(3−x)), với x≠3", solution: "Viết 1/(3-x) = -1/(x-3).\n2/(x-3) - 1/(x-3) = 1/(x-3).", answer: "1/(x-3)" },
          { prompt: "Tìm điều kiện xác định của phân thức: (x−1)/(x²+x)", solution: "Mẫu khác 0: x²+x=x(x+1)≠0 → x≠0 và x≠-1.", answer: "x(x+1)≠0 → x≠0 và x≠-1" },
        ],
        advanced: [
          { prompt: "Rút gọn: (x³−1)/(x²+x+1) (gợi ý: dùng hằng đẳng thức hiệu hai lập phương).", solution: "x³-1 = (x-1)(x²+x+1) (hằng đẳng thức hiệu hai lập phương).\nRút gọn (x²+x+1): kết quả = x-1.", answer: "x-1" },
          { prompt: "Tính tổng: 1/(x(x+1)) + 1/((x+1)(x+2)) + 1/((x+2)(x+3)) (gợi ý: mỗi số hạng phân tích thành hiệu 2 phân thức).", solution: "1/(x(x+1)) = 1/x − 1/(x+1). Tương tự cho các số hạng khác.\nTổng = (1/x−1/(x+1))+(1/(x+1)−1/(x+2))+(1/(x+2)−1/(x+3)) = 1/x − 1/(x+3) (các số hạng giữa triệt tiêu).\n= 3/(x(x+3)).", answer: "3/(x(x+3))" },
          { prompt: "Cho x + 1/x = 3. Tính x³ + 1/x³.", solution: "Trước tiên: x²+1/x² = (x+1/x)²−2 = 9−2 = 7.\nSau đó: (x+1/x)(x²+1/x²) = x³+1/x+x+1/x³ = x³+1/x³+(x+1/x).\nSuy ra x³+1/x³ = (x+1/x)(x²+1/x²) − (x+1/x) = 3×7 − 3 = 21−3 = 18.", answer: "18" },
          { prompt: "Rút gọn: (x²−9)/(x²−x−6)", solution: "Tử = (x-3)(x+3). Mẫu = x²-x-6 = (x-3)(x+2).\nRút gọn (x-3): kết quả = (x+3)/(x+2)." , answer: "(x+3)/(x+2)" },
          { prompt: "Tính: (2x+1)/(x−1) − (x+2)/(x−1)", solution: "Cùng mẫu: [(2x+1)-(x+2)]/(x-1) = (x-1)/(x-1) = 1." , answer: "1" },
          { prompt: "Tìm x biết: (x+1)/(x−2) = 3 (x≠2)", solution: "x+1 = 3(x-2) → x+1=3x-6 → 7=2x → x=3,5." , answer: "3,5" },
          { prompt: "Cho a/b=3/4 (b≠0). Tính (a+b)/(a−b) (chia cả tử và mẫu cho b).", solution: "Chia tử mẫu cho b: (a/b+1)/(a/b-1) = (3/4+1)/(3/4-1) = (7/4)/(-1/4) = -7." , answer: "-7" },
          { prompt: "Rút gọn: (x³−8)/(x²−4)", solution: "Tử = (x-2)(x²+2x+4). Mẫu = (x-2)(x+2).\nRút gọn (x-2): kết quả = (x²+2x+4)/(x+2)." , answer: "(x²+2x+4)/(x+2)" },
          { prompt: "Cho x−1/x=2 (x≠0). Tính x²+1/x².", solution: "(x-1/x)² = x²-2+1/x² = 4.\nSuy ra x²+1/x² = 6." , answer: "6" },
          { prompt: "Tính tổng: 1/(x(x+1)) + 1/((x+1)(x+2))", solution: "1/(x(x+1))=1/x-1/(x+1). 1/((x+1)(x+2))=1/(x+1)-1/(x+2).\nTổng = 1/x - 1/(x+2) = 2/(x(x+2))." , answer: "2/(x(x+2))" },
        ],
      },
      {
        id: "pt-ham-so-bac-nhat-8",
        title: "Phương trình bậc nhất và hàm số bậc nhất",
        questions: [
          { prompt: "Giải: 2x + 3 = 11", options: ["x = 4", "x = 3", "x = 7", "x = 5"], correct: 0, explain: "2x = 11-3 = 8, nên x = 4." },
          { prompt: "Giải: 5x − 4 = 2x + 8", options: ["x = 4", "x = 2", "x = 12", "x = 6"], correct: 0, explain: "3x = 12, nên x = 4." },
          { prompt: "Phương trình nào vô nghiệm?", options: ["x + 1 = x + 2", "x + 1 = 2", "2x = 4", "x - 3 = 0"], correct: 0, explain: "Rút gọn x đi hai vế còn 1=2, vô lý nên vô nghiệm." },
          { prompt: "Hàm số y = ax+b (a≠0) gọi là hàm số gì?", options: ["Hàm số bậc nhất", "Hàm số bậc hai", "Hàm hằng", "Hàm số mũ"], correct: 0, explain: "Đây là định nghĩa hàm số bậc nhất, với a là hệ số góc." },
          { prompt: "Hàm số y = 2x+1 đồng biến hay nghịch biến?", options: ["Đồng biến", "Nghịch biến", "Không đổi", "Không xác định"], correct: 0, explain: "Vì hệ số a=2>0 nên hàm số đồng biến." },
          { prompt: "Đồ thị hàm số y = ax+b là một?", options: ["Đường thẳng", "Đường cong", "Parabol", "Đường tròn"], correct: 0, explain: "Đồ thị hàm số bậc nhất luôn là một đường thẳng." },
        ],
        exercises: [
          { prompt: "Giải phương trình: 3(x−2) = 2x+1", solution: "3x-6 = 2x+1.\n3x-2x = 1+6.\nx = 7.", answer: "7" },
          { prompt: "Cho hàm số y = 2x−5. Tìm x khi y=7.", solution: "7 = 2x-5.\n2x = 12.\nx = 6.", answer: "6" },
          { prompt: "Đường thẳng y = ax+3 đi qua điểm (2,7). Tìm a.", solution: "Thay x=2, y=7: 7 = 2a+3.\n2a = 4.\na = 2.", answer: "2" },
          { prompt: "Giải phương trình: x/3 − 2 = 1", solution: "x/3 = 3.\nx = 9.", answer: "9" },
          { prompt: "Cho hàm số y=−3x+6. Tìm giao điểm của đồ thị với trục hoành (y=0).", solution: "0 = -3x+6 → x=2.\nGiao điểm là (2;0).", answer: "Giao điểm là (2;0)" },
          { prompt: "Giải phương trình: 4(x+1) = 2x+10", solution: "4x+4 = 2x+10.\n2x = 6.\nx = 3.", answer: "3" },
          { prompt: "Hai đường thẳng y=2x+1 và y=−x+4 cắt nhau tại điểm nào?", solution: "Giải: 2x+1 = -x+4 → 3x=3 → x=1.\nThay vào: y=2(1)+1=3.\nĐiểm cắt nhau là (1;3).", answer: "Điểm cắt nhau là (1;3)" },
          { prompt: "Hàm số y=(2m−1)x+3 đồng biến khi nào?", solution: "Hàm bậc nhất đồng biến khi hệ số góc dương: 2m-1>0 → m>1/2.", answer: "2m-1>0 → m>1/2" },
          { prompt: "Giải phương trình: 2x − 5 = 3x + 1", solution: "2x-3x = 1+5.\n-x = 6.\nx = -6.", answer: "-6" },
          { prompt: "Tìm giao điểm của hai đường thẳng y=x+2 và y=3x−4.", solution: "x+2 = 3x-4 → 6=2x → x=3.\nThay vào: y=3+2=5.\nĐiểm cắt nhau là (3;5).", answer: "Điểm cắt nhau là (3;5)" },
        ],
        advanced: [
          { prompt: "Giải phương trình: (x−1)/2019 + (x−2)/2018 = (x−3)/2017 + (x−4)/2016 (gợi ý: cộng 1 vào mỗi phân thức).", solution: "Cộng 1 vào mỗi số hạng: (x-1)/2019+1=(x+2018)/2019, tương tự các số hạng khác đều trở thành (x+2018)/mẫu tương ứng.\nPhương trình trở thành: (x+2018)×(1/2019+1/2018−1/2017−1/2016)=0.\nVì hệ số trong ngoặc khác 0, suy ra x+2018=0 → x=-2018.", answer: "-2018" },
          { prompt: "Tìm m để phương trình (2m−1)x+3=0 vô nghiệm.", solution: "Phương trình vô nghiệm khi hệ số của x bằng 0 nhưng hằng số khác 0: 2m-1=0 → m=1/2 (và 3≠0 luôn đúng).", answer: "1/2" },
          { prompt: "Ba đường thẳng y=2x+1, y=−x+4, y=mx−2 đồng quy tại một điểm. Tìm m.", solution: "Tìm giao điểm hai đường đầu: 2x+1=-x+4 → 3x=3 → x=1, y=3. Điểm giao là (1;3).\nĐường thứ ba đi qua điểm này: 3=m(1)-2 → m=5.", answer: "5" },
          { prompt: "Giải phương trình: (x+1)/2 + (x+2)/3 = (x+3)/4 + 1", solution: "Quy đồng mẫu 12: 6(x+1)+4(x+2) = 3(x+3)+12.\n6x+6+4x+8 = 3x+9+12 → 10x+14=3x+21 → 7x=7 → x=1." , answer: "1" },
          { prompt: "Tìm giao điểm chung của 3 đường thẳng y=x+1, y=2x−1, y=−x+5 (kiểm tra có đồng quy không).", solution: "Giao 2 đường đầu: x+1=2x-1 → x=2, y=3.\nKiểm tra điểm (2,3) trên đường thứ 3: -2+5=3 ✓.\nVậy 3 đường đồng quy tại (2;3)." , answer: "(2;3), 3 đường đồng quy" },
          { prompt: "Cho hàm số y=(2m−4)x+3. Tìm m để hàm số nghịch biến.", solution: "Cần hệ số góc âm: 2m-4<0 → m<2." , answer: "m<2" },
          { prompt: "Giải và biện luận theo m: (m²−1)x = m−1", solution: "m²-1=(m-1)(m+1).\nNếu m≠±1: x=(m-1)/[(m-1)(m+1)]=1/(m+1).\nNếu m=1: 0x=0, vô số nghiệm. Nếu m=-1: 0x=-2, vô nghiệm." , answer: "x=1/(m+1) khi m≠±1; vô số nghiệm khi m=1; vô nghiệm khi m=-1" },
          { prompt: "Viết phương trình đường thẳng d đi qua điểm (1,5) và song song với đường thẳng y=3x−1.", solution: "Song song nên hệ số góc bằng 3: y=3x+b.\nQua (1,5): 5=3(1)+b → b=2.\nd: y=3x+2." , answer: "y=3x+2" },
          { prompt: "Tìm k để 3 điểm A(1,2), B(3,6), C(5,k) thẳng hàng.", solution: "Hệ số góc AB = (6-2)/(3-1)=2. Đường thẳng qua A, B: y=2x.\nĐiểm C(5,k) thuộc đường thẳng: k=2×5=10." , answer: "10" },
          { prompt: "Giải phương trình chứa ẩn ở mẫu: 2/(x−1) = 3/(x+2) (x≠1, x≠−2)", solution: "2(x+2) = 3(x-1) → 2x+4 = 3x-3 → x=7 (thỏa điều kiện)." , answer: "7" },
        ],
      },
      {
        id: "xac-suat-bien-co-8",
        title: "Mở đầu về tính xác suất của biến cố",
        questions: [
          { prompt: "Biến cố chắc chắn là biến cố như thế nào?", options: ["Luôn luôn xảy ra", "Không bao giờ xảy ra", "Có thể xảy ra hoặc không", "Không xác định được"], correct: 0, explain: "Biến cố chắc chắn luôn xảy ra trong mọi phép thử." },
          { prompt: "Xác suất của biến cố không thể xảy ra bằng bao nhiêu?", options: ["0", "1", "0,5", "Không xác định"], correct: 0, explain: "Biến cố không thể có xác suất bằng 0." },
          { prompt: "Gieo một con xúc xắc 6 mặt, xác suất ra mặt 6 chấm là?", options: ["1/6", "1/2", "1/3", "1"], correct: 0, explain: "Xúc xắc có 6 kết quả đồng khả năng, xác suất ra mặt 6 chấm là 1/6." },
          { prompt: "Xác suất của một biến cố luôn nằm trong khoảng nào?", options: ["Từ 0 đến 1", "Từ -1 đến 1", "Từ 0 đến 100", "Không giới hạn"], correct: 0, explain: "Xác suất của mọi biến cố luôn thỏa mãn 0 ≤ P ≤ 1." },
          { prompt: "Rút 1 lá bài từ bộ 52 lá, xác suất rút được lá cơ (13 lá) là?", options: ["1/4", "1/13", "1/52", "13/52"], correct: 0, explain: "Xác suất = 13/52 = 1/4." },
          { prompt: "Nếu xác suất của biến cố A là 0,3 thì xác suất biến cố không xảy ra A là?", options: ["0,7", "0,3", "1", "0"], correct: 0, explain: "Xác suất biến cố đối = 1 - P(A) = 1 - 0,3 = 0,7." },
        ],
        exercises: [
          { prompt: "Rút 1 lá bài từ 52 lá, tính xác suất rút được lá hình (J, Q, K — có 12 lá).", solution: "Xác suất = 12/52 = 3/13.", answer: "3/13" },
          { prompt: "Gieo 2 xúc xắc, tính xác suất tổng 2 mặt bằng 7 (biết có 6 cách trong 36 kết quả: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)).", solution: "Xác suất = 6/36 = 1/6.", answer: "1/6" },
          { prompt: "Một hộp có 4 bi trắng, 6 bi đen. Tính xác suất lấy được bi trắng.", solution: "Tổng số bi = 4+6 = 10.\nXác suất = 4/10 = 2/5.", answer: "2/5" },
          { prompt: "Một hộp có 20 quả bóng đánh số 1-20. Tính xác suất lấy được số chia hết cho 5.", solution: "Các số chia hết cho 5: 5,10,15,20 → 4 kết quả.\nXác suất = 4/20 = 1/5.", answer: "1/5" },
          { prompt: "Gieo 1 xúc xắc, tính xác suất ra số lẻ.", solution: "Kết quả thỏa mãn: 1,3,5 → 3 kết quả.\nXác suất = 3/6 = 1/2.", answer: "1/2" },
          { prompt: "Một túi có 3 bi đỏ, 2 bi vàng, 5 bi xanh. Tính xác suất lấy được bi vàng.", solution: "Tổng số bi = 3+2+5 = 10.\nXác suất = 2/10 = 1/5.", answer: "1/5" },
          { prompt: "Rút 1 lá bài từ 52 lá, tính xác suất rút được lá Q (4 lá).", solution: "Xác suất = 4/52 = 1/13.", answer: "1/13" },
          { prompt: "Xác suất của một biến cố có thể nhận giá trị âm không?", solution: "Không. Xác suất của mọi biến cố luôn nằm trong khoảng từ 0 đến 1.", answer: "1." },
          { prompt: "Gieo 2 đồng xu, tính xác suất cả 2 đều ngửa.", solution: "Không gian mẫu 4 kết quả (SS,SN,NS,NN), chỉ 1 kết quả thỏa mãn (NN).\nXác suất = 1/4.", answer: "1/4" },
          { prompt: "Một hộp có 5 bi đỏ, 5 bi xanh. Lấy ngẫu nhiên 1 bi. Tính xác suất lấy được bi đỏ.", solution: "Tổng số bi = 10.\nXác suất = 5/10 = 1/2.", answer: "1/2" },
        ],
        advanced: [
          { prompt: "Gieo đồng thời 2 xúc xắc. Tính xác suất để hiệu (số lớn trừ số nhỏ) giữa hai mặt bằng 2.", solution: "Các cặp (a,b) thỏa |a-b|=2: (1,3),(3,1),(2,4),(4,2),(3,5),(5,3),(4,6),(6,4) → 8 cặp trong 36.\nXác suất = 8/36 = 2/9.", answer: "2/9" },
          { prompt: "Một hộp có 10 thẻ đánh số từ 1 đến 10. Rút ngẫu nhiên 2 thẻ. Tính xác suất để tổng hai số trên thẻ là số nguyên tố.", solution: "Liệt kê các cặp có tổng là số nguyên tố (3,5,7,11,13,17,19):\nTổng=3: 1 cặp. =5: 2 cặp. =7: 3 cặp. =11: 5 cặp. =13: 4 cặp. =17: 2 cặp. =19: 1 cặp.\nTổng cộng = 1+2+3+5+4+2+1 = 18 cặp trong C(10,2)=45.\nXác suất = 18/45 = 2/5.", answer: "2/5" },
          { prompt: "Một lớp có 20 nam, 15 nữ. Chọn ngẫu nhiên 1 ban cán sự gồm 2 người. Tính xác suất ban cán sự có cả nam và nữ.", solution: "Tổng số cách chọn 2 người từ 35: C(35,2)=595.\nSố cách chọn 1 nam và 1 nữ: 20×15=300.\nXác suất = 300/595 = 60/119.", answer: "60/119" },
          { prompt: "Một hộp có 10 sản phẩm trong đó 2 sản phẩm lỗi. Lấy ngẫu nhiên 3 sản phẩm. Tính xác suất cả 3 đều không lỗi.", solution: "Số cách chọn 3 từ 8 sản phẩm tốt: C(8,3)=56. Tổng cách chọn 3 từ 10: C(10,3)=120.\nXác suất = 56/120 = 7/15." , answer: "7/15" },
          { prompt: "Gieo 2 xúc xắc, tính xác suất tích 2 số chấm chia hết cho 5.", solution: "Tích chia hết cho 5 khi có ít nhất 1 mặt là 5: các cặp (5,k) và (k,5) với k=1..6, trừ trùng (5,5) tính 1 lần: 6+6-1=11 cặp.\nXác suất = 11/36." , answer: "11/36" },
          { prompt: "Một lớp 30 học sinh có xác suất chọn ngẫu nhiên 1 bạn là nam bằng 0,6. Nếu thêm 5 bạn nữ vào lớp, tính xác suất mới chọn được nam.", solution: "Số nam = 30×0,6=18 (không đổi). Tổng học sinh mới = 35.\nXác suất mới = 18/35." , answer: "18/35" },
          { prompt: "Một hộp có 3 loại bi theo tỉ lệ 1:2:3 (đỏ:xanh:vàng), tổng 60 viên. Lấy 1 viên, tính xác suất không phải màu đỏ.", solution: "Tổng phần=6. Số bi đỏ=60/6=10. Không đỏ=50.\nXác suất = 50/60 = 5/6." , answer: "5/6" },
          { prompt: "Rút 2 lá bài liên tiếp (không hoàn lại) từ bộ 52 lá. Tính xác suất cả 2 lá đều là lá cơ (13 lá cơ).", solution: "P = (13/52)×(12/51) = 156/2652 = 1/17." , answer: "1/17" },
          { prompt: "Ba xạ thủ bắn độc lập vào 1 mục tiêu với xác suất trúng lần lượt 0,6; 0,7; 0,8. Tính xác suất cả 3 đều trượt.", solution: "P(cả 3 trượt) = 0,4×0,3×0,2 = 0,024." , answer: "0,024" },
          { prompt: "Một hộp có 4 bi đỏ, 6 bi xanh. Lấy liên tiếp 2 bi không hoàn lại, tính xác suất cả 2 bi cùng màu.", solution: "P(2 đỏ) = (4/10)×(3/9) = 12/90.\nP(2 xanh) = (6/10)×(5/9) = 30/90.\nTổng = 42/90 = 7/15." , answer: "7/15" },
        ],
      },
      {
        id: "tam-giac-dong-dang-8",
        title: "Tam giác đồng dạng",
        questions: [
          { prompt: "Hai tam giác đồng dạng là hai tam giác có?", options: ["Các góc tương ứng bằng nhau và các cạnh tương ứng tỉ lệ", "Diện tích bằng nhau", "Chu vi bằng nhau", "Chỉ cần một cặp cạnh bằng nhau"], correct: 0, explain: "Định nghĩa tam giác đồng dạng: góc tương ứng bằng nhau, cạnh tương ứng tỉ lệ." },
          { prompt: "Trường hợp đồng dạng góc-góc (g.g) của hai tam giác yêu cầu điều gì?", options: ["Hai góc tương ứng bằng nhau", "Ba cạnh tỉ lệ", "Một cạnh bằng nhau", "Diện tích bằng nhau"], correct: 0, explain: "Nếu hai góc của tam giác này lần lượt bằng hai góc của tam giác kia thì hai tam giác đồng dạng." },
          { prompt: "Tam giác ABC đồng dạng tam giác A'B'C' theo tỉ số k=2. Nếu AB=3 thì A'B' bằng?", options: ["6", "1,5", "3", "9"], correct: 0, explain: "A'B' = k×AB = 2×3 = 6." },
          { prompt: "Tỉ số diện tích của hai tam giác đồng dạng bằng?", options: ["Bình phương tỉ số đồng dạng", "Tỉ số đồng dạng", "Hai lần tỉ số đồng dạng", "Không liên quan đến tỉ số đồng dạng"], correct: 0, explain: "Tỉ số diện tích hai tam giác đồng dạng bằng bình phương tỉ số đồng dạng." },
          { prompt: "Trường hợp đồng dạng cạnh-góc-cạnh (c.g.c) yêu cầu điều gì?", options: ["Hai cạnh tương ứng tỉ lệ và góc xen giữa bằng nhau", "Ba cạnh tương ứng tỉ lệ", "Ba góc bằng nhau", "Chỉ cần một cạnh tỉ lệ"], correct: 0, explain: "Trường hợp c.g.c: hai cặp cạnh tương ứng tỉ lệ và góc xen giữa hai cạnh đó bằng nhau." },
          { prompt: "Nếu tam giác ABC đồng dạng tam giác DEF theo tỉ số k thì chu vi tam giác ABC so với DEF như thế nào?", options: ["Gấp k lần", "Bằng nhau", "Gấp k² lần", "Không liên quan"], correct: 0, explain: "Tỉ số chu vi của hai tam giác đồng dạng bằng đúng tỉ số đồng dạng k." },
        ],
        exercises: [
          { prompt: "Tam giác ABC đồng dạng tam giác A'B'C' theo tỉ số k=3. Biết AB=4cm, tính A'B'.", solution: "A'B' = k×AB = 3×4 = 12cm.", answer: "12cm" },
          { prompt: "Hai tam giác đồng dạng có tỉ số đồng dạng k=2. Tỉ số diện tích của chúng là bao nhiêu?", solution: "Tỉ số diện tích bằng bình phương tỉ số đồng dạng: k² = 2² = 4.", answer: "4" },
          { prompt: "Tam giác ABC có góc A=góc D, góc B=góc E (so với tam giác DEF). Hai tam giác này đồng dạng theo trường hợp nào?", solution: "Hai cặp góc tương ứng bằng nhau, đây là trường hợp đồng dạng góc-góc (g.g).", answer: "Hai cặp góc tương ứng bằng nhau, đây là trường hợp đồng dạng góc-góc (g.g)" },
          { prompt: "Tam giác ABC đồng dạng DEF theo tỉ số k=1/2. Biết AB=10cm. Tính DE.", solution: "DE = k×AB = 1/2×10 = 5cm.", answer: "5cm" },
          { prompt: "Hai tam giác đồng dạng có tỉ số k=3. Tỉ số chu vi bằng bao nhiêu?", solution: "Tỉ số chu vi của hai tam giác đồng dạng bằng đúng tỉ số đồng dạng: k=3.", answer: "3" },
          { prompt: "Cho tam giác ABC~DEF, biết AB/DE=2, diện tích DEF=20cm². Tính diện tích ABC.", solution: "Tỉ số diện tích = k² = 2² = 4.\nDiện tích ABC = 4×20 = 80cm².", answer: "80cm²" },
          { prompt: "Tam giác vuông ABC có đường cao AH. Biết ABC đồng dạng với HBA, AB=6cm, BH=4cm. Tính BC (biết BH×BC=AB²).", solution: "BC = AB²/BH = 36/4 = 9cm.", answer: "9cm" },
          { prompt: "Hai tam giác có 3 cặp cạnh tỉ lệ tương ứng bằng nhau. Đây là trường hợp đồng dạng nào?", solution: "Đây là trường hợp đồng dạng cạnh-cạnh-cạnh (c.c.c).", answer: "Đây là trường hợp đồng dạng cạnh-cạnh-cạnh (c.c.c)" },
          { prompt: "Cho 2 tam giác đồng dạng, chu vi lần lượt là 18cm và 27cm. Tính tỉ số đồng dạng.", solution: "Tỉ số đồng dạng = 18/27 = 2/3.", answer: "2/3" },
          { prompt: "Tam giác ABC~A'B'C' theo tỉ số k=2/5. Biết AC=10cm. Tính A'C'.", solution: "A'C' = k×AC = 2/5×10 = 4cm.", answer: "4cm" },
        ],
        advanced: [
          { prompt: "Tam giác ABC vuông tại A, đường cao AH. Biết AB=6cm, AH=4,8cm. Tính AC.", solution: "Từ Pytago trong tam giác vuông ABH: BH=√(AB²-AH²)=√(36-23,04)=√12,96=3,6cm.\nTam giác ABH đồng dạng CBA (góc B chung, góc vuông): AH/CA=BH/AB.\nCA = AH×AB/BH = 4,8×6/3,6 = 8cm.", answer: "8cm" },
          { prompt: "Hai tam giác đồng dạng có tỉ số chu vi 3:5. Biết hiệu diện tích hai tam giác là 32cm². Tính diện tích mỗi tam giác.", solution: "Tỉ số đồng dạng = 3:5, tỉ số diện tích = 9:25.\nĐặt diện tích tam giác nhỏ = 9k, lớn = 25k. Hiệu = 25k-9k=16k=32 → k=2.\nDiện tích nhỏ = 18cm², diện tích lớn = 50cm².", answer: "18cm² và 50cm²" },
          { prompt: "Tam giác ABC, D thuộc AB, E thuộc AC sao cho DE//BC. Biết diện tích tam giác ADE bằng 1/4 diện tích tứ giác DECB. Tính tỉ số AD/AB.", solution: "S_ADE + S_DECB = S_ABC. Nếu S_ADE=1/4×S_DECB thì S_DECB=4×S_ADE, nên S_ABC=S_ADE+4S_ADE=5S_ADE.\nTỉ số S_ADE/S_ABC=1/5. Vì ADE đồng dạng ABC, tỉ số diện tích bằng bình phương tỉ số đồng dạng: (AD/AB)²=1/5.\nAD/AB = 1/√5 = √5/5.", answer: "√5/5" },
          { prompt: "Tam giác ABC vuông tại A có AH là đường cao (H trên BC). Biết AB=9cm, AC=12cm. Tính AH.", solution: "BC = √(9²+12²) = √225 = 15cm.\nAH = (AB×AC)/BC = (9×12)/15 = 7,2cm." , answer: "7,2cm" },
          { prompt: "Hai tam giác đồng dạng có tỉ số đồng dạng k=2/3. Tam giác nhỏ có chu vi 24cm. Tính chu vi tam giác lớn.", solution: "Chu vi tam giác lớn = chu vi tam giác nhỏ / k = 24/(2/3) = 36cm." , answer: "36cm" },
          { prompt: "Tam giác ABC có D, E lần lượt trên AB, AC sao cho AD/AB=AE/AC=3/5. Biết chu vi tam giác ABC=40cm. Tính chu vi tam giác ADE.", solution: "Tam giác ADE đồng dạng ABC theo tỉ số 3/5.\nChu vi ADE = 40×3/5 = 24cm." , answer: "24cm" },
          { prompt: "Cho tam giác ABC~A'B'C' với tỉ số k, biết diện tích ABC gấp 4 lần diện tích A'B'C'. Tìm k.", solution: "Tỉ số diện tích = k² = 4 → k=2 (tam giác ABC có kích thước gấp đôi A'B'C')." , answer: "2" },
          { prompt: "Tam giác ABC vuông tại A, đường cao AH chia cạnh huyền BC thành BH=4cm, HC=9cm. Tính diện tích tam giác ABC.", solution: "AH² = BH×HC = 36 → AH=6cm. BC=BH+HC=13cm.\nDiện tích = ½×BC×AH = ½×13×6 = 39cm²." , answer: "39cm²" },
          { prompt: "Hai tam giác đồng dạng có một cặp cạnh tương ứng là 6cm và 9cm. Biết diện tích tam giác lớn là 45cm². Tính diện tích tam giác nhỏ.", solution: "Tỉ số đồng dạng = 6/9 = 2/3. Tỉ số diện tích = (2/3)² = 4/9.\nDiện tích nhỏ = 45×4/9 = 20cm²." , answer: "20cm²" },
          { prompt: "Tam giác ABC vuông tại A, đường cao AH, BH=3,6cm, BC=10cm. Tính AB.", solution: "Tam giác ABH đồng dạng CBA: AB²=BH×BC=3,6×10=36 → AB=6cm." , answer: "6cm" },
        ],
      },
    ],
    examSources: [
      { label: "Toán THCS (lớp 8) – chuyên mục trên TOANMATH.com", url: "https://thcs.toanmath.com/" },
    ],
  },
  {
    id: 9,
    label: "Lớp 9",
    topics: [
      {
        id: "he-pt-9",
        title: "Phương trình và hệ hai phương trình bậc nhất hai ẩn",
        questions: [
          { prompt: "Giải hệ: x+y=5; x−y=1", options: ["x=3, y=2", "x=2, y=3", "x=1, y=4", "x=4, y=1"], correct: 0, explain: "Cộng hai phương trình: 2x=6, x=3, thay vào được y=2." },
          { prompt: "Hệ phương trình 2x+y=4; x=1 có nghiệm?", options: ["x=1, y=2", "x=1, y=3", "x=2, y=0", "x=0, y=4"], correct: 0, explain: "Thay x=1 vào 2x+y=4: 2+y=4, nên y=2." },
          { prompt: "Hệ phương trình nào sau đây vô nghiệm?", options: ["x+y=1 và x+y=2", "x+y=1 và x−y=1", "2x+y=3 và x=1", "x=2 và y=3"], correct: 0, explain: "Hai phương trình cùng vế trái nhưng khác vế phải (1≠2) nên vô nghiệm." },
          { prompt: "Hệ hai phương trình bậc nhất hai ẩn có vô số nghiệm khi nào?", options: ["Hai phương trình biểu diễn cùng một đường thẳng", "Hai đường thẳng song song", "Hai đường thẳng cắt nhau", "Không bao giờ xảy ra"], correct: 0, explain: "Khi hai phương trình tương đương nhau (cùng một đường thẳng), mọi điểm trên đường đó đều là nghiệm." },
          { prompt: "Giải hệ: 3x−y=5; x+y=3", options: ["x=2, y=1", "x=1, y=2", "x=3, y=0", "x=0, y=3"], correct: 0, explain: "Cộng hai phương trình: 4x=8, x=2, thay vào x+y=3 được y=1." },
          { prompt: "Phương pháp nào thường dùng để giải hệ phương trình bậc nhất hai ẩn?", options: ["Thế hoặc cộng đại số", "Chỉ vẽ đồ thị", "Không có phương pháp nào", "Dùng định lý Pytago"], correct: 0, explain: "Hai phương pháp cơ bản để giải hệ phương trình là phương pháp thế và phương pháp cộng đại số." },
        ],
        exercises: [
          { prompt: "Giải hệ: 2x+3y=12; x−y=1", solution: "Từ pt2: x = y+1.\nThay vào pt1: 2(y+1)+3y=12 → 5y=10 → y=2.\nSuy ra x=3.", answer: "3" },
          { prompt: "Hai số có tổng 20 và hiệu 4. Tìm hai số đó.", solution: "Gọi hai số x, y: x+y=20, x-y=4.\nCộng hai phương trình: 2x=24 → x=12.\nSuy ra y=8.", answer: "8" },
          { prompt: "Giải hệ: x+2y=7; 3x−y=7", solution: "Từ pt1: x=7-2y.\nThay vào pt2: 3(7-2y)-y=7 → 21-7y=7 → y=2.\nSuy ra x=3.", answer: "3" },
          { prompt: "Giải hệ: 2x+y=7; x−y=2", solution: "Cộng hai phương trình: 3x=9 → x=3.\nThay vào x-y=2: y=1.", answer: "1" },
          { prompt: "Hai số có tổng 15, hiệu 3. Tìm hai số đó.", solution: "Gọi hai số x, y: x+y=15, x-y=3.\nCộng hai phương trình: 2x=18 → x=9.\nSuy ra y=6.", answer: "6" },
          { prompt: "Giải hệ: 3x+2y=16; x=2", solution: "Thay x=2 vào pt1: 3(2)+2y=16 → 2y=10 → y=5.", answer: "5" },
          { prompt: "Giải hệ: 4x−y=5; 2x+y=7", solution: "Cộng hai phương trình: 6x=12 → x=2.\nThay vào: y=7-2(2)=3.", answer: "3" },
          { prompt: "Một khu vườn hình chữ nhật có chu vi 60m. Chiều dài hơn chiều rộng 6m. Tìm chiều dài, chiều rộng.", solution: "2×(dài+rộng)=60 → dài+rộng=30.\nMặt khác dài-rộng=6.\nGiải ra: dài=18m, rộng=12m.", answer: "12m" },
          { prompt: "Giải hệ: x+2y=5; 2x+4y=10", solution: "Nhận thấy pt2 = 2×pt1, nên hai phương trình tương đương.\nHệ có vô số nghiệm (mọi (x,y) thỏa x+2y=5).", answer: "5)" },
          { prompt: "Hai số có tổng 24, một số gấp đôi số kia. Tìm hai số đó.", solution: "Gọi số nhỏ là x, số lớn là 2x. x+2x=24 → 3x=24 → x=8.\nHai số cần tìm là 8 và 16.", answer: "Hai số cần tìm là 8 và 16" },
        ],
        advanced: [
          { prompt: "Tìm hai số biết hiệu của chúng là 12, và ba lần số thứ nhất cộng hai lần số thứ hai bằng 61.", solution: "Gọi số thứ nhất là x, số thứ hai là y: x-y=12, 3x+2y=61.\nTừ pt1: x=y+12. Thay vào pt2: 3(y+12)+2y=61 → 5y+36=61 → 5y=25 → y=5, x=17.", answer: "17 và 5" },
          { prompt: "Một hình chữ nhật có chu vi 64cm. Nếu tăng một cạnh thêm 4cm và giảm cạnh kia đi 4cm thì diện tích không đổi. Tính hai kích thước ban đầu.", solution: "Gọi hai cạnh là a, b: a+b=32.\n(a+4)(b-4)=ab → ab-4a+4b-16=ab → -4a+4b=16 → b-a=4.\nKết hợp a+b=32, b-a=4: b=18, a=14.", answer: "14cm và 18cm" },
          { prompt: "Hai vòi nước cùng chảy vào bể thì sau 4 giờ đầy bể. Nếu chảy riêng, vòi 1 nhanh hơn vòi 2 đúng 6 giờ. Hỏi mỗi vòi chảy riêng mất bao lâu để đầy bể?", solution: "Gọi thời gian vòi 1 chảy riêng là x giờ, vòi 2 là x+6 giờ.\nNăng suất cộng lại: 1/x + 1/(x+6) = 1/4.\nQuy đồng: 4(2x+6)=x(x+6) → 8x+24=x²+6x → x²-2x-24=0 → (x-6)(x+4)=0 → x=6 (loại x=-4).\nVòi 1 mất 6 giờ, vòi 2 mất 12 giờ.", answer: "vòi 1: 6 giờ, vòi 2: 12 giờ" },
          { prompt: "Giải hệ: 2x+3y=7; x−y=1", solution: "Từ pt2: x=y+1. Thay vào pt1: 2(y+1)+3y=7 → 5y+2=7 → y=1, x=2." , answer: "x=2, y=1" },
          { prompt: "Tìm m để hệ: x+my=2; mx+4y=5 vô nghiệm.", solution: "Hệ vô nghiệm khi 1/m=m/4 nhưng khác 2/5.\nTừ 1/m=m/4: m²=4 → m=±2. Kiểm tra tỉ số hằng số 2/5 khác 1/2 (với m=2) và khác -1/2 (với m=-2), cả 2 đều thỏa.\nVậy m=2 hoặc m=-2." , answer: "m=2 hoặc m=-2" },
          { prompt: "Một số có 2 chữ số. Đổi chỗ 2 chữ số được số mới hơn số cũ 27 đơn vị, biết tổng 2 chữ số là 13. Tìm số đó.", solution: "Gọi chữ số hàng chục là a, hàng đơn vị là b: a+b=13.\nSố mới − số cũ: (10b+a)-(10a+b)=9(b-a)=27 → b-a=3.\nKết hợp a+b=13: b=8, a=5. Số cần tìm là 58." , answer: "58" },
          { prompt: "Tìm a, b để đường thẳng y=ax+b đi qua 2 điểm (1,3) và (−2,−3).", solution: "Thay (1,3): a+b=3. Thay (-2,-3): -2a+b=-3.\nTrừ hai phương trình: 3a=6 → a=2, b=1." , answer: "a=2, b=1" },
          { prompt: "Tuổi cha hiện nay gấp 3 lần tuổi con. 5 năm nữa, tuổi cha chỉ còn gấp 2 lần tuổi con. Tính tuổi hiện nay của mỗi người.", solution: "Gọi tuổi con hiện nay là x, tuổi cha là 3x.\n5 năm nữa: 3x+5=2(x+5) → 3x+5=2x+10 → x=5.\nCon 5 tuổi, cha 15 tuổi." , answer: "con 5 tuổi, cha 15 tuổi" },
          { prompt: "Giải hệ: 1/x+1/y=1/2; 1/x−1/y=1/6 (đặt ẩn phụ u=1/x, v=1/y).", solution: "Đặt u=1/x, v=1/y: u+v=1/2, u-v=1/6.\nCộng: 2u=2/3 → u=1/3 → x=3.\nv=1/2-1/3=1/6 → y=6." , answer: "x=3, y=6" },
          { prompt: "Hai công nhân cùng làm chung 1 việc trong 6 giờ thì xong. Nếu chỉ người 1 làm thì lâu hơn người 2 làm một mình 5 giờ. Tính thời gian mỗi người làm riêng.", solution: "Gọi thời gian người 2 làm riêng là x giờ, người 1 là x+5 giờ.\n1/x + 1/(x+5) = 1/6 → 6(2x+5)=x(x+5) → 12x+30=x²+5x → x²-7x-30=0 → (x-10)(x+3)=0 → x=10.\nNgười 2: 10 giờ, người 1: 15 giờ." , answer: "người 1: 15 giờ, người 2: 10 giờ" },
        ],
      },
      {
        id: "pt-bpt-bac-nhat-mot-an-9",
        title: "Phương trình và bất phương trình bậc nhất một ẩn",
        questions: [
          { prompt: "Giải phương trình: 2(x−1) = 3x+4", options: ["x = -6", "x = 6", "x = -2", "x = 2"], correct: 0, explain: "2x-2=3x+4 → -2-4=3x-2x → x=-6." },
          { prompt: "Bất đẳng thức nào sau đây đúng?", options: ["3 < 5", "5 < 3", "-2 > 0", "0 > 1"], correct: 0, explain: "3 nhỏ hơn 5 là khẳng định đúng." },
          { prompt: "Nếu a<b thì a+c so với b+c như thế nào?", options: ["a+c < b+c", "a+c > b+c", "a+c = b+c", "Không xác định"], correct: 0, explain: "Cộng cùng một số vào hai vế bất đẳng thức không đổi chiều." },
          { prompt: "Nếu a<b và c<0 thì ac so với bc như thế nào?", options: ["ac > bc", "ac < bc", "ac = bc", "Không xác định"], correct: 0, explain: "Nhân hai vế bất đẳng thức với số âm thì đổi chiều bất đẳng thức." },
          { prompt: "Giải bất phương trình: 2x−3 > 5", options: ["x > 4", "x < 4", "x > 1", "x < 1"], correct: 0, explain: "2x > 8, nên x > 4." },
          { prompt: "Nghiệm của bất phương trình x+2 ≤ 0 là?", options: ["x ≤ -2", "x ≥ -2", "x ≤ 2", "x ≥ 2"], correct: 0, explain: "x ≤ 0-2 = -2." },
        ],
        exercises: [
          { prompt: "Giải phương trình: 5x−3 = 2x+9", solution: "5x-2x = 9+3.\n3x = 12.\nx = 4.", answer: "4" },
          { prompt: "Giải bất phương trình: 3x+5 ≤ 2x+10", solution: "3x-2x ≤ 10-5.\nx ≤ 5.", answer: "x ≤ 5" },
          { prompt: "Giải phương trình: 2(x−3)−5 = x+1", solution: "2x-6-5 = x+1.\n2x-11 = x+1.\nx = 12.", answer: "12" },
          { prompt: "Giải phương trình: 4x+7 = 3x−2", solution: "4x-3x = -2-7.\nx = -9.", answer: "-9" },
          { prompt: "Giải bất phương trình: 4−2x ≥ 0", solution: "-2x ≥ -4.\nx ≤ 2 (chia cả hai vế cho số âm thì đổi chiều).", answer: "2" },
          { prompt: "Giải phương trình: (x+3)/2 = x−1", solution: "x+3 = 2(x-1).\nx+3 = 2x-2.\nx = 5.", answer: "5" },
          { prompt: "Giải bất phương trình: 5x−1 < 3x+7", solution: "5x-3x < 7+1.\n2x < 8.\nx < 4.", answer: "x < 4" },
          { prompt: "Tìm x nguyên dương thỏa mãn: 2x−3 < 7", solution: "2x < 10 → x < 5.\nx nguyên dương thỏa mãn: 1, 2, 3, 4.", answer: "x nguyên dương thỏa mãn: 1, 2, 3, 4" },
          { prompt: "Giải phương trình: 3(2x−1) = 5x+1", solution: "6x-3 = 5x+1.\nx = 4.", answer: "4" },
          { prompt: "Giải bất phương trình: −3x+6 > 0", solution: "-3x > -6.\nx < 2 (chia cho số âm thì đổi chiều).", answer: "x < 2 (chia cho số âm thì đổi chiều)" },
        ],
        advanced: [
          { prompt: "Giải phương trình: |2x−1| = |x+4|", solution: "Trường hợp 1: 2x-1=x+4 → x=5.\nTrường hợp 2: 2x-1=-(x+4) → 2x-1=-x-4 → 3x=-3 → x=-1.\nVậy x=5 hoặc x=-1.", answer: "x=5 hoặc x=-1" },
          { prompt: "Giải và biện luận phương trình: mx − 2 = x + m theo tham số m.", solution: "mx-x = m+2 → x(m-1) = m+2.\nNếu m≠1: x=(m+2)/(m-1).\nNếu m=1: phương trình trở thành 0=3, vô nghiệm.", answer: "x=(m+2)/(m-1) khi m≠1; vô nghiệm khi m=1" },
          { prompt: "Tìm m để bất phương trình (m−2)x > 3 có tập nghiệm x < 3/(m−2). Với m=0, giải cụ thể bất phương trình.", solution: "Khi chia hai vế cho (m-2), bất đẳng thức đổi chiều nếu (m-2) âm, tức cần m<2.\nVới m=0: (0-2)x>3 → -2x>3 → x<-3/2 (chia cho số âm nên đổi chiều).", answer: "m<2; với m=0: x<-3/2" },
          { prompt: "Giải phương trình: (2x−1)/3 − (x+1)/2 = 1", solution: "Quy đồng mẫu 6: 2(2x-1)-3(x+1)=6.\n4x-2-3x-3=6 → x-5=6 → x=11." , answer: "11" },
          { prompt: "Tìm x nguyên thỏa: −2≤2x−3<5.", solution: "-2≤2x-3: 2x≥1 → x≥0,5.\n2x-3<5: 2x<8 → x<4.\nVậy 0,5≤x<4, x nguyên: 1, 2, 3." , answer: "1, 2, 3" },
          { prompt: "Giải phương trình: |x+2| = 3x−6 (chú ý điều kiện vế phải không âm).", solution: "Cần 3x-6≥0 → x≥2.\nTH1: x+2=3x-6 → x=4 (thỏa x≥2).\nTH2: -(x+2)=3x-6 → -x-2=3x-6 → x=1 (không thỏa x≥2, loại).\nVậy x=4." , answer: "4" },
          { prompt: "Tìm m để phương trình 2x−m=x+3 có nghiệm dương.", solution: "Giải: x=m+3. Cần x>0: m+3>0 → m>-3." , answer: "m>-3" },
          { prompt: "Giải bất phương trình: (x−1)/2 − (x−2)/3 ≤ 1", solution: "Quy đồng mẫu 6: 3(x-1)-2(x-2)≤6.\n3x-3-2x+4≤6 → x+1≤6 → x≤5." , answer: "x≤5" },
          { prompt: "Một người mua vở: nếu mua 5 quyển thì còn dư 5.000đ, nếu mua 6 quyển thì thiếu 3.000đ. Tính giá 1 quyển vở.", solution: "Gọi giá 1 quyển vở là x: số tiền có = 5x+5000 = 6x-3000.\n8000=x → giá vở = 8.000đ." , answer: "8.000đ" },
          { prompt: "Giải phương trình: |3x−2| = |2x+5|", solution: "TH1: 3x-2=2x+5 → x=7.\nTH2: 3x-2=-(2x+5) → 5x=-3 → x=-3/5.\nVậy x=7 hoặc x=-3/5." , answer: "x=7 hoặc x=-3/5" },
        ],
      },
      {
        id: "can-bac-hai-ba-9",
        title: "Căn bậc hai và căn bậc ba",
        questions: [
          { prompt: "√36 = ?", options: ["6", "18", "3", "36"], correct: 0, explain: "6² = 36 nên √36 = 6." },
          { prompt: "Căn bậc ba của 27 là?", options: ["3", "9", "27", "-3"], correct: 0, explain: "3³ = 27 nên căn bậc ba của 27 là 3." },
          { prompt: "√a × √b = ? (với a, b ≥ 0)", options: ["√(ab)", "a × b", "√a + √b", "√(a+b)"], correct: 0, explain: "Quy tắc khai căn với phép nhân: √a×√b = √(ab)." },
          { prompt: "√(a/b) = ? (với a≥0, b>0)", options: ["√a / √b", "a / √b", "√a / b", "a / b"], correct: 0, explain: "Quy tắc khai căn với phép chia: √(a/b) = √a/√b." },
          { prompt: "√48 rút gọn về dạng đơn giản nhất là?", options: ["4√3", "2√12", "3√16", "6√8"], correct: 0, explain: "48 = 16×3, nên √48 = √16×√3 = 4√3 — đây là dạng đơn giản nhất." },
          { prompt: "Căn bậc ba của −8 là?", options: ["-2", "2", "-4", "4"], correct: 0, explain: "(-2)³ = -8 nên căn bậc ba của -8 là -2." },
        ],
        exercises: [
          { prompt: "Tính: √50 − √18 (rút gọn về dạng a√2)", solution: "√50 = √(25×2) = 5√2.\n√18 = √(9×2) = 3√2.\n5√2 - 3√2 = 2√2.", answer: "2√2" },
          { prompt: "Tính căn bậc ba của 125.", solution: "5³ = 125, nên căn bậc ba của 125 là 5.", answer: "125, nên căn bậc ba của 125 là 5" },
          { prompt: "Rút gọn: √12 × √3", solution: "√12 × √3 = √(12×3) = √36 = 6.", answer: "6" },
          { prompt: "Tính: √8 × √2", solution: "√8×√2 = √16 = 4.", answer: "4" },
          { prompt: "Rút gọn: √75", solution: "75=25×3. √75 = √25×√3 = 5√3.", answer: "5√3" },
          { prompt: "Tính: (√3+1)²", solution: "(√3)²+2×√3×1+1² = 3+2√3+1 = 4+2√3.", answer: "4+2√3" },
          { prompt: "So sánh 3√2 và 4.", solution: "3√2 ≈ 3×1,414 = 4,24.\nVì 4,24 > 4 nên 3√2 > 4.", answer: "Vì 4,24 > 4 nên 3√2 > 4" },
          { prompt: "Tính căn bậc ba của −27.", solution: "(-3)³ = -27, nên căn bậc ba của -27 là -3.", answer: "-27, nên căn bậc ba của -27 là -3" },
          { prompt: "Tính: √32 / √2", solution: "√32/√2 = √(32/2) = √16 = 4.", answer: "4" },
          { prompt: "Rút gọn: √20 + √45", solution: "√20=2√5, √45=3√5.\nTổng = 2√5+3√5 = 5√5.", answer: "5√5" },
        ],
        advanced: [
          { prompt: "Rút gọn: √(7+4√3) (gợi ý: 7+4√3 là bình phương của một biểu thức dạng a+b√3).", solution: "7+4√3 = 4+4√3+3 = 2²+2×2×√3+(√3)² = (2+√3)².\nVậy √(7+4√3) = 2+√3 (vì 2+√3>0).", answer: "2+√3" },
          { prompt: "Tính: (√5−2)(√5+2) + (√3−1)²", solution: "(√5-2)(√5+2) = 5-4 = 1.\n(√3-1)² = 3-2√3+1 = 4-2√3.\nTổng = 1+4-2√3 = 5-2√3.", answer: "5-2√3" },
          { prompt: "Chứng minh: 1/(√1+√2) + 1/(√2+√3) + ... + 1/(√99+√100) = 9 (gợi ý: trục căn thức từng số hạng).", solution: "Mỗi số hạng 1/(√n+√(n+1)), nhân liên hợp với (√(n+1)-√n): = √(n+1)-√n (vì mẫu trở thành (n+1)-n=1).\nTổng = (√2-√1)+(√3-√2)+...+(√100-√99) = √100-√1 = 10-1 = 9 (các số hạng giữa triệt tiêu nhau).", answer: "9" },
          { prompt: "Tính: √(4−2√3) (nhận biết dạng (√3−1)²).", solution: "4-2√3 = 3-2√3+1 = (√3-1)².\n√(4-2√3) = √3-1 (vì √3>1 nên √3-1>0)." , answer: "√3-1" },
          { prompt: "Rút gọn: (√a−√b)²/(a−b) với a>b>0.", solution: "a-b = (√a-√b)(√a+√b) (hiệu 2 bình phương).\nRút gọn (√a-√b): kết quả = (√a-√b)/(√a+√b)." , answer: "(√a-√b)/(√a+√b)" },
          { prompt: "Tìm x biết: √(2x−1) = 3 (chú ý điều kiện).", solution: "Điều kiện: 2x-1≥0 → x≥0,5.\nBình phương: 2x-1=9 → x=5 (thỏa điều kiện)." , answer: "5" },
          { prompt: "Tính căn bậc ba của 0,001.", solution: "0,001 = 10⁻³ = (0,1)³.\n∛0,001 = 0,1." , answer: "0,1" },
          { prompt: "So sánh: √7+√15 và √8+√14.", solution: "Bình phương: (√7+√15)²=22+2√105. (√8+√14)²=22+2√112.\nSo sánh 105 và 112: 105<112 nên √105<√112.\nVậy (√7+√15)²<(√8+√14)², suy ra √7+√15 < √8+√14." , answer: "√7+√15 < √8+√14" },
          { prompt: "Tìm giá trị nhỏ nhất của biểu thức A=x−2√x+3 (đặt t=√x, t≥0).", solution: "Đặt t=√x (t≥0): A=t²-2t+3=(t-1)²+2.\nVì (t-1)²≥0, giá trị nhỏ nhất của A là 2, đạt khi t=1, tức x=1." , answer: "2 (khi x=1)" },
          { prompt: "Rút gọn: √(9−4√5) (nhận biết dạng (√5−2)²).", solution: "9-4√5 = 5-4√5+4 = (√5-2)².\n√(9-4√5) = √5-2 (vì √5>2)." , answer: "√5-2" },
        ],
      },
      {
        id: "he-thuc-luong-9",
        title: "Hệ thức lượng trong tam giác vuông",
        questions: [
          { prompt: "Tam giác vuông tại A, đường cao AH. Hệ thức nào đúng?", options: ["AH² = HB·HC", "AH = HB+HC", "AH² = HB+HC", "AH = HB·HC"], correct: 0, explain: "Đây là hệ thức lượng trong tam giác vuông: bình phương đường cao bằng tích hai hình chiếu." },
          { prompt: "Tam giác ABC vuông tại A, AB=3, AC=4. Tính BC.", options: ["5", "7", "6", "12"], correct: 0, explain: "Theo Pytago: BC²=3²+4²=25, nên BC=5." },
          { prompt: "Trong tam giác vuông, sin của một góc nhọn bằng?", options: ["Cạnh đối / cạnh huyền", "Cạnh kề / cạnh huyền", "Cạnh đối / cạnh kề", "Cạnh huyền / cạnh đối"], correct: 0, explain: "Định nghĩa: sin(góc) = cạnh đối / cạnh huyền." },
          { prompt: "cos của một góc nhọn trong tam giác vuông bằng?", options: ["Cạnh kề / cạnh huyền", "Cạnh đối / cạnh huyền", "Cạnh đối / cạnh kề", "Cạnh kề / cạnh đối"], correct: 0, explain: "Định nghĩa: cos(góc) = cạnh kề / cạnh huyền." },
          { prompt: "Tam giác vuông có 1 cạnh góc vuông 6, cạnh huyền 10. Cạnh góc vuông còn lại = ?", options: ["8", "7", "9", "6"], correct: 0, explain: "Theo Pytago: cạnh² = 10²-6² = 64, nên cạnh = 8." },
          { prompt: "tanα trong tam giác vuông bằng?", options: ["Cạnh đối / cạnh kề", "Cạnh kề / cạnh đối", "Cạnh đối / cạnh huyền", "Cạnh kề / cạnh huyền"], correct: 0, explain: "Định nghĩa: tan(góc) = cạnh đối / cạnh kề." },
        ],
        exercises: [
          { prompt: "Tam giác ABC vuông tại A, AB=6, AC=8. Tính đường cao AH từ A xuống BC.", solution: "Theo Pytago: BC=√(36+64)=√100=10.\nÁp dụng hệ thức: AH×BC=AB×AC → AH=(6×8)/10=4,8.", answer: "4,8" },
          { prompt: "Tam giác vuông có một góc nhọn 30°, cạnh huyền 10. Tính cạnh đối diện góc 30°.", solution: "Cạnh đối = cạnh huyền × sin30° = 10×0,5 = 5.", answer: "5" },
          { prompt: "Tam giác ABC vuông tại A có AB=5, góc B=60°. Tính BC.", solution: "cosB = AB/BC → BC = AB/cosB = 5/0,5 = 10.", answer: "10" },
          { prompt: "Tam giác vuông có góc nhọn 45°, cạnh huyền 6√2. Tính độ dài cạnh góc vuông.", solution: "cạnh = cạnh huyền×sin45° = 6√2×(√2/2) = 6.", answer: "6" },
          { prompt: "Tam giác ABC vuông tại A, đường cao AH=4,8cm, BH=3,6cm. Tính CH (biết AH²=BH×CH).", solution: "CH = AH²/BH = 4,8²/3,6 = 23,04/3,6 = 6,4cm.", answer: "6,4cm" },
          { prompt: "Tam giác vuông có hai cạnh góc vuông 9 và 12. Tính cạnh huyền.", solution: "Cạnh huyền = √(9²+12²) = √(81+144) = √225 = 15.", answer: "15" },
          { prompt: "Tam giác ABC vuông tại A, AB=6, BC=10. Tính sinB.", solution: "AC = √(BC²-AB²) = √(100-36) = 8.\nsinB = AC/BC = 8/10 = 0,8.", answer: "0,8" },
          { prompt: "Tam giác vuông có góc 60°, cạnh kề góc đó dài 5. Tính cạnh đối.", solution: "cạnh đối = cạnh kề × tan60° = 5×√3 = 5√3.", answer: "5√3" },
          { prompt: "Tam giác ABC vuông tại A, góc B=30°, AC=5. Tính BC.", solution: "sinB = AC/BC → BC = AC/sinB = 5/0,5 = 10.", answer: "10" },
          { prompt: "Cho tam giác vuông có tanα=3/4. Tính sinα, cosα.", solution: "Dùng tam giác đồng dạng 3-4-5: sinα=3/5, cosα=4/5.", answer: "4/5" },
        ],
        advanced: [
          { prompt: "Tam giác ABC vuông tại A, đường cao AH. Biết AB:AC=3:4, BC=15cm. Tính AH.", solution: "Đặt AB=3k, AC=4k. Theo Pytago: BC²=AB²+AC²=9k²+16k²=25k²=225 → k=3.\nAB=9cm, AC=12cm.\nAH = (AB×AC)/BC = (9×12)/15 = 7,2cm.", answer: "7,2cm" },
          { prompt: "Tam giác ABC vuông tại A, góc B=30°, đường cao AH=6cm. Tính BC.", solution: "Trong tam giác vuông ABH (vuông tại H): AB = AH/sinB = 6/0,5 = 12cm.\nTrong tam giác ABC: BC = AB/cosB = 12/(√3/2) = 24/√3 = 8√3cm.", answer: "8√3cm" },
          { prompt: "Tam giác ABC vuông tại A, phân giác góc A cắt BC tại D. Biết AB=6cm, AC=8cm. Tính BD, DC.", solution: "Theo tính chất đường phân giác: BD/DC=AB/AC=6/8=3/4.\nBC=√(36+64)=10cm.\nBD+DC=10 và BD/DC=3/4: BD=30/7cm, DC=40/7cm.", answer: "BD=30/7cm, DC=40/7cm" },
          { prompt: "Tam giác ABC vuông tại A, AB=8cm, góc C=30°. Tính BC.", solution: "sinC=AB/BC → BC=AB/sinC=8/0,5=16cm." , answer: "16cm" },
          { prompt: "Tam giác ABC vuông tại A, đường cao AH chia BC thành BH, HC với BH×HC=36, BH+HC=13cm. Tìm BH, HC.", solution: "BH, HC là 2 nghiệm của phương trình t²-13t+36=0.\nΔ=169-144=25, √Δ=5. t=(13±5)/2 → t=9 hoặc t=4.\nVậy {BH,HC}={4cm, 9cm}." , answer: "4cm và 9cm" },
          { prompt: "Cho tam giác vuông có 2 góc nhọn α, β. Giải thích vì sao sinα=cosβ.", solution: "Vì α, β là 2 góc nhọn trong tam giác vuông nên α+β=90°, tức β=90°-α.\ncosβ=cos(90°-α)=sinα (tính chất góc phụ nhau)." , answer: "Vì α+β=90° (2 góc nhọn trong tam giác vuông)" },
          { prompt: "Tam giác ABC vuông tại A, AB=6cm, AC=8cm. Tính trung tuyến AM (M trung điểm BC).", solution: "BC=√(36+64)=10cm.\nTrong tam giác vuông, trung tuyến ứng cạnh huyền bằng nửa cạnh huyền: AM=10/2=5cm." , answer: "5cm" },
          { prompt: "Tam giác vuông có cạnh huyền 20cm, một cạnh góc vuông gấp đôi cạnh kia. Tính 2 cạnh góc vuông.", solution: "Gọi cạnh nhỏ=x, cạnh lớn=2x. x²+4x²=400 → 5x²=400 → x²=80 → x=4√5.\nCạnh nhỏ=4√5cm, cạnh lớn=8√5cm." , answer: "4√5cm và 8√5cm" },
          { prompt: "Tam giác ABC vuông tại A, góc B=x, góc C=90°−x. Chứng minh: tanB × tanC = 1.", solution: "tanB=AC/AB. tanC=AB/AC.\nTích = (AC/AB)×(AB/AC) = 1." , answer: "1 (đã chứng minh)" },
          { prompt: "Tam giác ABC vuông tại A, AB=3cm, AH=2,4cm (AH là đường cao). Tính AC (dùng 1/AH²=1/AB²+1/AC²).", solution: "1/AH² = 1/AB²+1/AC²: 1/5,76 = 1/9+1/AC².\n1/AC² = 1/5,76-1/9 ≈ 0,0625 → AC²=16 → AC=4cm." , answer: "4cm" },
        ],
      },
      {
        id: "duong-tron-9",
        title: "Đường tròn",
        questions: [
          { prompt: "Đường tròn tâm O bán kính R là tập hợp các điểm cách O một khoảng bằng?", options: ["R", "2R", "R/2", "Không xác định"], correct: 0, explain: "Theo định nghĩa, đường tròn tâm O bán kính R gồm các điểm cách O đúng bằng R." },
          { prompt: "Dây cung đi qua tâm đường tròn gọi là gì?", options: ["Đường kính", "Bán kính", "Tiếp tuyến", "Cung"], correct: 0, explain: "Dây đi qua tâm chính là đường kính, dài gấp đôi bán kính." },
          { prompt: "Độ dài cung tròn có số đo n°, bán kính R tính bằng công thức nào?", options: ["πRn/180", "2πR", "πR²n/360", "πR"], correct: 0, explain: "Công thức độ dài cung tròn: l = πRn/180." },
          { prompt: "Diện tích hình quạt tròn có số đo n°, bán kính R tính bằng công thức nào?", options: ["πR²n/360", "πRn/180", "2πR", "πR²"], correct: 0, explain: "Công thức diện tích hình quạt tròn: S = πR²n/360." },
          { prompt: "Đường thẳng và đường tròn có thể có bao nhiêu vị trí tương đối?", options: ["3", "2", "4", "1"], correct: 0, explain: "Ba vị trí: không giao nhau, tiếp xúc nhau, hoặc cắt nhau tại 2 điểm." },
          { prompt: "Hai đường tròn tiếp xúc ngoài có bao nhiêu điểm chung?", options: ["1", "0", "2", "Vô số"], correct: 0, explain: "Hai đường tròn tiếp xúc (ngoài hoặc trong) luôn có đúng 1 điểm chung." },
        ],
        exercises: [
          { prompt: "Đường tròn bán kính 6cm. Tính diện tích hình quạt có góc ở tâm 60°.", solution: "S = πR²n/360 = π×36×60/360 = 6π ≈ 18,84cm².", answer: "6π ≈ 18,84cm²" },
          { prompt: "Dây cung dài 8cm cách tâm đường tròn bán kính 5cm một khoảng d. Tính d.", solution: "Nửa dây = 4cm.\nÁp dụng Pytago: d² = R²-4² = 25-16 = 9.\nd = 3cm.", answer: "3cm" },
          { prompt: "Tính độ dài cung tròn có góc ở tâm 90°, bán kính 4cm.", solution: "l = πRn/180 = π×4×90/180 = 2π ≈ 6,28cm.", answer: "2π ≈ 6,28cm" },
          { prompt: "Đường tròn bán kính 7cm. Tính diện tích hình tròn (π≈3,14).", solution: "S = πr² = 3,14×49 ≈ 153,86cm².", answer: "3,14×49 ≈ 153,86cm²" },
          { prompt: "Dây cung AB=12cm trong đường tròn bán kính 10cm. Tính khoảng cách từ tâm đến dây.", solution: "Nửa dây = 6cm.\nd = √(R²-6²) = √(100-36) = √64 = 8cm.", answer: "8cm" },
          { prompt: "Tính độ dài cung 120° trong đường tròn bán kính 9cm.", solution: "l = π×9×120/180 = 6π ≈ 18,84cm.", answer: "6π ≈ 18,84cm" },
          { prompt: "Hai đường tròn có bán kính 5cm và 3cm, khoảng cách hai tâm là 8cm. Xác định vị trí tương đối của chúng.", solution: "Vì 8 = 5+3, hai đường tròn tiếp xúc ngoài.", answer: "5+3, hai đường tròn tiếp xúc ngoài" },
          { prompt: "Tính diện tích hình quạt có góc ở tâm 90°, bán kính 6cm.", solution: "S = πr²×90/360 = π×36/4 = 9π ≈ 28,26cm².", answer: "9π ≈ 28,26cm²" },
          { prompt: "Từ điểm cách tâm đường tròn bán kính 6cm một khoảng 10cm, kẻ tiếp tuyến. Tính độ dài tiếp tuyến.", solution: "Theo Pytago: tiếp tuyến² = 10²-6² = 64.\nTiếp tuyến = 8cm.", answer: "8cm" },
          { prompt: "Đường tròn có chu vi 31,4cm (π≈3,14). Tính bán kính.", solution: "R = chu vi/(2π) = 31,4/6,28 = 5cm.", answer: "5cm" },
        ],
        advanced: [
          { prompt: "Cho đường tròn (O;R). Hai dây AB, CD vuông góc với nhau tại điểm I nằm trong đường tròn. Biết IA=3cm, IB=5cm, IC=2cm. Tính ID (dùng tính chất IA×IB=IC×ID).", solution: "Theo tính chất phương tích của điểm nằm trong đường tròn: IA×IB=IC×ID.\n3×5=2×ID → ID=7,5cm.", answer: "7,5cm" },
          { prompt: "Từ điểm M ở ngoài đường tròn (O;R) kẻ hai tiếp tuyến MA, MB. Biết OM=13cm, R=5cm. Tính diện tích tứ giác OAMB.", solution: "MA=√(OM²-R²)=√(169-25)=√144=12cm (do tam giác OAM vuông tại A).\nDiện tích OAMB = 2×diện tích tam giác OAM = 2×(½×OA×MA) = OA×MA = 5×12 = 60cm².", answer: "60cm²" },
          { prompt: "Cho đường tròn (O;R) và điểm A nằm ngoài với OA=2R. Từ A kẻ tiếp tuyến AB (B là tiếp điểm). Tính góc AOB và độ dài AB theo R.", solution: "Tam giác OAB vuông tại B (tiếp tuyến vuông góc bán kính). cos(AOB)=OB/OA=R/2R=1/2 → góc AOB=60°.\nAB=√(OA²-OB²)=√(4R²-R²)=R√3.", answer: "góc AOB=60°, AB=R√3" },
          { prompt: "Cho đường tròn (O;5cm). Dây AB cách tâm 3cm. Tính độ dài dây AB.", solution: "Nửa dây = √(5²-3²) = √16 = 4cm.\nAB = 8cm." , answer: "8cm" },
          { prompt: "Hai đường tròn đồng tâm O có bán kính R=10cm và r=6cm. Dây AB của đường tròn lớn tiếp xúc với đường tròn nhỏ. Tính AB.", solution: "Khoảng cách từ O đến AB bằng r=6cm (vì tiếp xúc đường tròn nhỏ).\nNửa AB = √(100-36) = 8cm. AB=16cm." , answer: "16cm" },
          { prompt: "Đường tròn có 2 dây song song AB=16cm và CD=12cm nằm về 2 phía tâm, cách nhau 14cm. Tính bán kính.", solution: "Gọi khoảng cách từ tâm đến AB, CD lần lượt là d₁, d₂: d₁+d₂=14.\nd₁²=R²-64, d₂²=R²-36. Giải hệ: R²=100, R=10cm." , answer: "10cm" },
          { prompt: "Cho đường tròn (O;R), 2 bán kính OA, OB vuông góc nhau. Tính độ dài dây AB theo R.", solution: "Tam giác OAB vuông cân tại O (OA=OB=R).\nAB = R√2." , answer: "R√2" },
          { prompt: "Một hình vuông nội tiếp đường tròn bán kính 5cm. Tính diện tích phần đường tròn nằm ngoài hình vuông (π≈3,14).", solution: "Diện tích đường tròn = 25π ≈ 78,5cm².\nĐường chéo hình vuông = 10cm, cạnh = 10/√2=5√2cm, diện tích hình vuông = 50cm².\nPhần ngoài = 78,5-50 = 28,5cm²." , answer: "28,5cm²" },
          { prompt: "Từ điểm A ngoài đường tròn (O;R), kẻ 2 tiếp tuyến AB, AC. Biết góc BAC=60°. Tính AB theo R.", solution: "AO là phân giác góc BAC nên góc OAB=30°.\nTrong tam giác vuông OAB (vuông tại B): tan(OAB)=OB/AB → AB=OB/tan30°=R√3." , answer: "R√3" },
          { prompt: "Đường tròn có diện tích 78,5cm² (π≈3,14). Tính chu vi đường tròn.", solution: "S=πR²=78,5 → R²=25 → R=5cm.\nChu vi = 2πR = 2×3,14×5 = 31,4cm." , answer: "31,4cm" },
        ],
      },
      {
        id: "ham-so-y-ax2-pt-bac-hai-9",
        title: "Hàm số y = ax² và phương trình bậc hai một ẩn",
        questions: [
          { prompt: "Hàm số y = ax² (a≠0) có đồ thị là hình gì?", options: ["Parabol", "Đường thẳng", "Đường tròn", "Hyperbol"], correct: 0, explain: "Đồ thị hàm số y=ax² luôn là một parabol nhận trục Oy làm trục đối xứng." },
          { prompt: "Với y = 2x², khi x = 3 thì y = ?", options: ["18", "6", "9", "36"], correct: 0, explain: "y = 2×3² = 2×9 = 18." },
          { prompt: "x² − 5x + 6 = 0 có nghiệm?", options: ["x=2, x=3", "x=1, x=6", "x=-2, x=-3", "x=2, x=-3"], correct: 0, explain: "Phân tích: (x-2)(x-3)=0 nên x=2 hoặc x=3." },
          { prompt: "Delta của ax²+bx+c=0 tính bằng?", options: ["b²-4ac", "b²+4ac", "4ac-b²", "a²-4bc"], correct: 0, explain: "Đây là công thức biệt thức Δ để xét nghiệm phương trình bậc hai." },
          { prompt: "Theo định lí Viète, tổng hai nghiệm của x²−5x+6=0 bằng?", options: ["5", "6", "-5", "-6"], correct: 0, explain: "Tổng hai nghiệm = -b/a = 5." },
          { prompt: "Tích hai nghiệm của x²−5x+6=0 bằng?", options: ["6", "5", "-6", "-5"], correct: 0, explain: "Tích hai nghiệm = c/a = 6." },
        ],
        exercises: [
          { prompt: "Cho y=3x². Tính y khi x=−2.", solution: "y = 3×(-2)² = 3×4 = 12.", answer: "12" },
          { prompt: "Giải phương trình: x²−7x+12=0", solution: "Phân tích: (x-3)(x-4)=0.\nx=3 hoặc x=4.", answer: "4" },
          { prompt: "Theo Vi-ét, tìm hai số biết tổng bằng 7, tích bằng 12.", solution: "Hai số là nghiệm của phương trình x²-7x+12=0.\nGiải ra: x=3 hoặc x=4. Vậy hai số cần tìm là 3 và 4.", answer: "4. Vậy hai số cần tìm là 3 và 4" },
          { prompt: "Cho y=−x². Tính y khi x=4.", solution: "y = -(4)² = -16.", answer: "-16" },
          { prompt: "Giải phương trình: x²−9=0", solution: "x²=9 → x=±3.", answer: "±3" },
          { prompt: "Giải phương trình: 2x²−8=0", solution: "x²=4 → x=±2.", answer: "±2" },
          { prompt: "Phương trình x²−4x+4=0 có nghiệm gì đặc biệt?", solution: "x²-4x+4=(x-2)²=0, nên phương trình có nghiệm kép x=2.", answer: "2" },
          { prompt: "Tìm m để phương trình x²−2x+m=0 có 2 nghiệm phân biệt.", solution: "Δ = 4-4m > 0 → m < 1.", answer: "4-4m > 0 → m < 1" },
          { prompt: "Theo Vi-ét, tính x₁+x₂ và x₁×x₂ của phương trình x²−7x+10=0.", solution: "x₁+x₂ = -b/a = 7.\nx₁×x₂ = c/a = 10.", answer: "10" },
          { prompt: "Giải phương trình: x²+5x+6=0", solution: "Phân tích: (x+2)(x+3)=0.\nx=-2 hoặc x=-3.", answer: "-3" },
        ],
        advanced: [
          { prompt: "Cho phương trình x²−2(m−1)x+m−3=0. Tìm m để phương trình có 2 nghiệm trái dấu.", solution: "Hai nghiệm trái dấu khi tích hai nghiệm âm: theo Vi-ét, tích = c/a = m-3 < 0 → m<3.", answer: "m<3" },
          { prompt: "Cho x₁, x₂ là hai nghiệm của phương trình x²−5x+3=0. Tính x₁²+x₂².", solution: "Theo Vi-ét: x₁+x₂=5, x₁×x₂=3.\nx₁²+x₂² = (x₁+x₂)²-2x₁x₂ = 25-6 = 19.", answer: "19" },
          { prompt: "Tìm m để phương trình x²+(2m−1)x+m²−1=0 có hai nghiệm x₁, x₂ thỏa x₁²+x₂²=11.", solution: "Điều kiện có nghiệm: Δ=(2m-1)²-4(m²-1)=-4m+5≥0 → m≤5/4.\nTheo Vi-ét: x₁+x₂=1-2m, x₁x₂=m²-1.\nx₁²+x₂²=(x₁+x₂)²-2x₁x₂=(1-2m)²-2(m²-1)=2m²-4m+3.\nGiải: 2m²-4m+3=11 → m²-2m-4=0 → m=1±√5.\nĐối chiếu điều kiện m≤5/4: chỉ m=1-√5 thỏa mãn.", answer: "m=1-√5" },
          { prompt: "Tìm m để phương trình x²-mx+3m-9=0 có nghiệm x=3, tìm nghiệm còn lại.", solution: "Thay x=3: 9-3m+3m-9=0, luôn đúng với mọi m, nên x=3 luôn là nghiệm.\nTheo Vi-ét: x1×x2=3m-9, với x1=3: x2=(3m-9)/3=m-3." , answer: "x2=m-3" },
          { prompt: "Tìm m để phương trình x²−2mx+2m−1=0 có nghiệm kép, tính nghiệm đó.", solution: "Δ'=m²-(2m-1)=m²-2m+1=(m-1)²=0 → m=1.\nNghiệm kép: x=m=1." , answer: "m=1, nghiệm kép x=1" },
          { prompt: "Parabol y=x²−4x+m cắt trục hoành tại 2 điểm có hoành độ x₁, x₂ thỏa x₁²+x₂²=10. Tìm m.", solution: "Theo Vi-ét: x₁+x₂=4, x₁x₂=m.\nx₁²+x₂²=16-2m=10 → m=3.\nKiểm tra Δ=16-4m=16-12=4>0, thỏa mãn." , answer: "3" },
          { prompt: "Xác định a, b, c biết parabol y=ax²+bx+c đi qua gốc tọa độ và có đỉnh tại (1,−1).", solution: "Qua gốc tọa độ: c=0.\nĐỉnh x=-b/2a=1 → b=-2a.\ny(1)=-1: a+b+c=-1 → a-2a+0=-1 → a=1, b=-2, c=0.\nParabol: y=x²-2x." , answer: "a=1, b=-2, c=0" },
          { prompt: "Tìm m để đường thẳng y=2x+m tiếp xúc với parabol y=x².", solution: "Phương trình hoành độ giao điểm: x²=2x+m → x²-2x-m=0.\nTiếp xúc khi Δ'=0: 1+m=0 → m=-1." , answer: "-1" },
          { prompt: "Chứng minh phương trình x²−(m+2)x+2m=0 luôn có nghiệm với mọi m, tìm nghiệm theo m.", solution: "Thử x=2: 4-2(m+2)+2m=4-2m-4+2m=0, đúng với mọi m.\nVậy x=2 luôn là nghiệm. Phân tích: x²-(m+2)x+2m=(x-2)(x-m).\nNghiệm: x=2 hoặc x=m." , answer: "x=2 hoặc x=m" },
          { prompt: "Cho x₁, x₂ là nghiệm của x²−3x−1=0. Tính 1/x₁+1/x₂.", solution: "Theo Vi-ét: x₁+x₂=3, x₁x₂=-1.\n1/x₁+1/x₂ = (x₁+x₂)/(x₁x₂) = 3/(-1) = -3." , answer: "-3" },
        ],
      },
      {
        id: "tan-so-tan-so-tuong-doi-9",
        title: "Tần số và tần số tương đối",
        questions: [
          { prompt: "Tần số của một giá trị trong dãy số liệu là gì?", options: ["Số lần xuất hiện của giá trị đó", "Giá trị lớn nhất trong dãy", "Giá trị nhỏ nhất trong dãy", "Trung bình cộng của dãy"], correct: 0, explain: "Tần số cho biết một giá trị xuất hiện bao nhiêu lần trong dãy số liệu." },
          { prompt: "Tần số tương đối của một giá trị tính bằng công thức nào?", options: ["Tần số / tổng số liệu", "Tần số × tổng số liệu", "Tổng số liệu / tần số", "Tần số + tổng số liệu"], correct: 0, explain: "Tần số tương đối = (tần số của giá trị) / (tổng số liệu), thường biểu diễn dưới dạng %." },
          { prompt: "Trong dãy 2, 3, 3, 5, 3, 7, tần số của giá trị 3 là?", options: ["3", "2", "4", "1"], correct: 0, explain: "Giá trị 3 xuất hiện 3 lần trong dãy." },
          { prompt: "Một lớp 40 học sinh, có 10 học sinh đạt điểm 9. Tần số tương đối của điểm 9 là?", options: ["25%", "10%", "40%", "4%"], correct: 0, explain: "Tần số tương đối = 10/40 = 0,25 = 25%." },
          { prompt: "Bảng tần số dùng để làm gì?", options: ["Tóm tắt số liệu theo giá trị và số lần xuất hiện", "Chỉ liệt kê số liệu thô không xử lý", "Vẽ hình học", "Tính diện tích"], correct: 0, explain: "Bảng tần số giúp tóm tắt, tổ chức số liệu theo từng giá trị và tần số tương ứng." },
          { prompt: "Tổng tất cả các tần số tương đối trong một bảng bằng?", options: ["100%", "50%", "0%", "Không xác định"], correct: 0, explain: "Tổng các tần số tương đối luôn bằng 100% (tương ứng toàn bộ số liệu)." },
        ],
        exercises: [
          { prompt: "Một lớp 35 học sinh, có 7 bạn đạt điểm giỏi. Tính tần số tương đối của điểm giỏi.", solution: "Tần số tương đối = 7/35 = 0,2 = 20%.", answer: "20%" },
          { prompt: "Cho bảng tần số: giá trị 2 có tần số 5, giá trị 3 có tần số 8, giá trị 4 có tần số 7. Tính tổng số liệu.", solution: "Tổng số liệu = 5+8+7 = 20.", answer: "20" },
          { prompt: "Trong bảng tần số ở bài trên, tính tần số tương đối của giá trị 3.", solution: "Tần số tương đối = 8/20 = 0,4 = 40%.", answer: "40%" },
          { prompt: "Bảng tần số: giá trị 1 tần số 4, giá trị 2 tần số 6, giá trị 3 tần số 10. Tính tổng số liệu.", solution: "Tổng = 4+6+10 = 20.", answer: "20" },
          { prompt: "Trong bảng ở bài trên, tính tần số tương đối của giá trị 2.", solution: "Tần số tương đối = 6/20 = 0,3 = 30%.", answer: "30%" },
          { prompt: "Một lớp 45 học sinh, 9 bạn đạt loại xuất sắc. Tính tần số tương đối.", solution: "Tần số tương đối = 9/45 = 0,2 = 20%.", answer: "20%" },
          { prompt: "Một cuộc khảo sát 200 người, 50 người chọn phương án A. Tính tần số tương đối của phương án A.", solution: "Tần số tương đối = 50/200 = 0,25 = 25%.", answer: "25%" },
          { prompt: "Bảng tần số có 3 giá trị với tần số tương đối lần lượt 20%, 35%, x%. Tìm x.", solution: "Tổng các tần số tương đối = 100%: 20+35+x=100 → x=45.", answer: "45" },
          { prompt: "Nếu tần số của một giá trị là 15 và tần số tương đối là 25%, tính tổng số liệu.", solution: "Tổng số liệu = tần số / tần số tương đối = 15/0,25 = 60.", answer: "60" },
          { prompt: "Một lớp 50 học sinh, 12 bạn đạt điểm khá. Tính tần số tương đối của điểm khá.", solution: "Tần số tương đối = 12/50 = 0,24 = 24%.", answer: "24%" },
        ],
        advanced: [
          { prompt: "Một lớp có điểm kiểm tra với tần số: điểm 5 (2 bạn), điểm 6 (x bạn), điểm 7 (10 bạn), điểm 8 (y bạn), điểm 9 (3 bạn), tổng cộng 30 học sinh. Biết tần số điểm 6 gấp đôi tần số điểm 8. Tìm x, y.", solution: "2+x+10+y+3=30 → x+y=15.\nVì tần số điểm 6 gấp đôi điểm 8: x=2y.\nThay vào: 2y+y=15 → y=5, x=10.", answer: "x=10, y=5" },
          { prompt: "Khảo sát 200 người: tần số tương đối thích Toán là 35%, thích Anh là 40%, thích cả hai môn là 15%. Hỏi có bao nhiêu người không thích môn nào trong hai môn đó?", solution: "Tỉ lệ thích ít nhất 1 môn = 35%+40%-15% = 60%.\nTỉ lệ không thích môn nào = 100%-60% = 40%.\nSố người = 200×40% = 80 người.", answer: "80 người" },
          { prompt: "Một bảng tần số có 3 nhóm với tần số tương đối theo tỉ lệ 1:2:4 (nhóm sau gấp đôi nhóm trước). Tính tần số tương đối mỗi nhóm (làm tròn 2 chữ số thập phân sau dấu phẩy, tính theo %).", solution: "Tổng số phần = 1+2+4 = 7. Mỗi phần ứng với 100%/7 ≈ 14,29%.\nNhóm 1 ≈ 14,29%. Nhóm 2 ≈ 28,57%. Nhóm 3 ≈ 57,14%.", answer: "≈14,29%; 28,57%; 57,14%" },
          { prompt: "Một lớp có tần số tương đối học sinh xuất sắc là 8%, tổng học sinh là 50. Tính số học sinh xuất sắc.", solution: "Số học sinh xuất sắc = 50×8% = 4." , answer: "4" },
          { prompt: "Bảng tần số ghi số học sinh giỏi các lớp: 9A (12), 9B (15), 9C (x), tổng 3 lớp 45 học sinh, tần số tương đối lớp 9C là 40%. Tìm x.", solution: "x = 45×40% = 18.\nKiểm tra: 12+15+18=45 ✓." , answer: "18" },
          { prompt: "Một trường có 500 học sinh, tỉ lệ học sinh nữ là 52%. Tính số học sinh nam.", solution: "Số nữ = 500×52% = 260.\nSố nam = 500-260 = 240." , answer: "240" },
          { prompt: "Tần số tương đối của 1 giá trị là 24%, tần số là 36. Tìm tổng số liệu.", solution: "Tổng số liệu = 36/24% = 36/0,24 = 150." , answer: "150" },
          { prompt: "Hai lớp A, B có tổng 80 học sinh. Tỉ lệ học sinh giỏi lớp A là 30%, lớp B là 20%. Biết tổng số học sinh giỏi 2 lớp là 21. Tìm số học sinh mỗi lớp.", solution: "Gọi lớp A có x học sinh, lớp B có 80-x.\n0,3x+0,2(80-x)=21 → 0,3x+16-0,2x=21 → 0,1x=5 → x=50.\nLớp A: 50 học sinh, lớp B: 30 học sinh." , answer: "lớp A: 50, lớp B: 30" },
          { prompt: "Khảo sát 60 người về phương tiện đi lại: 40% đi xe máy, 25% đi ô tô, còn lại đi phương tiện khác. Tính số người đi phương tiện khác.", solution: "Tỉ lệ khác = 100%-40%-25% = 35%.\nSố người = 60×35% = 21." , answer: "21" },
          { prompt: "Một lớp 50 học sinh có tần số tương đối học sinh giỏi tăng từ 20% lên 28% sau 1 học kỳ. Tính số học sinh giỏi tăng thêm.", solution: "Giỏi đầu kỳ = 50×20% = 10. Giỏi cuối kỳ = 50×28% = 14.\nTăng thêm = 14-10 = 4 học sinh." , answer: "4 học sinh" },
        ],
      },
      {
        id: "xac-suat-mo-hinh-don-gian-9",
        title: "Xác suất của biến cố trong một số mô hình xác suất đơn giản",
        questions: [
          { prompt: "Không gian mẫu của phép thử gieo 1 con xúc xắc là?", options: ["{1,2,3,4,5,6}", "{1,2,3}", "{0,1}", "Vô hạn phần tử"], correct: 0, explain: "Không gian mẫu là tập hợp tất cả kết quả có thể của phép thử: 6 mặt xúc xắc." },
          { prompt: "Phép thử ngẫu nhiên là gì?", options: ["Hành động có kết quả không đoán trước được nhưng biết trước các kết quả có thể xảy ra", "Hành động luôn cho cùng một kết quả", "Hành động không có kết quả nào", "Không xác định được"], correct: 0, explain: "Đây là định nghĩa phép thử ngẫu nhiên trong xác suất." },
          { prompt: "Gieo 2 đồng xu, không gian mẫu có bao nhiêu phần tử?", options: ["4", "2", "8", "16"], correct: 0, explain: "Kết quả có thể: SS, SN, NS, NN — 4 phần tử." },
          { prompt: "Xác suất của biến cố A tính bằng công thức nào (n(A): số kết quả thuận lợi, n(Ω): số phần tử không gian mẫu)?", options: ["n(A)/n(Ω)", "n(Ω)/n(A)", "n(A)×n(Ω)", "n(A)+n(Ω)"], correct: 0, explain: "Xác suất cổ điển: P(A) = n(A)/n(Ω)." },
          { prompt: "Gieo 1 xúc xắc, xác suất ra số chẵn là?", options: ["1/2", "1/3", "1/6", "2/3"], correct: 0, explain: "Có 3 số chẵn (2,4,6) trong 6 kết quả: xác suất = 3/6 = 1/2." },
          { prompt: "Rút 1 lá bài từ bộ 52 lá, xác suất rút được lá K (4 lá) là?", options: ["1/13", "1/4", "1/52", "4/13"], correct: 0, explain: "Xác suất = 4/52 = 1/13." },
        ],
        exercises: [
          { prompt: "Gieo 1 xúc xắc 2 lần, tính xác suất cả 2 lần đều ra mặt 6.", solution: "Xác suất mỗi lần ra mặt 6 là 1/6.\nHai lần độc lập: P = (1/6)×(1/6) = 1/36.", answer: "1/36" },
          { prompt: "Một hộp có 5 bi đỏ, 3 bi xanh. Lấy ngẫu nhiên 1 bi. Tính xác suất không lấy được bi đỏ.", solution: "Không lấy được bi đỏ nghĩa là lấy được bi xanh: P = 3/8 (tổng 8 bi, 3 bi xanh).", answer: "3/8 (tổng 8 bi, 3 bi xanh)" },
          { prompt: "Không gian mẫu khi gieo 1 xúc xắc và 1 đồng xu có bao nhiêu phần tử?", solution: "Xúc xắc có 6 kết quả, đồng xu có 2 kết quả.\nSố phần tử không gian mẫu = 6×2 = 12.", answer: "12" },
          { prompt: "Gieo 1 xúc xắc và 1 đồng xu, tính xác suất được mặt 6 và mặt ngửa.", solution: "P = (1/6)×(1/2) = 1/12.", answer: "1/12" },
          { prompt: "Một hộp có 3 bi đỏ, 2 bi xanh. Lấy 1 bi, tính xác suất không phải bi đỏ.", solution: "P(không đỏ) = 2/5 (2 bi xanh trong tổng 5 bi).", answer: "2/5 (2 bi xanh trong tổng 5 bi)" },
          { prompt: "Rút 1 lá bài, tính xác suất được lá số (từ 2 đến 10, tổng 36 lá trong 52 lá).", solution: "Xác suất = 36/52 = 9/13.", answer: "9/13" },
          { prompt: "Gieo 2 xúc xắc, tính xác suất tích 2 mặt bằng 12 (các cặp: (2,6),(3,4),(4,3),(6,2)).", solution: "Có 4 kết quả thỏa mãn trong 36. Xác suất = 4/36 = 1/9.", answer: "1/9" },
          { prompt: "Không gian mẫu khi gieo 3 đồng xu có bao nhiêu phần tử?", solution: "Mỗi đồng xu có 2 kết quả, 3 đồng xu độc lập: 2³ = 8 phần tử.", answer: "8 phần tử" },
          { prompt: "Từ không gian mẫu ở bài trên (gieo 3 đồng xu), tính xác suất có đúng 3 mặt ngửa.", solution: "Chỉ có 1 kết quả thỏa mãn (NNN) trong 8 kết quả.\nXác suất = 1/8.", answer: "1/8" },
          { prompt: "Một hộp có 6 thẻ đánh số 1-6. Lấy 1 thẻ, tính xác suất được số nguyên tố.", solution: "Các số nguyên tố trong 1-6: 2,3,5 → 3 kết quả.\nXác suất = 3/6 = 1/2.", answer: "1/2" },
        ],
        advanced: [
          { prompt: "Gieo 1 xúc xắc 3 lần liên tiếp. Tính xác suất để tổng 3 lần gieo bằng 5.", solution: "Cần đếm số bộ ba số nguyên dương (a,b,c), mỗi số từ 1-6, có tổng bằng 5.\nĐặt a'=a-1,b'=b-1,c'=c-1 (không âm), a'+b'+c'=2: số nghiệm không âm = C(2+2,2)=6 (không cần trừ vượt quá 6 vì tổng chỉ 2).\nKhông gian mẫu = 6³=216.\nXác suất = 6/216 = 1/36.", answer: "1/36" },
          { prompt: "Một hộp có 3 bi đỏ, 2 bi xanh. Lấy lần lượt (không hoàn lại) 2 bi. Tính xác suất bi thứ hai là màu đỏ.", solution: "P(bi2 đỏ) = P(bi1 đỏ)×P(bi2 đỏ|bi1 đỏ) + P(bi1 xanh)×P(bi2 đỏ|bi1 xanh)\n= (3/5)×(2/4) + (2/5)×(3/4) = 6/20+6/20 = 12/20 = 3/5.\n(Thú vị: kết quả bằng đúng xác suất bi thứ nhất là đỏ, dù chưa biết kết quả bi 1!)", answer: "3/5" },
          { prompt: "Một bộ bài 52 lá có 4 lá Át. Rút ngẫu nhiên 3 lá liên tiếp (không hoàn lại). Tính xác suất trong 3 lá đó có đúng 1 lá Át.", solution: "Số cách chọn 1 Át (trong 4) và 2 lá không phải Át (trong 48): C(4,1)×C(48,2) = 4×1128 = 4512.\nTổng số cách chọn 3 lá từ 52: C(52,3)=22100.\nXác suất = 4512/22100 = 1128/5525 (đã rút gọn).", answer: "1128/5525" },
          { prompt: "Gieo 2 xúc xắc, tính xác suất tổng 2 mặt là số chính phương (4 hoặc 9).", solution: "Tổng=4: (1,3),(2,2),(3,1) → 3 cách.\nTổng=9: (3,6),(4,5),(5,4),(6,3) → 4 cách.\nTổng cộng = 7 cách trong 36. Xác suất = 7/36." , answer: "7/36" },
          { prompt: "Một hộp có 6 bi trắng, 4 bi đen. Lấy ngẫu nhiên đồng thời 3 bi. Tính xác suất được ít nhất 1 bi đen.", solution: "P(không có bi đen nào) = C(6,3)/C(10,3) = 20/120 = 1/6.\nP(ít nhất 1 đen) = 1-1/6 = 5/6." , answer: "5/6" },
          { prompt: "Có 3 hộp, mỗi hộp có 1 bi đỏ và 1 bi xanh. Lấy ngẫu nhiên 1 bi từ mỗi hộp. Tính xác suất được đúng 2 bi đỏ.", solution: "C(3,2)×(1/2)²×(1/2) = 3×1/8 = 3/8." , answer: "3/8" },
          { prompt: "Một lớp 25 học sinh, chọn ngẫu nhiên 1 nhóm 4 bạn trực nhật. Trong lớp có 1 cặp bạn thân X, Y. Tính xác suất cả X, Y đều được chọn.", solution: "Số cách chọn thỏa mãn: chọn thêm 2 bạn từ 23 bạn còn lại: C(23,2)=253.\nTổng số cách chọn 4 từ 25: C(25,4)=12650.\nXác suất = 253/12650 = 1/50." , answer: "1/50" },
          { prompt: "Rút ngẫu nhiên 1 lá bài từ bộ 52 lá. Tính xác suất được lá không phải mặt người (J,Q,K) và không phải Át.", solution: "Số lá mặt người và Át: 4 loại × 4 chất = 16 lá.\nCòn lại 52-16=36 lá. Xác suất = 36/52 = 9/13." , answer: "9/13" },
          { prompt: "Gieo 3 đồng xu, tính xác suất số mặt ngửa nhiều hơn số mặt sấp.", solution: "Cần ít nhất 2 mặt ngửa: C(3,2)+C(3,3)=3+1=4 trong 8 kết quả.\nXác suất = 4/8 = 1/2." , answer: "1/2" },
          { prompt: "Một túi có 4 bi xanh, 5 bi đỏ, 6 bi vàng. Lấy ngẫu nhiên 1 bi, biết không phải bi vàng. Tính xác suất bi đó là màu xanh.", solution: "P(xanh|không vàng) = P(xanh)/P(không vàng) = (4/15)/(9/15) = 4/9." , answer: "4/9" },
        ],
      },
      {
        id: "duong-tron-ngoai-noi-tiep-9",
        title: "Đường tròn ngoại tiếp và đường tròn nội tiếp",
        questions: [
          { prompt: "Góc nội tiếp là góc có đỉnh nằm ở đâu?", options: ["Trên đường tròn", "Tại tâm đường tròn", "Ngoài đường tròn", "Không liên quan đến đường tròn"], correct: 0, explain: "Theo định nghĩa, góc nội tiếp có đỉnh nằm trên đường tròn và hai cạnh chứa hai dây cung." },
          { prompt: "Các góc nội tiếp cùng chắn một cung thì có số đo như thế nào?", options: ["Bằng nhau", "Bù nhau", "Gấp đôi nhau", "Không liên quan"], correct: 0, explain: "Tính chất góc nội tiếp: các góc nội tiếp cùng chắn một cung thì bằng nhau." },
          { prompt: "Đường tròn ngoại tiếp tam giác đi qua mấy đỉnh của tam giác?", options: ["Cả 3 đỉnh", "1 đỉnh", "2 đỉnh", "Không đỉnh nào"], correct: 0, explain: "Đường tròn ngoại tiếp tam giác đi qua cả ba đỉnh của tam giác đó." },
          { prompt: "Đường tròn nội tiếp tam giác tiếp xúc với mấy cạnh của tam giác?", options: ["Cả 3 cạnh", "1 cạnh", "2 cạnh", "Không cạnh nào"], correct: 0, explain: "Đường tròn nội tiếp tiếp xúc với cả ba cạnh của tam giác." },
          { prompt: "Tứ giác nội tiếp đường tròn có tổng hai góc đối diện bằng?", options: ["180°", "360°", "90°", "270°"], correct: 0, explain: "Tính chất tứ giác nội tiếp: tổng hai góc đối diện luôn bằng 180°." },
          { prompt: "Đa giác đều là đa giác có tính chất gì?", options: ["Các cạnh bằng nhau và các góc bằng nhau", "Chỉ các cạnh bằng nhau", "Chỉ các góc bằng nhau", "Không có tính chất đặc biệt"], correct: 0, explain: "Đa giác đều có tất cả các cạnh bằng nhau và tất cả các góc bằng nhau." },
        ],
        exercises: [
          { prompt: "Tứ giác ABCD nội tiếp đường tròn có góc A=100°. Tính góc C.", solution: "Tính chất tứ giác nội tiếp: góc A + góc C = 180°.\nGóc C = 180°-100° = 80°.", answer: "80°" },
          { prompt: "Tam giác đều cạnh a có bán kính đường tròn ngoại tiếp R=a/√3. Tính R khi a=6.", solution: "R = 6/√3 = 6√3/3 = 2√3 ≈ 3,46.", answer: "2√3 ≈ 3,46" },
          { prompt: "Đa giác đều có 8 cạnh gọi là gì?", solution: "Đa giác đều có 8 cạnh được gọi là bát giác đều (hình 8 cạnh đều).", answer: "8" },
          { prompt: "Tam giác đều cạnh a=6cm. Tính bán kính đường tròn nội tiếp (r=a/(2√3)).", solution: "r = 6/(2√3) = 3/√3 = √3 ≈ 1,73cm.", answer: "√3 ≈ 1,73cm" },
          { prompt: "Tứ giác nội tiếp có góc B=75°. Tính góc D.", solution: "góc B + góc D = 180° → góc D = 105°.", answer: "105°" },
          { prompt: "Đa giác đều có 6 cạnh gọi là gì?", solution: "Đa giác đều có 6 cạnh được gọi là lục giác đều.", answer: "6" },
          { prompt: "Góc nội tiếp bằng nửa góc ở tâm cùng chắn 1 cung. Nếu góc ở tâm là 80°, tính góc nội tiếp.", solution: "Góc nội tiếp = 80°/2 = 40°.", answer: "40°" },
          { prompt: "Tam giác vuông có cạnh huyền là đường kính đường tròn ngoại tiếp. Nếu cạnh huyền=10cm, tính bán kính.", solution: "R = cạnh huyền/2 = 10/2 = 5cm.", answer: "5cm" },
          { prompt: "Tứ giác ABCD nội tiếp có góc A=95°, góc B=80°. Tính góc C và góc D.", solution: "góc C = 180°-95° = 85° (vì A+C=180°).\ngóc D = 180°-80° = 100° (vì B+D=180°).", answer: "180°)" },
          { prompt: "Hình vuông nội tiếp đường tròn bán kính 5cm. Tính độ dài cạnh hình vuông (cạnh×√2=đường kính).", solution: "Đường kính = 10cm.\nCạnh = 10/√2 = 5√2 ≈ 7,07cm.", answer: "5√2 ≈ 7,07cm" },
        ],
        advanced: [
          { prompt: "Tam giác đều nội tiếp đường tròn bán kính R. Tính diện tích tam giác theo R.", solution: "Cạnh tam giác đều nội tiếp đường tròn bán kính R là a=R√3.\nDiện tích tam giác đều cạnh a: S=a²√3/4 = (R√3)²√3/4 = 3R²√3/4.", answer: "3R²√3/4" },
          { prompt: "Tứ giác ABCD nội tiếp đường tròn, biết góc A=(3x+10)°, góc C=(2x+20)°. Tìm x và tính góc A, góc C.", solution: "Vì tứ giác nội tiếp: góc A + góc C = 180°.\n(3x+10)+(2x+20)=180 → 5x+30=180 → x=30.\nGóc A=3(30)+10=100°. Góc C=2(30)+20=80°.", answer: "x=30; góc A=100°, góc C=80°" },
          { prompt: "Tam giác ABC nội tiếp đường tròn (O;R), biết BC=R√3. Tính góc A (góc nội tiếp chắn cung BC).", solution: "Theo định lý sin: BC/sinA=2R → sinA=BC/(2R)=R√3/(2R)=√3/2.\nVậy góc A=60° hoặc góc A=120° (tùy vị trí tam giác trên đường tròn).", answer: "60° hoặc 120°" },
          { prompt: "Lục giác đều nội tiếp đường tròn bán kính 6cm. Tính chu vi lục giác.", solution: "Cạnh lục giác đều nội tiếp bằng bán kính: cạnh = 6cm.\nChu vi = 6×6 = 36cm." , answer: "36cm" },
          { prompt: "Tam giác ABC vuông tại A nội tiếp đường tròn (O). Xác định vị trí điểm O.", solution: "Vì góc A=90°, theo tính chất góc nội tiếp chắn nửa đường tròn, cạnh huyền BC là đường kính.\nVậy O là trung điểm BC." , answer: "O là trung điểm BC" },
          { prompt: "Một hình vuông nội tiếp đường tròn có chu vi đường tròn là 25,12cm (π≈3,14). Tính cạnh hình vuông.", solution: "R = 25,12/(2×3,14) = 4cm. Đường kính = 8cm (chính là đường chéo hình vuông).\nCạnh = 8/√2 = 4√2cm." , answer: "4√2cm" },
          { prompt: "Tam giác đều ABC nội tiếp đường tròn bán kính R. Tính bán kính đường tròn nội tiếp tam giác đó theo R.", solution: "Với tam giác đều, bán kính đường tròn nội tiếp r = R/2." , answer: "R/2" },
          { prompt: "Tứ giác ABCD nội tiếp có tỉ lệ góc A:B:C:D = 2:3:4:3. Tìm các góc.", solution: "Tổng 4 góc tứ giác = 360°. Tổng phần = 2+3+4+3=12. Mỗi phần = 30°.\ngóc A=60°, B=90°, C=120°, D=90°.\nKiểm tra: A+C=180°✓, B+D=180°✓ (đúng tính chất nội tiếp)." , answer: "A=60°, B=90°, C=120°, D=90°" },
          { prompt: "Cho đường tròn (O;5cm), một dây cung nhìn từ tâm dưới góc 90°. Tính độ dài dây đó và diện tích tam giác tạo bởi dây và tâm.", solution: "Tam giác OAB vuông cân tại O: dây AB = R√2 = 5√2cm.\nDiện tích tam giác OAB = ½×R×R = ½×25 = 12,5cm²." , answer: "dây 5√2cm, diện tích 12,5cm²" },
          { prompt: "Tứ giác ABCD nội tiếp có góc A=95°. Tính góc C.", solution: "Vì tứ giác nội tiếp: góc A+góc C=180°.\nGóc C = 180°-95° = 85°." , answer: "85°" },
        ],
      },
      {
        id: "hinh-khoi-thuc-tien-9",
        title: "Một số hình khối trong thực tiễn",
        questions: [
          { prompt: "Hình trụ có bao nhiêu mặt đáy?", options: ["2", "1", "3", "0"], correct: 0, explain: "Hình trụ có hai mặt đáy là hai hình tròn bằng nhau." },
          { prompt: "Thể tích hình trụ bán kính r, chiều cao h tính bằng công thức nào?", options: ["πr²h", "2πrh", "πr²", "4πr²"], correct: 0, explain: "Thể tích hình trụ = diện tích đáy × chiều cao = πr²h." },
          { prompt: "Hình nón có bao nhiêu mặt đáy?", options: ["1", "2", "0", "3"], correct: 0, explain: "Hình nón chỉ có một mặt đáy là hình tròn." },
          { prompt: "Thể tích hình nón bán kính đáy r, chiều cao h tính bằng?", options: ["(1/3)πr²h", "πr²h", "(1/2)πr²h", "2πr²h"], correct: 0, explain: "Thể tích hình nón bằng 1/3 thể tích hình trụ có cùng đáy và chiều cao: V=(1/3)πr²h." },
          { prompt: "Thể tích hình cầu bán kính r tính bằng công thức nào?", options: ["(4/3)πr³", "4πr²", "πr³", "(1/3)πr³"], correct: 0, explain: "Công thức thể tích hình cầu: V = (4/3)πr³." },
          { prompt: "Diện tích mặt cầu bán kính r tính bằng?", options: ["4πr²", "πr²", "2πr²", "(4/3)πr³"], correct: 0, explain: "Công thức diện tích mặt cầu: S = 4πr²." },
        ],
        exercises: [
          { prompt: "Hình trụ có bán kính đáy 3cm, chiều cao 10cm. Tính thể tích.", solution: "V = πr²h = π×3²×10 = 90π ≈ 282,6cm³.", answer: "90π ≈ 282,6cm³" },
          { prompt: "Hình nón có bán kính đáy 4cm, chiều cao 9cm. Tính thể tích.", solution: "V = (1/3)πr²h = (1/3)×π×16×9 = 48π ≈ 150,72cm³.", answer: "48π ≈ 150,72cm³" },
          { prompt: "Hình cầu có bán kính 3cm. Tính thể tích.", solution: "V = (4/3)πr³ = (4/3)×π×27 = 36π ≈ 113,04cm³.", answer: "36π ≈ 113,04cm³" },
          { prompt: "Hình trụ bán kính 5cm, cao 12cm. Tính diện tích xung quanh (Sxq=2πrh).", solution: "Sxq = 2π×5×12 = 120π ≈ 376,8cm².", answer: "120π ≈ 376,8cm²" },
          { prompt: "Hình nón có đường sinh l=13cm, bán kính đáy r=5cm. Tính chiều cao h (biết h²=l²-r²).", solution: "h = √(13²-5²) = √(169-25) = √144 = 12cm.", answer: "12cm" },
          { prompt: "Hình cầu có đường kính 10cm. Tính bán kính.", solution: "R = đường kính/2 = 10/2 = 5cm.", answer: "5cm" },
          { prompt: "Tính diện tích xung quanh hình nón có bán kính đáy 3cm, đường sinh 5cm (Sxq=πrl).", solution: "Sxq = π×3×5 = 15π ≈ 47,1cm².", answer: "15π ≈ 47,1cm²" },
          { prompt: "Một bể nước hình trụ bán kính 2m, cao 3m. Tính thể tích.", solution: "V = π×2²×3 = 12π ≈ 37,68m³.", answer: "12π ≈ 37,68m³" },
          { prompt: "Hình trụ có thể tích 314cm³, bán kính đáy 5cm (π≈3,14). Tính chiều cao.", solution: "h = V/(πr²) = 314/(3,14×25) = 314/78,5 = 4cm.", answer: "4cm" },
          { prompt: "Một hình nón có bán kính đáy 6cm, đường sinh 10cm. Tính diện tích xung quanh (Sxq=πrl).", solution: "Sxq = π×6×10 = 60π ≈ 188,4cm².", answer: "60π ≈ 188,4cm²" },
        ],
        advanced: [
          { prompt: "Một hình trụ có diện tích toàn phần 100π cm² và bán kính đáy 5cm. Tính chiều cao.", solution: "Stp = 2πr² + 2πrh = 100π.\n2π(25) + 2π(5)h = 100π → 50π + 10πh = 100π → 10πh = 50π → h=5cm.", answer: "5cm" },
          { prompt: "Một hình nón có thể tích 100π cm³, chiều cao 12cm. Tính bán kính đáy.", solution: "V = (1/3)πr²h = 100π → (1/3)r²×12 = 100 → 4r² = 100 → r² = 25 → r=5cm.", answer: "5cm" },
          { prompt: "Đổ đầy nước vào một hình trụ rồi rót hết vào một hình nón có cùng bán kính đáy và chiều cao. Hỏi nước có tràn ra không? Vì sao?", solution: "Thể tích hình trụ: V_trụ = πr²h.\nThể tích hình nón: V_nón = (1/3)πr²h, chỉ bằng 1/3 thể tích trụ.\nVì hình nón chỉ chứa được 1/3 lượng nước, nước sẽ tràn ra ngoài.", answer: "1/3" },
          { prompt: "Một hình nón có bán kính đáy 5cm, chiều cao 12cm. Tính thể tích (theo π).", solution: "V = (1/3)πr²h = (1/3)π×25×12 = 100π cm³." , answer: "100π cm³" },
          { prompt: "Một hình trụ bán kính đáy 4cm, cao 10cm. Khoét 1 hình nón cùng đáy, cùng chiều cao từ trong hình trụ. Tính thể tích phần còn lại.", solution: "V trụ = π×16×10 = 160π. V nón = (1/3)×160π = 160π/3.\nCòn lại = 160π - 160π/3 = 320π/3 cm³." , answer: "320π/3 cm³" },
          { prompt: "Một hình nón có bán kính đáy 6cm, chiều cao 8cm. Tính đường sinh và diện tích toàn phần.", solution: "Đường sinh l = √(6²+8²) = 10cm.\nSxq = πrl = π×6×10 = 60π. Sđáy = π×36 = 36π.\nStp = 60π+36π = 96π cm²." , answer: "96π cm²" },
          { prompt: "Một hình trụ có diện tích xung quanh bằng tổng diện tích 2 đáy. Biết bán kính đáy 3cm. Tính chiều cao.", solution: "Sxq = 2πrh. Tổng 2 đáy = 2πr².\n2πrh = 2πr² → h=r = 3cm." , answer: "3cm" },
          { prompt: "Một bể cá hình trụ đường kính đáy 40cm, cao 50cm, hiện có nước cao 30cm. Thả vào 1 hòn đá thể tích 6280cm³ (ngập hoàn toàn). Hỏi nước có tràn ra ngoài không? (π≈3,14)", solution: "Thể tích còn trống trong bể = diện tích đáy × (50-30) = π×20²×20 = 3,14×400×20 = 25.120cm³.\nVì 6280 < 25.120, nước không tràn ra ngoài." , answer: "Không tràn" },
          { prompt: "Cho khối lập phương cạnh a. Tính tỉ số giữa thể tích khối cầu nội tiếp (tiếp xúc 6 mặt) và thể tích khối lập phương.", solution: "Đường kính khối cầu nội tiếp = a → bán kính = a/2.\nThể tích cầu = (4/3)π(a/2)³ = πa³/6. Thể tích lập phương = a³.\nTỉ số = π/6." , answer: "π/6" },
          { prompt: "Một hình nón cụt có bán kính 2 đáy là 3cm và 6cm. Tính diện tích 2 đáy.", solution: "Đáy nhỏ = π×3² = 9π cm². Đáy lớn = π×6² = 36π cm²." , answer: "9π cm² và 36π cm²" },
        ],
      },
    ],
    examSources: [
      { label: "Toán THCS (lớp 9) – chuyên mục trên TOANMATH.com", url: "https://thcs.toanmath.com/" },
    ],
  },
  {
    id: 10,
    label: "Lớp 10",
    topics: [
      {
        id: "tap-hop-10",
        title: "Mệnh đề và tập hợp",
        questions: [
          { prompt: "A={1,2,3}, B={2,3,4}. A∩B = ?", options: ["{2,3}", "{1,2,3,4}", "{1}", "{4}"], correct: 0, explain: "Giao là các phần tử chung của cả hai tập: 2 và 3." },
          { prompt: "A={1,2,3}, B={2,3,4}. A∪B = ?", options: ["{1,2,3,4}", "{2,3}", "{1}", "{1,4}"], correct: 0, explain: "Hợp gồm tất cả phần tử của A và B, không lặp lại." },
          { prompt: "Mệnh đề \"2 là số nguyên tố\" đúng hay sai?", options: ["Đúng", "Sai", "Không xác định", "Vừa đúng vừa sai"], correct: 0, explain: "2 chỉ chia hết cho 1 và chính nó nên là số nguyên tố (số nguyên tố chẵn duy nhất)." },
          { prompt: "Phủ định của \"mọi số tự nhiên đều chia hết cho 2\" là?", options: ["Tồn tại số tự nhiên không chia hết cho 2", "Mọi số tự nhiên không chia hết cho 2", "Không có số tự nhiên nào chia hết cho 2", "Số 2 chia hết cho mọi số tự nhiên"], correct: 0, explain: "Phủ định của \"mọi... đều\" là \"tồn tại... không\"." },
          { prompt: "Tập hợp rỗng có bao nhiêu phần tử?", options: ["0", "1", "Vô số", "Không xác định"], correct: 0, explain: "Theo định nghĩa, tập rỗng không chứa phần tử nào." },
          { prompt: "A={1,2,3}, B={2,3,4}. A\\B = ?", options: ["{1}", "{4}", "{2,3}", "{1,4}"], correct: 0, explain: "A\\B là phần tử thuộc A nhưng không thuộc B: chỉ có 1." },
        ],
        exercises: [
          { prompt: "Cho A={x∈ℕ | x<6}, B={x∈ℕ | 2≤x≤8}. Tìm A∩B, A∪B, A\\B.", solution: "Liệt kê: A={0,1,2,3,4,5}, B={2,3,4,5,6,7,8}.\nA∩B = {2,3,4,5} (phần tử chung).\nA∪B = {0,1,2,3,4,5,6,7,8} (gộp tất cả, không lặp).\nA\\B = {0,1} (thuộc A nhưng không thuộc B).", answer: "{0,1} (thuộc A nhưng không thuộc B)" },
          { prompt: "Xét mệnh đề P: \"Với mọi số thực x, x²≥0\". Mệnh đề này đúng hay sai? Viết mệnh đề phủ định của nó.", solution: "P đúng, vì bình phương của bất kỳ số thực nào cũng không âm.\nMệnh đề phủ định: \"Tồn tại số thực x sao cho x²<0\". Mệnh đề phủ định này sai (vì không có số thực nào có bình phương âm).", answer: "0" },
          { prompt: "Cho tập hợp C = {x∈ℝ | x²−5x+6=0}. Liệt kê các phần tử của C.", solution: "Giải phương trình x²-5x+6=0: phân tích thành (x-2)(x-3)=0, nên x=2 hoặc x=3.\nVậy C = {2, 3}.", answer: "{2, 3}" },
          { prompt: "Cho A={1,2,3,4}, B={3,4,5,6}. Tìm số phần tử của A∪B.", solution: "A∪B = {1,2,3,4,5,6}, có 6 phần tử.\nCó thể kiểm tra bằng công thức: |A∪B| = |A|+|B|-|A∩B| = 4+4-2 = 6 (vì A∩B={3,4} có 2 phần tử).", answer: "{3,4} có 2 phần tử)" },
          { prompt: "Cho A={x∈ℕ | 1≤x≤10}, B={x∈ℕ | x chẵn, x≤10}. Tìm A∩B.", solution: "A={1,2,...,10}, B={2,4,6,8,10}.\nVì B⊂A, nên A∩B=B={2,4,6,8,10}.", answer: "{2,4,6,8,10}" },
          { prompt: "Viết tập hợp bằng cách liệt kê phần tử: C={x∈ℤ | −3≤x<2}", solution: "C = {-3,-2,-1,0,1}.", answer: "{-3,-2,-1,0,1}" },
          { prompt: "Cho mệnh đề \"Nếu tam giác đều thì tam giác cân\". Viết mệnh đề đảo.", solution: "Mệnh đề đảo: \"Nếu tam giác cân thì tam giác đều\" — mệnh đề này sai vì tam giác cân không nhất thiết đều.", answer: "\"Nếu tam giác cân thì tam giác đều\" — mệnh đề này sai vì tam giác cân không nhất thiết đều" },
          { prompt: "Cho A={1,3,5,7}, B={3,5}. Tập B có phải là tập con của A không?", solution: "Có, vì mọi phần tử của B (3 và 5) đều thuộc A, nên B⊂A.", answer: "5" },
          { prompt: "Một tập hợp có 3 phần tử. Tính số tập hợp con của nó (kể cả tập rỗng).", solution: "Số tập con của một tập có n phần tử là 2ⁿ. Với n=3: 2³=8.", answer: "8" },
          { prompt: "Cho A={x∈ℝ | x²=4}. Liệt kê các phần tử của A.", solution: "x²=4 → x=±2. Vậy A={-2;2}.", answer: "{-2;2}" },
        ],
        advanced: [
          { prompt: "Cho A={x∈ℤ | −3≤x≤5}, B={x∈ℤ | x²≤9}. Tìm A∩B và A\\B.", solution: "A={-3,-2,-1,0,1,2,3,4,5}. B: x²≤9 ⟺ -3≤x≤3, nên B={-3,-2,-1,0,1,2,3}.\nA∩B = B = {-3,-2,-1,0,1,2,3}.\nA\\B (phần tử thuộc A nhưng không thuộc B) = {4,5}.", answer: "A∩B={-3,...,3}; A\\B={4,5}" },
          { prompt: "Chứng minh: với mọi số nguyên n, nếu n² chia hết cho 3 thì n chia hết cho 3.", solution: "Chứng minh phản chứng: giả sử n không chia hết cho 3, tức n=3k+1 hoặc n=3k-1 (k nguyên).\nNếu n=3k+1: n²=9k²+6k+1=3(3k²+2k)+1, chia 3 dư 1.\nNếu n=3k-1: n²=9k²-6k+1=3(3k²-2k)+1, chia 3 dư 1.\nCả hai trường hợp n² đều không chia hết cho 3, mâu thuẫn giả thiết. Vậy mệnh đề đúng.", answer: "Đúng (chứng minh bằng phản chứng)" },
          { prompt: "Cho tập A có n phần tử. Biết số tập con có đúng 2 phần tử của A là 15. Tìm n.", solution: "Số tập con 2 phần tử = C(n,2) = n(n-1)/2 = 15 → n(n-1)=30.\nVì 6×5=30, nên n=6.", answer: "6" },
          { prompt: "Cho A=[1;5], B=(3;7]. Tìm A∩B, A∪B.", solution: "A∩B = (3;5]. A∪B = [1;7].", answer: "A∩B=(3;5], A∪B=[1;7]" },
          { prompt: "Cho |A|=20, |B|=15, |A∩B|=8. Tính số phần tử chỉ thuộc A (tức A\\B).", solution: "|A\\B| = |A|-|A∩B| = 20-8 = 12.", answer: "12" },
          { prompt: "Tìm tất cả tập con của A={a,b,c} có ít nhất 2 phần tử.", solution: "Tập con 2 phần tử: {a,b},{a,c},{b,c} (3 tập). Tập con 3 phần tử: {a,b,c} (1 tập).\nTổng cộng 4 tập con.", answer: "4 tập con" },
          { prompt: "Cho mệnh đề P: \"∀x∈ℝ, x²≥0\". Viết mệnh đề phủ định và xét đúng sai.", solution: "Phủ định: \"∃x∈ℝ, x²<0\".\nMệnh đề P đúng, nên phủ định của nó sai.", answer: "∃x∈ℝ, x²<0 (sai)" },
          { prompt: "Cho A={1,2,...,20}. Tìm số phần tử của A chia hết cho 3 hoặc 4.", solution: "Chia hết 3: 6 số. Chia hết 4: 5 số. Chia hết cả 12: 1 số.\nTheo bao hàm trừ giao: 6+5-1=10.", answer: "10" },
          { prompt: "Tìm m để tập A={x∈ℝ | x²−2mx+1=0} có đúng 1 phần tử.", solution: "Cần Δ'=0: m²-1=0 → m=±1.", answer: "m=1 hoặc m=-1" },
          { prompt: "Cho 3 tập A, B, C rời nhau đôi một, |A|=5, |B|=7, |C|=4. Tính |A∪B∪C|.", solution: "Vì rời nhau đôi một: |A∪B∪C| = |A|+|B|+|C| = 5+7+4 = 16.", answer: "16" },
        ],
      },
      {
        id: "ham-so-bac-hai-10",
        title: "Hàm số bậc hai",
        questions: [
          { prompt: "Hoành độ đỉnh parabol y=x²−4x+3 là?", options: ["2", "4", "-2", "1"], correct: 0, explain: "x_đỉnh = -b/2a = 4/2 = 2." },
          { prompt: "Parabol y=ax²+bx+c bề lõm hướng lên khi?", options: ["a > 0", "a < 0", "a = 0", "b > 0"], correct: 0, explain: "Hệ số a dương thì parabol quay bề lõm lên trên." },
          { prompt: "Tung độ đỉnh của y=x²−4x+3 là?", options: ["-1", "1", "3", "-3"], correct: 0, explain: "Thay x=2 vào: 4-8+3 = -1." },
          { prompt: "y=−2x²+1 đạt giá trị lớn nhất tại?", options: ["x = 0", "x = 1", "x = -1", "x = 2"], correct: 0, explain: "Vì a<0 nên đỉnh là điểm cực đại, x_đỉnh = -b/2a = 0." },
          { prompt: "Nghiệm của x²−4x+3=0 là?", options: ["x=1, x=3", "x=1, x=-3", "x=-1, x=3", "x=2, x=3"], correct: 0, explain: "Phân tích (x-1)(x-3)=0 nên x=1 hoặc x=3." },
          { prompt: "Trục đối xứng của y=x²−4x+3 là?", options: ["x = 2", "x = 4", "x = -2", "y = 2"], correct: 0, explain: "Trục đối xứng là đường thẳng đi qua đỉnh: x = -b/2a = 2." },
        ],
        exercises: [
          { prompt: "Cho hàm số y=x²−6x+5. Tìm tọa độ đỉnh của parabol.", solution: "x_đỉnh = -b/2a = 6/2 = 3.\ny_đỉnh = 3²-6×3+5 = 9-18+5 = -4.\nVậy đỉnh I(3; -4).", answer: "đỉnh I(3; -4)" },
          { prompt: "Tìm nghiệm của phương trình x²−6x+5=0.", solution: "Phân tích: (x-1)(x-5)=0, nên x=1 hoặc x=5.", answer: "5" },
          { prompt: "Cho hàm số y=−2x²+4x+1. Tìm giá trị lớn nhất của hàm số.", solution: "Vì a=-2<0 nên hàm đạt giá trị lớn nhất tại đỉnh.\nx_đỉnh = -b/2a = -4/(-4) = 1.\ny_đỉnh = -2(1)²+4(1)+1 = -2+4+1 = 3.\nVậy giá trị lớn nhất của hàm số là 3.", answer: "giá trị lớn nhất của hàm số là 3" },
          { prompt: "Parabol y=x²−4 cắt trục hoành tại những điểm nào?", solution: "Giải x²-4=0 → x²=4 → x=±2.\nParabol cắt trục hoành tại hai điểm (-2;0) và (2;0).", answer: "0" },
          { prompt: "Tìm nghiệm của phương trình x²−4x+3=0.", solution: "Phân tích: (x-1)(x-3)=0 → x=1 hoặc x=3.", answer: "3" },
          { prompt: "Tìm trục đối xứng của parabol y=x²−4x+3.", solution: "Trục đối xứng: x = -b/2a = 4/2 = 2.", answer: "2" },
          { prompt: "Cho parabol y=2x²−8x+9. Tìm tọa độ đỉnh.", solution: "x_đỉnh = -b/2a = 8/4 = 2.\ny_đỉnh = 2(2)²-8(2)+9 = 8-16+9 = 1.\nĐỉnh I(2;1).", answer: "Đỉnh I(2;1)" },
          { prompt: "Hàm số y=x²−2x−3 cắt trục hoành tại các điểm nào?", solution: "Giải x²-2x-3=0 → (x-3)(x+1)=0 → x=3 hoặc x=-1.\nGiao điểm: (3;0) và (-1;0).", answer: "Giao điểm: (3;0) và (-1;0)" },
          { prompt: "Cho y=−2x²+8x−3. Tìm giá trị lớn nhất của hàm số.", solution: "x_đỉnh = -b/2a = -8/(2×-2) = 2.\ny_đỉnh = -2(4)+16-3 = -8+16-3 = 5.\nVì a<0, giá trị lớn nhất là 5.", answer: "Vì a<0, giá trị lớn nhất là 5" },
          { prompt: "Tìm giao điểm của parabol y=x² với đường thẳng y=x+2.", solution: "x² = x+2 → x²-x-2=0 → (x-2)(x+1)=0 → x=2 hoặc x=-1.\nTại x=2: y=4. Tại x=-1: y=1.\nGiao điểm: (2;4) và (-1;1).", answer: "Giao điểm: (2;4) và (-1;1)" },
        ],
        advanced: [
          { prompt: "Tìm m để phương trình x²−2mx+m²−1=0 có 2 nghiệm x₁,x₂ sao cho x₁³+x₂³=8 (dùng Vi-ét, không giải trực tiếp).", solution: "Theo Vi-ét: x₁+x₂=2m, x₁x₂=m²-1.\nx₁³+x₂³=(x₁+x₂)³-3x₁x₂(x₁+x₂)=(2m)³-3(m²-1)(2m)=8m³-6m³+6m=2m³+6m.\nĐặt bằng 8: 2m³+6m=8 → m³+3m-4=0 → (m-1)(m²+m+4)=0.\nVì m²+m+4>0 với mọi m (Δ<0), nghiệm duy nhất là m=1.", answer: "1" },
          { prompt: "Cho hàm số y=x²−4x+3. Tìm điểm trên đồ thị có tung độ nhỏ nhất, và tính khoảng cách từ điểm đó đến trục hoành.", solution: "Đỉnh parabol tại x=-b/2a=2, y=4-8+3=-1. Điểm đó là (2;-1).\nKhoảng cách đến trục hoành = |-1| = 1.", answer: "1" },
          { prompt: "Chứng minh parabol y=x²−2mx+m²−1 luôn cắt trục hoành tại 2 điểm phân biệt với mọi giá trị m.", solution: "Δ' = m²-(m²-1) = 1 > 0 với mọi m.\nVì Δ'>0 luôn đúng, parabol luôn cắt trục hoành tại 2 điểm phân biệt với mọi m.", answer: "Δ'=1>0 với mọi m, luôn cắt tại 2 điểm phân biệt" },
          { prompt: "Tìm parabol y=ax²+bx+c biết đi qua 3 điểm A(−1,6), B(0,3), C(2,3).", solution: "Từ B: c=3. Từ A: a-b+c=6 → a-b=3. Từ C: 4a+2b+c=3 → 2a+b=0 → b=-2a.\nThay vào a-b=3: a+2a=3 → a=1, b=-2, c=3.", answer: "y=x²-2x+3" },
          { prompt: "CSC có 2 nghiệm x₁,x₂ của 1 tam thức thỏa x₁−x₂=2 và x₁x₂=8. Tìm x₁+x₂ (2 trường hợp).", solution: "(x₁+x₂)² = (x₁-x₂)²+4x₁x₂ = 4+32 = 36 → x₁+x₂=±6.", answer: "6 hoặc -6" },
          { prompt: "Tìm giá trị lớn nhất của y=−x²+4x−1 trên đoạn [0;3].", solution: "Đỉnh tại x=2 (thuộc [0;3]): y(2)=-4+8-1=3.\nKiểm tra biên: y(0)=-1, y(3)=2. GTLN=3 tại x=2.", answer: "3" },
          { prompt: "Tìm giao điểm của 2 parabol y=x²−2x+3 và y=−x²+4x−1.", solution: "x²-2x+3=-x²+4x-1 → 2x²-6x+4=0 → x²-3x+2=0 → x=1 hoặc x=2.\nTại x=1: y=2. Tại x=2: y=3. Giao điểm (1;2) và (2;3).", answer: "(1;2) và (2;3)" },
          { prompt: "Một quả bóng ném theo quỹ đạo h(t)=−5t²+20t (m). Tính thời gian đạt độ cao lớn nhất và độ cao đó.", solution: "Đỉnh tại t=-20/(2×-5)=2 giây. h(2)=-20+40=20m.", answer: "sau 2 giây, cao 20m" },
          { prompt: "Tìm m để phương trình x²−2x+m=0 có 2 nghiệm dương phân biệt.", solution: "Cần Δ'>0: 1-m>0 → m<1. Tổng nghiệm=2>0 luôn đúng. Tích nghiệm=m>0.\nVậy 0<m<1.", answer: "0<m<1" },
          { prompt: "Tìm m để đồ thị y=(m+1)x²−2x+3 có đỉnh nằm trên trục hoành.", solution: "Cần m≠-1 (để là parabol). Đỉnh trên trục hoành khi Δ=0: 4-12(m+1)=0 → m=-2/3.", answer: "-2/3" },
        ],
      },
      {
        id: "bpt-bac-nhat-2an-10",
        title: "Bất phương trình bậc nhất hai ẩn",
        questions: [
          { prompt: "Miền nghiệm của bpt x+y≤4 chứa điểm nào sau đây?", options: ["(0,0)", "(5,5)", "(3,4)", "(10,0)"], correct: 0, explain: "Thay (0,0): 0+0=0≤4 đúng, nên điểm (0,0) thuộc miền nghiệm." },
          { prompt: "Cặp số nào là nghiệm của bpt 2x−y>1?", options: ["(2,1)", "(0,0)", "(1,2)", "(0,1)"], correct: 0, explain: "Thay (2,1): 2×2-1=3>1 đúng. Các cặp còn lại đều không thỏa mãn." },
          { prompt: "Đường thẳng x+y=4 chia mặt phẳng thành mấy miền (không kể chính đường thẳng)?", options: ["2", "1", "3", "4"], correct: 0, explain: "Một đường thẳng luôn chia mặt phẳng thành 2 nửa mặt phẳng." },
          { prompt: "Bất phương trình bậc nhất hai ẩn có dạng tổng quát nào?", options: ["ax+by+c≤0 (hoặc <, >, ≥)", "ax²+by+c=0", "ax+by=c", "a/x+b/y≤c"], correct: 0, explain: "Đây là dạng tổng quát của bất phương trình bậc nhất hai ẩn." },
          { prompt: "Hệ bất phương trình bậc nhất hai ẩn có miền nghiệm là?", options: ["Giao của các miền nghiệm từng bất phương trình", "Hợp của các miền nghiệm", "Một đường thẳng duy nhất", "Toàn bộ mặt phẳng"], correct: 0, explain: "Nghiệm của hệ phải thỏa mãn đồng thời tất cả các bpt, nên là giao các miền nghiệm." },
          { prompt: "Điểm (1,1) có thỏa mãn bpt x+2y<5 không?", options: ["Có", "Không", "Không xác định", "Chỉ đúng khi x=0"], correct: 0, explain: "Thay vào: 1+2×1=3<5, đúng, nên điểm (1,1) thỏa mãn." },
        ],
        exercises: [
          { prompt: "Mô tả miền nghiệm của bất phương trình x+y≤3 trên mặt phẳng tọa độ.", solution: "Vẽ đường thẳng x+y=3 (đi qua hai điểm (3;0) và (0;3)).\nThay điểm gốc (0;0) vào: 0+0=0≤3, đúng.\nVậy miền nghiệm là nửa mặt phẳng chứa gốc tọa độ, kể cả đường thẳng biên (vì dấu ≤).", answer: "3, đ" },
          { prompt: "Kiểm tra xem điểm (2,3) có thuộc miền nghiệm của hệ x+y≤6; x−y≥−2 hay không.", solution: "Kiểm tra từng bất phương trình:\nx+y = 2+3 = 5 ≤ 6 → đúng.\nx-y = 2-3 = -1 ≥ -2 → đúng.\nVì thỏa mãn cả hai, điểm (2,3) thuộc miền nghiệm của hệ.", answer: "2,3" },
          { prompt: "Một cửa hàng bán bánh A giá 20.000đ, bánh B giá 30.000đ. Gọi x, y lần lượt là số bánh A, B bán được. Viết bất phương trình biểu diễn doanh thu ít nhất 600.000đ.", solution: "Doanh thu = 20000x + 30000y.\nYêu cầu doanh thu ít nhất 600.000đ: 20000x + 30000y ≥ 600000.\nRút gọn (chia cả hai vế cho 10000): 2x + 3y ≥ 60.", answer: "2x + 3y ≥ 60" },
          { prompt: "Tìm một cặp nghiệm nguyên dương của bất phương trình 3x+2y<12.", solution: "Thử x=1, y=1: 3×1+2×1 = 5 < 12, đúng.\nVậy (x;y)=(1;1) là một nghiệm (bài toán có nhiều đáp án đúng khác, đây là một ví dụ).", answer: "1" },
          { prompt: "Kiểm tra điểm (1,1) có thuộc miền nghiệm của bpt 2x−y≥0 không, so với điểm (0,1)?", solution: "Tại (1,1): 2×1-1=1≥0, đúng, thuộc miền nghiệm.\nTại (0,1): 2×0-1=-1≥0, sai, không thuộc miền nghiệm.", answer: "-1≥0, sai, không thuộc miền nghiệm" },
          { prompt: "Viết một bất phương trình bậc nhất hai ẩn có miền nghiệm chứa điểm (0,0).", solution: "Ví dụ: x+y≤1. Thay (0,0): 0≤1, đúng, nên điểm (0,0) thuộc miền nghiệm.", answer: "0,0" },
          { prompt: "Hệ bất phương trình x≥0, y≥0, x+y≤4 biểu diễn miền nào trên mặt phẳng tọa độ?", solution: "Đây là miền tam giác nằm trong góc phần tư thứ nhất, giới hạn bởi hai trục tọa độ và đường thẳng x+y=4.", answer: "4" },
          { prompt: "Kiểm tra điểm (3,3) có thỏa mãn bất phương trình x+y<5 không?", solution: "Thay vào: 3+3=6, mà 6<5 là sai, nên điểm (3,3) không thỏa mãn.", answer: "3,3" },
          { prompt: "Bất phương trình x−2y>3 có phải là bất phương trình bậc nhất hai ẩn không? Vì sao?", solution: "Có, vì có dạng ax+by>c với a=1, b=-2, c=3 — đúng dạng tổng quát của bất phương trình bậc nhất hai ẩn.", answer: "3" },
          { prompt: "Cho hệ x≤5, y≤3, x≥0, y≥0. Tìm một điểm thuộc miền nghiệm.", solution: "Ví dụ điểm (2;1): thỏa mãn cả 4 điều kiện (2≤5, 1≤3, 2≥0, 1≥0).", answer: "0" },
        ],
        advanced: [
          { prompt: "Tìm giá trị lớn nhất của F=3x+2y trên miền x≥0, y≥0, x+y≤4, x≤3.", solution: "Miền nghiệm là tứ giác có các đỉnh (0,0), (3,0), (3,1) (giao x=3 và x+y=4), (0,4).\nTính F tại từng đỉnh: (0,0)→0; (3,0)→9; (3,1)→11; (0,4)→8.\nGiá trị lớn nhất F=11, đạt tại (3,1).", answer: "11, đạt tại (3,1)" },
          { prompt: "Một xưởng sản xuất 2 loại sản phẩm A (lãi 3 triệu/sp) và B (lãi 5 triệu/sp). Mỗi sp A cần 2 giờ máy, sp B cần 3 giờ máy (tối đa 12 giờ máy/ngày); mỗi sp cần 1 giờ nhân công (tối đa 5 giờ/ngày). Tìm số sản phẩm mỗi loại để lãi lớn nhất.", solution: "Gọi x, y là số sp A, B: 2x+3y≤12, x+y≤5, x,y≥0. Lãi L=3x+5y.\nCác đỉnh miền nghiệm: (0,0), (5,0), (3,2) (giao 2 đường ràng buộc), (0,4).\nTính L: (0,0)→0; (5,0)→15; (3,2)→19; (0,4)→20.\nLãi lớn nhất là 20 triệu, đạt khi chỉ sản xuất 4 sản phẩm B (x=0, y=4).", answer: "20 triệu, tại x=0, y=4" },
          { prompt: "Miền nghiệm của hệ x≥0, y≥0, x+y≤4 là một tam giác. Tính diện tích tam giác đó.", solution: "Tam giác có 3 đỉnh (0,0), (4,0), (0,4).\nDiện tích = ½×4×4 = 8 (đơn vị diện tích).", answer: "8" },
          { prompt: "Tìm giá trị nhỏ nhất của F=2x+3y trên miền x≥1, y≥1, x+y≤6.", solution: "Các đỉnh miền: (1,1), (5,1), (1,5).\nTính F: (1,1)→5; (5,1)→13; (1,5)→17.\nGiá trị nhỏ nhất F=5 tại (1,1).", answer: "5" },
          { prompt: "Miền nghiệm hệ x≥0, y≥0, 2x+y≤8, x+2y≤8 là một tứ giác. Tìm tọa độ 4 đỉnh.", solution: "Đỉnh: (0,0), (4,0), (0,4), và giao 2 đường 2x+y=8, x+2y=8: trừ ra x=y, thay vào được x=y=8/3.\n4 đỉnh: (0,0), (4,0), (8/3;8/3), (0,4).", answer: "(0,0), (4,0), (8/3;8/3), (0,4)" },
          { prompt: "Kiểm tra điểm (2,−1) có thuộc miền nghiệm của hệ 3x−y>4 và x+2y<3 không.", solution: "3(2)-(-1)=7>4 ✓. 2+2(-1)=0<3 ✓.\nVậy điểm thuộc miền nghiệm.", answer: "Thuộc miền nghiệm" },
          { prompt: "Tìm m để điểm (1,2) thuộc miền nghiệm của bất phương trình mx+y≤5.", solution: "m(1)+2≤5 → m≤3.", answer: "m≤3" },
          { prompt: "Một công ty sản xuất 2 sản phẩm với x+y≤100, x≥20, y≥30. Lãi x là 2tr/sp, y là 3tr/sp. Tìm số lượng để lãi lớn nhất.", solution: "Các đỉnh: (20,30), (20,80), (70,30).\nTính lãi=2x+3y: (20,30)→130tr; (20,80)→280tr; (70,30)→230tr.\nLãi lớn nhất 280tr tại (20,80).", answer: "280 triệu tại (20,80)" },
          { prompt: "Miền nghiệm của bất phương trình |x|+|y|≤2 là hình gì? Tính diện tích.", solution: "Đây là hình thoi với 4 đỉnh (2,0), (-2,0), (0,2), (0,-2).\nHai đường chéo đều dài 4. Diện tích = (4×4)/2 = 8.", answer: "Hình thoi, diện tích 8" },
          { prompt: "Tìm x nguyên dương lớn nhất thỏa mãn: 3x+2y≤20 với y=2 cố định.", solution: "3x+4≤20 → 3x≤16 → x≤16/3≈5,33.\nx nguyên dương lớn nhất: x=5.", answer: "5" },
        ],
      },
      {
        id: "gia-tri-luong-giac-10",
        title: "Giá trị lượng giác của một góc từ 0° đến 180°",
        questions: [
          { prompt: "sin90° = ?", options: ["1", "0", "-1", "1/2"], correct: 0, explain: "sin90° = 1, giá trị lớn nhất của hàm sin." },
          { prompt: "cos0° = ?", options: ["1", "0", "-1", "1/2"], correct: 0, explain: "cos0° = 1, giá trị lớn nhất của hàm cos." },
          { prompt: "sin30° = ?", options: ["1/2", "√2/2", "√3/2", "1"], correct: 0, explain: "Đây là giá trị lượng giác đặc biệt cần nhớ: sin30° = 1/2." },
          { prompt: "cos60° = ?", options: ["1/2", "√3/2", "√2/2", "0"], correct: 0, explain: "Giá trị lượng giác đặc biệt: cos60° = 1/2." },
          { prompt: "tan45° = ?", options: ["1", "0", "Không xác định", "√3"], correct: 0, explain: "tan45° = sin45°/cos45° = (√2/2)/(√2/2) = 1." },
          { prompt: "sin150° = ?", options: ["1/2", "-1/2", "√3/2", "-√3/2"], correct: 0, explain: "sin150° = sin(180°-150°) = sin30° = 1/2 (góc bù trong nửa khoảng 0-180°)." },
        ],
        exercises: [
          { prompt: "Tính giá trị của biểu thức A = sin30° + cos60°.", solution: "sin30° = 1/2, cos60° = 1/2.\nA = 1/2 + 1/2 = 1.", answer: "1" },
          { prompt: "Tính B = sin²45° + cos²45°.", solution: "Theo công thức lượng giác cơ bản: sin²α + cos²α = 1 với mọi α.\nVậy B = 1 (không cần tính riêng từng giá trị).", answer: "1 (không cần tính riêng từng giá trị)" },
          { prompt: "Cho biết cosα = 0,6 với α là góc nhọn. Tính sinα.", solution: "Áp dụng sin²α + cos²α = 1: sin²α = 1 - 0,6² = 1 - 0,36 = 0,64.\nsinα = √0,64 = 0,8 (lấy giá trị dương vì α là góc nhọn nên sinα>0).", answer: "0" },
          { prompt: "Tính giá trị của tan60°.", solution: "tan60° = sin60°/cos60° = (√3/2)/(1/2) = √3.", answer: "√3" },
          { prompt: "Tính cos120°.", solution: "cos120° = -cos60° = -1/2.", answer: "-1/2" },
          { prompt: "Tính sin120°.", solution: "sin120° = sin60° = √3/2.", answer: "√3/2" },
          { prompt: "Tính tan135°.", solution: "tan135° = -tan45° = -1.", answer: "-1" },
          { prompt: "Cho sinα=0,6 với α là góc tù. Tính cosα.", solution: "cos²α = 1-0,6² = 1-0,36 = 0,64.\ncosα = -0,8 (lấy âm vì α là góc tù).", answer: "-0,8 (lấy âm vì α là góc tù)" },
          { prompt: "So sánh sin50° và sin130°.", solution: "sin130° = sin(180°-130°) = sin50°.\nVậy hai giá trị này bằng nhau.", answer: "hai giá trị này bằng nhau" },
          { prompt: "Tính giá trị biểu thức sin²30°+cos²30°.", solution: "Theo công thức lượng giác cơ bản sin²α+cos²α=1 với mọi α, nên kết quả bằng 1.", answer: "1 với mọi α, nên kết quả bằng 1" },
        ],
        advanced: [
          { prompt: "Cho cosα=1/3 (0°<α<90°). Tính sin(2α).", solution: "sinα=√(1-1/9)=√(8/9)=2√2/3 (dương vì α nhọn).\nsin(2α)=2sinα·cosα=2×(2√2/3)×(1/3)=4√2/9.", answer: "4√2/9" },
          { prompt: "Rút gọn: sin(180°−α) + cos(90°−α) − sin(90°+α)", solution: "sin(180°-α)=sinα. cos(90°-α)=sinα. sin(90°+α)=cosα.\nBiểu thức = sinα+sinα-cosα = 2sinα-cosα.", answer: "2sinα-cosα" },
          { prompt: "Cho tanα=2. Tính giá trị biểu thức (sinα+cosα)/(sinα−cosα).", solution: "Chia cả tử và mẫu cho cosα (cosα≠0): = (tanα+1)/(tanα-1) = (2+1)/(2-1) = 3.", answer: "3" },
          { prompt: "Cho sinα+cosα=1/2. Tính sinα×cosα.", solution: "Bình phương 2 vế: (sinα+cosα)²=1/4 → 1+2sinαcosα=1/4 → sinαcosα=-3/8.", answer: "-3/8" },
          { prompt: "Tính giá trị biểu thức: cos²15°+cos²75°.", solution: "cos75°=sin15° (góc phụ nhau).\nBiểu thức = cos²15°+sin²15° = 1.", answer: "1" },
          { prompt: "Rút gọn: (1−cos²α)/sin²α + (1−sin²α)/cos²α", solution: "(1-cos²α)=sin²α. (1-sin²α)=cos²α.\nBiểu thức = sin²α/sin²α + cos²α/cos²α = 1+1 = 2.", answer: "2" },
          { prompt: "Cho tanα=√3 (0°<α<90°). Tìm α.", solution: "tan60°=√3.\nVậy α=60°.", answer: "60°" },
          { prompt: "Tính giá trị: sin15°×cos15°", solution: "Dùng công thức nhân đôi: sin15°cos15° = (1/2)sin30° = (1/2)(1/2) = 1/4.", answer: "1/4" },
          { prompt: "Chứng minh: (sinα+cosα)²+(sinα−cosα)²=2.", solution: "Khai triển: (sin²α+2sinαcosα+cos²α)+(sin²α-2sinαcosα+cos²α) = 2sin²α+2cos²α = 2(sin²α+cos²α) = 2.", answer: "2 (đã chứng minh)" },
          { prompt: "Cho cosα=−1/2 (90°<α<180°). Tính sinα và tanα.", solution: "sinα=√(1-1/4)=√3/2 (dương vì góc tù).\ntanα=sinα/cosα=(√3/2)/(-1/2)=-√3.", answer: "sinα=√3/2, tanα=-√3" },
        ],
      },
      {
        id: "vecto-10",
        title: "Vectơ",
        questions: [
          { prompt: "Vectơ có hai yếu tố đặc trưng nào?", options: ["Độ dài và hướng", "Chỉ độ dài", "Chỉ hướng", "Tọa độ điểm đầu"], correct: 0, explain: "Vectơ được xác định bởi độ dài (module) và hướng của nó." },
          { prompt: "Cho vectơ AB, độ dài của nó ký hiệu là?", options: ["|AB|", "AB²", "A+B", "AB/2"], correct: 0, explain: "Độ dài của một vectơ được ký hiệu bằng dấu giá trị tuyệt đối: |AB|." },
          { prompt: "Hai vectơ bằng nhau khi nào?", options: ["Cùng hướng và cùng độ dài", "Chỉ cần cùng độ dài", "Chỉ cần cùng hướng", "Có điểm đầu trùng nhau"], correct: 0, explain: "Hai vectơ bằng nhau khi và chỉ khi chúng cùng hướng và có cùng độ dài." },
          { prompt: "Vectơ đối của vectơ a có đặc điểm gì?", options: ["Cùng độ dài, ngược hướng", "Cùng hướng, khác độ dài", "Bằng vectơ 0", "Không xác định"], correct: 0, explain: "Vectơ đối có cùng độ dài nhưng hướng ngược lại với vectơ ban đầu." },
          { prompt: "Cho A(1,2), B(4,6). Tọa độ vectơ AB = ?", options: ["(3,4)", "(5,8)", "(4,6)", "(3,-4)"], correct: 0, explain: "Tọa độ vectơ AB = (x_B-x_A; y_B-y_A) = (4-1; 6-2) = (3;4)." },
          { prompt: "Độ dài vectơ AB ở câu trên bằng bao nhiêu?", options: ["5", "7", "25", "12"], correct: 0, explain: "|AB| = √(3²+4²) = √25 = 5." },
        ],
        exercises: [
          { prompt: "Cho A(2,3), B(5,7). Tính tọa độ và độ dài vectơ AB.", solution: "Tọa độ vectơ AB = (5-2; 7-3) = (3;4).\nĐộ dài |AB| = √(3²+4²) = √25 = 5.", answer: "5" },
          { prompt: "Cho vectơ a=(2,−1) và b=(−3,4). Tính vectơ a+b.", solution: "a+b = (2+(-3); -1+4) = (-1; 3).", answer: "(-1; 3)" },
          { prompt: "Cho vectơ a=(2,−1) và b=(−3,4). Tính vectơ a−b.", solution: "a-b = (2-(-3); -1-4) = (5; -5).", answer: "(5; -5)" },
          { prompt: "Cho A(1,1), B(4,1), C(1,5). Chứng minh tam giác ABC vuông tại A bằng cách dùng vectơ.", solution: "Tọa độ vectơ AB = (4-1; 1-1) = (3;0).\nTọa độ vectơ AC = (1-1; 5-1) = (0;4).\nTích vô hướng AB·AC = 3×0 + 0×4 = 0.\nVì tích vô hướng bằng 0 nên AB⊥AC, tức tam giác ABC vuông tại A.", answer: "0" },
          { prompt: "Cho A(3,1), B(7,4). Tính vectơ AB và độ dài của nó.", solution: "AB = (7-3; 4-1) = (4;3).\n|AB| = √(16+9) = √25 = 5.", answer: "5" },
          { prompt: "Cho vectơ a=(3,−2). Tính vectơ đối của a.", solution: "Vectơ đối có tọa độ ngược dấu: (-3;2).", answer: "Vectơ đối có tọa độ ngược dấu: (-3;2)" },
          { prompt: "Cho A(0,0), B(4,0), C(0,3). Tính chu vi tam giác ABC.", solution: "AB=4, AC=3, BC=√(16+9)=5.\nChu vi = 4+3+5 = 12.", answer: "12" },
          { prompt: "Cho vectơ u=(2,1), v=(1,3). Tính u+v và u−v.", solution: "u+v = (2+1;1+3) = (3;4).\nu-v = (2-1;1-3) = (1;-2).", answer: "(1;-2)" },
          { prompt: "Cho tam giác ABC có A(1,2), B(3,4), C(5,0). Tìm tọa độ trọng tâm G.", solution: "G = ((1+3+5)/3; (2+4+0)/3) = (3;2).", answer: "(3;2)" },
          { prompt: "Tìm tọa độ điểm D sao cho ABCD là hình bình hành, biết A(1,1), B(4,1), C(5,3).", solution: "Vì ABCD là hình bình hành nên vectơ AB=DC, suy ra D=A+C-B.\nD = (1+5-4; 1+3-1) = (2;3).", answer: "(2;3)" },
        ],
        advanced: [
          { prompt: "Cho tam giác ABC, M là điểm thỏa vectơ AM = (2/3)AB + (1/3)AC. Chứng tỏ M thuộc đoạn BC và tính tỉ số BM/MC.", solution: "Vì tổng hệ số 2/3+1/3=1 nên M nằm trên đường thẳng BC.\nViết dạng AM=(1-t)AB+tAC với t=1/3: M chia BC theo tỉ lệ BM:MC=t:(1-t)=1/3:2/3=1:2.", answer: "BM:MC=1:2" },
          { prompt: "Cho hình bình hành ABCD, I là trung điểm CD. Biểu diễn vectơ AI theo hai vectơ AB và AD.", solution: "Trong hình bình hành ABCD: vectơ DC = vectơ AB.\nDI = ½DC = ½AB (I là trung điểm CD).\nAI = AD + DI = AD + ½AB.\nVậy vectơ AI = (1/2)AB + AD.", answer: "AI = (1/2)AB + AD" },
          { prompt: "Cho 3 điểm A(1,2), B(4,0), C(−2,7). Tìm tọa độ điểm G sao cho vectơ GA+GB+GC=vectơ 0.", solution: "G thỏa điều kiện này chính là trọng tâm tam giác ABC.\nG = ((1+4-2)/3; (2+0+7)/3) = (1;3).", answer: "(1;3)" },
          { prompt: "Cho A(2,−1), B(4,3). Tìm tọa độ điểm M sao cho vectơ AM=2×vectơ AB.", solution: "vectơ AB=(2,4). vectơ AM=2AB=(4,8).\nM = A+AM = (2+4;-1+8) = (6;7).", answer: "(6;7)" },
          { prompt: "Cho tam giác ABC với trọng tâm G. Chứng minh vectơ AB+AC=3×vectơ AG.", solution: "G=(A+B+C)/3, nên vectơ AG=(B+C-2A)/3.\nvectơ AB+vectơ AC=(B-A)+(C-A)=B+C-2A=3×vectơ AG.", answer: "Đã chứng minh" },
          { prompt: "Cho hình bình hành ABCD. Chứng minh vectơ AC=vectơ AB+vectơ AD.", solution: "Trong hình bình hành: vectơ AC=vectơ AB+vectơ BC.\nVì BC=AD (tính chất hbh): vectơ AC=vectơ AB+vectơ AD.", answer: "Đã chứng minh" },
          { prompt: "Cho A(1,1), B(3,5). Tìm tọa độ điểm C trên đoạn AB sao cho AC=1/3 AB.", solution: "vectơ AB=(2,4). vectơ AC=(2/3;4/3).\nC = A+AC = (1+2/3;1+4/3) = (5/3;7/3).", answer: "(5/3;7/3)" },
          { prompt: "Cho 2 vectơ a=(1,2), b=(3,−1). Tìm vectơ c=2a−3b.", solution: "2a=(2,4). 3b=(9,-3).\nc = 2a-3b = (2-9;4-(-3)) = (-7;7).", answer: "(-7;7)" },
          { prompt: "Cho A(0,0), B(4,0), C(0,3). Tìm D sao cho tứ giác ABDC là hình bình hành.", solution: "Trong hbh ABDC, trung điểm AD = trung điểm BC.\nTrung điểm BC=(2;1,5). D = 2×(2;1,5)-A = (4;3).", answer: "(4;3)" },
          { prompt: "Cho A(1,2), B(3,4), C(0,0). Biết vectơ AB=vectơ CD, tìm tọa độ D.", solution: "vectơ AB=(2,2).\nD = C+AB = (0+2;0+2) = (2;2).", answer: "(2;2)" },
        ],
      },
      {
        id: "he-thuc-luong-tam-giac-10",
        title: "Hệ thức lượng trong tam giác",
        questions: [
          { prompt: "Định lý cosin trong tam giác ABC: a² = ?", options: ["b²+c²-2bc·cosA", "b²+c²+2bc·cosA", "b²-c²", "b²+c²"], correct: 0, explain: "Định lý cosin: a² = b²+c²-2bc·cosA." },
          { prompt: "Định lý sin trong tam giác ABC: a/sinA = ?", options: ["2R", "R", "R/2", "4R"], correct: 0, explain: "Định lý sin: a/sinA = b/sinB = c/sinC = 2R, với R là bán kính đường tròn ngoại tiếp." },
          { prompt: "Diện tích tam giác ABC theo hai cạnh b, c và góc A xen giữa tính bằng?", options: ["½bc·sinA", "bc·sinA", "½bc·cosA", "bc·cosA"], correct: 0, explain: "Công thức diện tích: S = ½bc·sinA." },
          { prompt: "Tam giác có a=5, b=7, góc C=60°. Tính c² theo định lý cosin.", options: ["39", "74", "109", "25"], correct: 0, explain: "c² = a²+b²-2ab·cosC = 25+49-2×5×7×0,5 = 74-35 = 39." },
          { prompt: "Công thức Heron tính diện tích tam giác theo 3 cạnh sử dụng đại lượng nào?", options: ["Nửa chu vi p", "Chu vi", "Bán kính đường tròn ngoại tiếp", "Chiều cao"], correct: 0, explain: "Công thức Heron: S=√(p(p-a)(p-b)(p-c)) với p là nửa chu vi." },
          { prompt: "Định lý cosin liên hệ tổng bình phương hai cạnh và bình phương cạnh còn lại thông qua hàm lượng giác nào của góc xen giữa?", options: ["cos", "sin", "tan", "cot"], correct: 0, explain: "Định lý cosin dùng hàm cos của góc xen giữa hai cạnh đã biết." },
        ],
        exercises: [
          { prompt: "Tam giác ABC có a=6, b=8, góc C=60°. Tính cạnh c.", solution: "c² = a²+b²-2ab·cosC = 36+64-2×6×8×0,5 = 100-48 = 52.\nc = √52 ≈ 7,21.", answer: "√52 ≈ 7,21" },
          { prompt: "Tam giác ABC có bán kính đường tròn ngoại tiếp R=5, góc A=30°. Tính cạnh a (đối diện góc A).", solution: "Theo định lý sin: a = 2R·sinA = 2×5×0,5 = 5.", answer: "5" },
          { prompt: "Tam giác có hai cạnh 5 và 7, góc xen giữa 60°. Tính diện tích.", solution: "S = ½×5×7×sin60° = ½×35×(√3/2) = 35√3/4 ≈ 15,16.", answer: "35√3/4 ≈ 15,16" },
          { prompt: "Tam giác ABC có a=8, b=5, c=7. Tính cosA (theo công thức cosA=(b²+c²-a²)/2bc).", solution: "cosA = (25+49-64)/(2×5×7) = 10/70 = 1/7.", answer: "1/7" },
          { prompt: "Tam giác có a=10, góc A=30°. Tính bán kính đường tròn ngoại tiếp R.", solution: "R = a/(2sinA) = 10/(2×0,5) = 10.", answer: "10" },
          { prompt: "Tam giác có 3 cạnh 7, 8, 9. Tính diện tích bằng công thức Heron.", solution: "Nửa chu vi p = (7+8+9)/2 = 12.\nS = √(p(p-a)(p-b)(p-c)) = √(12×5×4×3) = √720 ≈ 26,83.", answer: "√720 ≈ 26,83" },
          { prompt: "Tam giác ABC có a=5, b=6, c=7. Tính cosC.", solution: "cosC = (a²+b²-c²)/2ab = (25+36-49)/60 = 12/60 = 0,2.", answer: "0,2" },
          { prompt: "Cho tam giác có 2 cạnh 6, 10 và góc xen giữa 45°. Tính diện tích.", solution: "S = ½×6×10×sin45° = 30×(√2/2) = 15√2 ≈ 21,21.", answer: "15√2 ≈ 21,21" },
          { prompt: "Tam giác đều cạnh a. Viết công thức tính diện tích theo a.", solution: "Diện tích tam giác đều cạnh a: S = (a²√3)/4.", answer: "(a²√3)/4" },
          { prompt: "Tam giác ABC có b=6, c=8, góc A=90°. Tính cạnh a bằng định lý cosin.", solution: "a² = b²+c²-2bc·cosA = 36+64-2×6×8×cos90° = 100-0 = 100.\na = 10 (khớp với định lý Pytago vì góc A=90°).", answer: "90°)" },
        ],
        advanced: [
          { prompt: "Tam giác ABC có a=7, b=8, c=9. Tính diện tích bằng công thức Heron, rồi tính bán kính đường tròn nội tiếp r=S/p.", solution: "p=(7+8+9)/2=12. S=√(12×5×4×3)=√720=12√5.\nr = S/p = 12√5/12 = √5.", answer: "√5" },
          { prompt: "Trong tam giác ABC, biết a=2R·sinA. Cho a=10, sinA=0,5. Tính bán kính đường tròn ngoại tiếp R.", solution: "R = a/(2sinA) = 10/(2×0,5) = 10.", answer: "10" },
          { prompt: "Tam giác ABC có góc A=60°, b=8, c=5. Tính cạnh a và diện tích tam giác.", solution: "a² = b²+c²-2bc·cosA = 64+25-2×8×5×0,5 = 89-40 = 49 → a=7.\nS = ½×8×5×sin60° = 20×(√3/2) = 10√3.", answer: "10√3" },
          { prompt: "Tam giác ABC có a=6, b=8, c=10. Chứng minh tam giác vuông và tìm góc vuông.", solution: "Kiểm tra: a²+b²=36+64=100=c².\nVậy tam giác vuông tại C (góc đối diện cạnh c=10).", answer: "Vuông tại C" },
          { prompt: "Tam giác ABC có góc A=45°, góc B=60°, cạnh a=8. Tính cạnh b.", solution: "Theo định lý sin: a/sinA=b/sinB → b=a×sinB/sinA = 8×(√3/2)/(√2/2) = 4√6.", answer: "4√6" },
          { prompt: "Tam giác ABC có diện tích 24cm², AB=8cm, AC=6cm. Tính góc A.", solution: "S=½×AB×AC×sinA → 24=24×sinA → sinA=1 → góc A=90°.", answer: "90°" },
          { prompt: "Tam giác ABC có a=13, b=14, c=15. Tính diện tích bằng công thức Heron.", solution: "p=(13+14+15)/2=21.\nS=√(21×8×7×6)=√7056=84.", answer: "84" },
          { prompt: "Chứng minh công thức chiếu a=b·cosC+c·cosB, kiểm chứng với tam giác đều cạnh a.", solution: "Với tam giác đều, cosB=cosC=cos60°=0,5: a=a×0,5+a×0,5=a. Đúng.", answer: "Đã kiểm chứng đúng" },
          { prompt: "Tam giác ABC có a=5, góc B=45°, góc C=105°. Tính cạnh b.", solution: "góc A=180°-45°-105°=30°.\nTheo định lý sin: b=a×sinB/sinA=5×(√2/2)/0,5=5√2.", answer: "5√2" },
          { prompt: "Tính bán kính đường tròn nội tiếp tam giác đều cạnh a.", solution: "S=a²√3/4, nửa chu vi p=3a/2.\nr=S/p=(a²√3/4)/(3a/2)=a√3/6.", answer: "a√3/6" },
        ],
      },
      {
        id: "dau-tam-thuc-bac-hai-10",
        title: "Dấu của tam thức bậc hai",
        questions: [
          { prompt: "Tam thức bậc hai f(x)=ax²+bx+c (a≠0) có Δ<0 thì f(x) mang dấu gì với mọi x?", options: ["Luôn cùng dấu với a", "Luôn trái dấu với a", "Đổi dấu tùy theo x", "Luôn bằng 0"], correct: 0, explain: "Khi Δ<0, tam thức vô nghiệm và luôn cùng dấu với hệ số a." },
          { prompt: "Tam thức f(x)=x²−4 có nghiệm nào?", options: ["x=±2", "x=2", "x=-2", "Vô nghiệm"], correct: 0, explain: "x²=4 nên x=2 hoặc x=-2." },
          { prompt: "Tam thức f(x)=x²−4 âm khi nào?", options: ["-2<x<2", "x<-2 hoặc x>2", "x=0 duy nhất", "Không bao giờ âm"], correct: 0, explain: "Vì a=1>0, f(x) âm giữa hai nghiệm: -2<x<2." },
          { prompt: "Nếu a>0 và Δ>0, tam thức f(x) dương khi nào?", options: ["x nhỏ hơn nghiệm nhỏ hoặc lớn hơn nghiệm lớn", "Giữa hai nghiệm", "Luôn dương với mọi x", "Luôn âm với mọi x"], correct: 0, explain: "Khi a>0, tam thức dương ở ngoài khoảng hai nghiệm." },
          { prompt: "f(x)=−x²+1 dương khi nào?", options: ["-1<x<1", "x<-1 hoặc x>1", "Luôn dương", "Luôn âm"], correct: 0, explain: "Vì a=-1<0, f(x) dương giữa hai nghiệm x=-1 và x=1." },
          { prompt: "Khi Δ=0, tam thức bậc hai có bao nhiêu nghiệm?", options: ["1 nghiệm kép", "2 nghiệm phân biệt", "Vô nghiệm", "Vô số nghiệm"], correct: 0, explain: "Δ=0 thì phương trình có nghiệm kép duy nhất x=-b/2a." },
        ],
        exercises: [
          { prompt: "Xét dấu tam thức f(x)=x²−3x+2.", solution: "Giải PT: x²-3x+2=0 → x=1 hoặc x=2.\nVì a=1>0: f(x)>0 khi x<1 hoặc x>2; f(x)<0 khi 1<x<2.", answer: "2." },
          { prompt: "Giải bất phương trình: x²−5x+6 > 0", solution: "Nghiệm phương trình: x=2, x=3.\nVì a=1>0, f(x)>0 ngoài khoảng nghiệm: x<2 hoặc x>3.", answer: "x<2 hoặc x>3" },
          { prompt: "Tìm m để phương trình x²−2x+m=0 vô nghiệm.", solution: "PT vô nghiệm khi Δ<0.\nΔ = 4-4m < 0 → m > 1.", answer: "4-4m < 0 → m > 1" },
          { prompt: "Giải bất phương trình: x²−1 ≥ 0", solution: "Nghiệm: x=±1. Vì a=1>0, bpt đúng khi x≤-1 hoặc x≥1.", answer: "1>0, bpt đúng khi x≤-1 hoặc x≥1" },
          { prompt: "Xét dấu tam thức f(x)=−x²+5x−6.", solution: "Nghiệm: x=2, x=3. Vì a=-1<0: f(x)>0 khi 2<x<3; f(x)<0 khi x<2 hoặc x>3.", answer: "3." },
          { prompt: "Tìm m để x²+2x+m > 0 với mọi x.", solution: "Cần Δ<0: 4-4m<0 → m>1.", answer: "Cần Δ<0: 4-4m<0 → m>1" },
          { prompt: "Giải bất phương trình: 2x²−3x−2 ≤ 0", solution: "Giải PT: 2x²-3x-2=0 → x=(3±√25)/4 → x=2 hoặc x=-0,5.\nVì a=2>0, bpt≤0 khi -0,5≤x≤2.", answer: "2>0, bpt≤0 khi -0,5≤x≤2" },
          { prompt: "Giải bất phương trình: −x²+4x−4 ≥ 0", solution: "-x²+4x-4 = -(x-2)². Vì (x-2)²≥0 nên -(x-2)²≤0 với mọi x.\nBpt ≥0 chỉ đúng khi (x-2)²=0, tức x=2.", answer: "2" },
          { prompt: "Tìm tập nghiệm của bất phương trình x²−6x+9<0.", solution: "x²-6x+9=(x-3)²≥0 với mọi x, không có giá trị nào làm biểu thức âm.\nTập nghiệm là tập rỗng.", answer: "Tập nghiệm là tập rỗng" },
          { prompt: "Tìm m để phương trình mx²−2x+1=0 (m≠0) vô nghiệm.", solution: "Δ = 4-4m < 0 → m > 1.", answer: "4-4m < 0 → m > 1" },
        ],
        advanced: [
          { prompt: "Tìm m để bất phương trình x²−2mx+m+2≥0 nghiệm đúng với mọi x.", solution: "Cần Δ'≤0: m²-(m+2)≤0 → m²-m-2≤0 → (m-2)(m+1)≤0 → -1≤m≤2.", answer: "2." },
          { prompt: "Giải bất phương trình: (x−1)(x−3)(x+2) > 0", solution: "Các nghiệm: x=-2, x=1, x=3. Xét dấu trên từng khoảng:\nx<-2: (-)(-)(-)=(-). -2<x<1: (-)(-)(+)=(+). 1<x<3: (+)(-)(+)=(-). x>3: (+)(+)(+)=(+).\nVậy bpt đúng khi -2<x<1 hoặc x>3.", answer: "bpt đúng khi -2<x<1 hoặc x>3" },
          { prompt: "Tìm m để phương trình (m−1)x²−2mx+m+2=0 vô nghiệm.", solution: "Nếu m=1: phương trình thành -2x+3=0, có nghiệm x=1,5 → loại.\nNếu m≠1: cần Δ'<0: Δ'=m²-(m-1)(m+2)=m²-(m²+m-2)=-m+2<0 → m>2.", answer: "-m+2<0 → m>2" },
          { prompt: "Giải bất phương trình: x²−4≥0.", solution: "Nghiệm x=±2, a=1>0.\nBpt≥0 khi x≤-2 hoặc x≥2.", answer: "x≤-2 hoặc x≥2" },
          { prompt: "Tìm m để f(x)=x²+(m−1)x+m luôn dương với mọi x.", solution: "Cần Δ<0: (m-1)²-4m<0 → m²-6m+1<0.\nNghiệm: m=3±2√2. Vậy 3-2√2<m<3+2√2.", answer: "3-2√2<m<3+2√2" },
          { prompt: "Giải bất phương trình: −2x²+3x+2≤0.", solution: "Nghiệm: x=2 hoặc x=-0,5. Vì a=-2<0, f(x)≤0 ngoài khoảng nghiệm.\nVậy x≤-0,5 hoặc x≥2.", answer: "x≤-0,5 hoặc x≥2" },
          { prompt: "Tìm x nguyên thỏa mãn: x²−5x+4<0.", solution: "Nghiệm x=1, x=4. Vì a=1>0, f(x)<0 khi 1<x<4.\nx nguyên: 2, 3.", answer: "2, 3" },
          { prompt: "Cho f(x)=ax²+bx+c có a>0 và f(1)<0. Chứng tỏ f(x)=0 có 2 nghiệm, một nhỏ hơn 1 và một lớn hơn 1.", solution: "Vì a>0, đồ thị đi lên ở 2 đầu (f(x)→+∞ khi x→±∞). Vì f(1)<0, đồ thị nằm dưới trục hoành tại x=1.\nDo đó đồ thị phải cắt trục hoành 1 lần trước và 1 lần sau x=1.", answer: "Đã chứng minh" },
          { prompt: "Tìm m để phương trình mx²−2(m−1)x+m−2=0 vô nghiệm (xét cả m=0).", solution: "Nếu m=0: PT thành 2x-2=0, có nghiệm x=1, loại.\nNếu m≠0: Δ'=(m-1)²-m(m-2)=1>0 luôn đúng, PT luôn có nghiệm.\nVậy không có m nào làm PT vô nghiệm.", answer: "Không có m nào (PT luôn có nghiệm)" },
          { prompt: "Giải bất phương trình: (x−1)²(x+3)≥0.", solution: "(x-1)²≥0 luôn đúng. Cần thêm x+3≥0 (trừ khi x=1 làm biểu thức=0 luôn thỏa).\nVậy nghiệm: x≥-3.", answer: "x≥-3" },
        ],
      },
      {
        id: "so-dac-trung-mau-so-lieu-10",
        title: "Các số đặc trưng của mẫu số liệu",
        questions: [
          { prompt: "Số trung bình cộng của mẫu số liệu 2, 4, 6, 8 là?", options: ["5", "4", "6", "20"], correct: 0, explain: "Trung bình cộng = (2+4+6+8)/4 = 20/4 = 5." },
          { prompt: "Trung vị của mẫu số liệu 1, 3, 5, 7, 9 là?", options: ["5", "3", "7", "4"], correct: 0, explain: "Dãy có 5 giá trị, trung vị là giá trị ở giữa (thứ 3): 5." },
          { prompt: "Mốt của mẫu số liệu 2, 3, 3, 5, 3, 7 là?", options: ["3", "5", "7", "2"], correct: 0, explain: "Giá trị 3 xuất hiện nhiều nhất (3 lần)." },
          { prompt: "Phương sai đo lường điều gì của mẫu số liệu?", options: ["Độ phân tán quanh giá trị trung bình", "Giá trị lớn nhất", "Giá trị nhỏ nhất", "Số lượng phần tử"], correct: 0, explain: "Phương sai cho biết mức độ phân tán của các số liệu quanh trung bình cộng." },
          { prompt: "Độ lệch chuẩn được tính từ phương sai bằng cách nào?", options: ["Lấy căn bậc hai của phương sai", "Bình phương của phương sai", "Chia phương sai cho 2", "Không liên quan đến phương sai"], correct: 0, explain: "Độ lệch chuẩn = √(phương sai)." },
          { prompt: "Số gần đúng có sai số càng nhỏ thì độ chính xác càng?", options: ["Cao", "Thấp", "Không đổi", "Không xác định"], correct: 0, explain: "Sai số càng nhỏ nghĩa là số gần đúng càng sát giá trị thật, độ chính xác càng cao." },
        ],
        exercises: [
          { prompt: "Cho mẫu số liệu: 3, 5, 7, 9, 11. Tính số trung bình và trung vị.", solution: "Trung bình = (3+5+7+9+11)/5 = 35/5 = 7.\nTrung vị = giá trị ở giữa = 7.", answer: "7" },
          { prompt: "Tính phương sai của mẫu 2, 4, 6 (biết trung bình = 4).", solution: "Phương sai = [(2-4)²+(4-4)²+(6-4)²]/3 = (4+0+4)/3 = 8/3 ≈ 2,67.", answer: "8/3 ≈ 2,67" },
          { prompt: "Tính độ lệch chuẩn của mẫu ở bài trên (phương sai=8/3).", solution: "Độ lệch chuẩn = √(8/3) ≈ 1,63.", answer: "√(8/3) ≈ 1,63" },
          { prompt: "Cho mẫu 4, 6, 8, 10, 12. Tính khoảng biến thiên.", solution: "Khoảng biến thiên = giá trị lớn nhất - nhỏ nhất = 12-4 = 8.", answer: "8" },
          { prompt: "Tính trung vị của mẫu 3, 7, 9, 12 (4 giá trị).", solution: "Với 4 giá trị, trung vị = trung bình cộng của 2 giá trị giữa = (7+9)/2 = 8.", answer: "8" },
          { prompt: "Mẫu số liệu có phương sai = 9. Tính độ lệch chuẩn.", solution: "Độ lệch chuẩn = √9 = 3.", answer: "3" },
          { prompt: "Mẫu số liệu có Q1=10, Q3=25. Tính khoảng tứ phân vị.", solution: "Khoảng tứ phân vị = Q3-Q1 = 25-10 = 15.", answer: "15" },
          { prompt: "Cho mẫu 1, 2, 3, 4, 5, 100. Tính trung vị.", solution: "Sắp xếp: 1,2,3,4,5,100. Trung vị = (3+4)/2 = 3,5 (ít bị ảnh hưởng bởi giá trị 100 nhờ dùng vị trí giữa).", answer: "100" },
          { prompt: "Tính số trung bình của mẫu 5, 5, 5, 5.", solution: "Vì mọi giá trị bằng nhau, trung bình = 5.", answer: "5" },
          { prompt: "Sai số tuyệt đối của một phép đo là 0,05, số đo là 12,3. Viết kết quả đo dưới dạng số gần đúng.", solution: "Kết quả đo viết dưới dạng: 12,3 ± 0,05.", answer: "đo viết dưới dạng: 12,3 ± 0,05" },
        ],
        advanced: [
          { prompt: "Hai mẫu số liệu A, B đều có trung bình 20. Mẫu A có độ lệch chuẩn 2, mẫu B có độ lệch chuẩn 5. Mẫu nào có khả năng gần giá trị trung bình hơn?", solution: "Mẫu A có độ lệch chuẩn nhỏ hơn, nghĩa là các giá trị tập trung gần trung bình hơn.\nVậy mẫu A có khả năng gần 20 hơn.", answer: "mẫu A có khả năng gần 20 hơn" },
          { prompt: "Mẫu số liệu: 2, 4, 6, 8, 10. Tính phương sai.", solution: "Trung bình = 6.\nPhương sai = [(2-6)²+(4-6)²+(6-6)²+(8-6)²+(10-6)²]/5 = (16+4+0+4+16)/5 = 40/5 = 8.", answer: "8" },
          { prompt: "Một mẫu số liệu có n=10 giá trị với tổng bình phương độ lệch so với trung bình là 90. Tính phương sai và độ lệch chuẩn.", solution: "Phương sai = 90/10 = 9.\nĐộ lệch chuẩn = √9 = 3.", answer: "3" },
          { prompt: "Mẫu có 5 giá trị: 3, 5, 7, 9, x với trung bình=6,4. Tìm x.", solution: "Tổng = 6,4×5=32. 3+5+7+9+x=32 → x=8.", answer: "8" },
          { prompt: "Mẫu có phương sai=16, trung bình=20. Tính hệ số biến thiên CV (=độ lệch chuẩn/trung bình×100%).", solution: "Độ lệch chuẩn=4. CV=4/20×100%=20%.", answer: "20%" },
          { prompt: "Hai mẫu A, B có n=10. Mẫu A có tổng bình phương độ lệch=180, mẫu B có 250. Mẫu nào đồng đều hơn?", solution: "Phương sai A=18, phương sai B=25.\nMẫu A có phương sai nhỏ hơn nên đồng đều hơn.", answer: "Mẫu A" },
          { prompt: "Mẫu ghép nhóm: [0,10) tần số 3, [10,20) tần số 5, [20,30) tần số 2. Tính số trung bình.", solution: "Giá trị đại diện: 5, 15, 25.\nTB=(3×5+5×15+2×25)/10=(15+75+50)/10=14.", answer: "14" },
          { prompt: "Tìm khoảng tứ phân vị của mẫu: 2, 4, 6, 8, 10, 12, 14.", solution: "Trung vị=8. Q1=trung vị nửa dưới (2,4,6)=4. Q3=trung vị nửa trên (10,12,14)=12.\nKhoảng tứ phân vị = 12-4=8.", answer: "8" },
          { prompt: "Nếu cộng thêm hằng số c=5 vào mỗi giá trị của mẫu, độ lệch chuẩn thay đổi thế nào?", solution: "Độ lệch chuẩn không đổi (phép tịnh tiến không ảnh hưởng độ phân tán).", answer: "Không đổi" },
          { prompt: "Mẫu 6 giá trị có trung bình 10. Thêm giá trị thứ 7 là 24. Tính trung bình mới.", solution: "Tổng 6 giá trị=60. Tổng 7 giá trị=84.\nTrung bình mới = 84/7 = 12.", answer: "12" },
        ],
      },
      {
        id: "phuong-phap-toa-do-mat-phang-10",
        title: "Phương pháp tọa độ trong mặt phẳng",
        questions: [
          { prompt: "Phương trình tổng quát của đường thẳng có dạng nào?", options: ["ax+by+c=0", "ax²+by+c=0", "ax+by=c²", "y=ax²+b"], correct: 0, explain: "Đây là dạng phương trình tổng quát của đường thẳng trong mặt phẳng." },
          { prompt: "Đường thẳng d: 2x+y−3=0 có vectơ pháp tuyến là?", options: ["(2,1)", "(1,2)", "(-2,1)", "(2,-1)"], correct: 0, explain: "Vectơ pháp tuyến của đường thẳng ax+by+c=0 là (a,b) = (2,1)." },
          { prompt: "Đường tròn tâm I(a,b), bán kính R có phương trình chính tắc nào?", options: ["(x-a)²+(y-b)²=R²", "(x-a)²+(y-b)²=R", "x²+y²=R²", "ax+by=R"], correct: 0, explain: "Đây là phương trình chính tắc của đường tròn tâm I(a,b), bán kính R." },
          { prompt: "Đường tròn x²+y²−4x−6y+9=0 có tâm là điểm nào?", options: ["(2,3)", "(4,6)", "(-2,-3)", "(2,-3)"], correct: 0, explain: "Từ dạng x²-2ax+y²-2by+c=0, ta có 2a=4→a=2 và 2b=6→b=3, tâm là (2,3)." },
          { prompt: "Ba đường conic cơ bản trong chương trình gồm những đường nào?", options: ["Elip, hypebol, parabol", "Đường tròn, đường thẳng, tam giác", "Chỉ có đường tròn", "Chỉ có parabol"], correct: 0, explain: "Ba đường conic là elip, hypebol và parabol." },
          { prompt: "Khoảng cách từ điểm M(x₀,y₀) đến đường thẳng ax+by+c=0 tính bằng công thức nào?", options: ["|ax₀+by₀+c| / √(a²+b²)", "ax₀+by₀+c", "√(a²+b²)", "(ax₀+by₀+c)²"], correct: 0, explain: "Đây là công thức tính khoảng cách từ một điểm đến một đường thẳng." },
        ],
        exercises: [
          { prompt: "Viết phương trình đường thẳng đi qua hai điểm A(1,2) và B(3,6).", solution: "Vectơ chỉ phương AB=(2,4), suy ra vectơ pháp tuyến có thể lấy là (4,-2) hay (2,-1).\nPhương trình: 2(x-1)-1(y-2)=0 → 2x-y=0.", answer: "0" },
          { prompt: "Tính khoảng cách từ điểm M(1,1) đến đường thẳng 3x+4y−5=0.", solution: "d = |3×1+4×1-5| / √(9+16) = |2|/5 = 0,4.", answer: "0,4" },
          { prompt: "Đường tròn có phương trình x²+y²−2x+4y−4=0. Tìm tâm và bán kính.", solution: "Đưa về dạng chuẩn: (x-1)²+(y+2)²=1+4+4=9.\nTâm I(1,-2), bán kính R=3.", answer: "3" },
          { prompt: "Viết phương trình đường thẳng đi qua A(2,3) và song song với đường thẳng y=2x+1.", solution: "Hệ số góc của đường thẳng cần tìm cũng là 2 (vì song song).\nPT: y-3=2(x-2) → y=2x-1.", answer: "2x-1" },
          { prompt: "Tìm giao điểm của hai đường thẳng x+y=3 và x−y=1.", solution: "Cộng hai phương trình: 2x=4 → x=2.\nThay vào: y=3-2=1.\nGiao điểm là (2;1).", answer: "Giao điểm là (2;1)" },
          { prompt: "Viết phương trình đường tròn tâm I(3,4) đi qua gốc tọa độ.", solution: "Bán kính R = OI = √(3²+4²) = 5.\nPT: (x-3)²+(y-4)²=25.", answer: "25" },
          { prompt: "Tính khoảng cách giữa hai điểm A(1,2) và B(4,6).", solution: "AB = √((4-1)²+(6-2)²) = √(9+16) = √25 = 5.", answer: "5" },
          { prompt: "Viết phương trình đường thẳng vuông góc với y=3x+1 và đi qua điểm (0,2).", solution: "Hệ số góc vuông góc với 3 là -1/3.\nPT: y = -x/3 + 2.", answer: "-x/3 + 2" },
          { prompt: "Xác định vị trí tương đối của đường thẳng x+y=5 và đường tròn tâm O bán kính 3.", solution: "Khoảng cách từ O(0,0) đến đường thẳng x+y-5=0 là |-5|/√2 ≈ 3,54 > 3.\nVậy đường thẳng không cắt đường tròn.", answer: "đường thẳng không cắt đường tròn" },
          { prompt: "Viết phương trình đường thẳng đi qua hai điểm (0,0) và (3,4).", solution: "Hệ số góc = 4/3. PT: y = (4/3)x.", answer: "(4/3)x" },
        ],
        advanced: [
          { prompt: "Viết phương trình đường tròn ngoại tiếp tam giác vuông tại A với A(0,0), B(6,0), C(0,8).", solution: "Tâm đường tròn ngoại tiếp tam giác vuông là trung điểm cạnh huyền BC: I=(3;4).\nBán kính = BC/2 = √(36+64)/2 = 10/2 = 5.\nPT: (x-3)²+(y-4)²=25.", answer: "25" },
          { prompt: "Tìm điểm đối xứng của điểm A(2,3) qua đường thẳng y=x.", solution: "Đối xứng qua đường thẳng y=x tương ứng với việc hoán đổi tọa độ: A'(3;2).", answer: "A'(3;2)" },
          { prompt: "Cho hai đường thẳng d₁: 2x−y+1=0 và d₂: x+y−4=0. Tìm giao điểm của d₁ và d₂.", solution: "Từ d₁: y=2x+1. Thay vào d₂: x+(2x+1)-4=0 → 3x=3 → x=1.\ny=2(1)+1=3.\nGiao điểm: (1;3).", answer: "Giao điểm: (1;3)" },
          { prompt: "Viết phương trình đường thẳng qua điểm (2,−1) có hệ số góc −3.", solution: "y-(-1)=-3(x-2) → y+1=-3x+6 → y=-3x+5.", answer: "y=-3x+5" },
          { prompt: "Tìm tâm và bán kính đường tròn: x²+y²−4x+6y−3=0.", solution: "Đưa về dạng chuẩn: (x-2)²+(y+3)²=3+4+9=16.\nTâm (2;-3), bán kính 4.", answer: "Tâm (2;-3), R=4" },
          { prompt: "Viết phương trình đường thẳng qua giao điểm của x+y=3, x−y=1 và vuông góc với y=2x.", solution: "Giao điểm: cộng 2 pt được x=2, y=1. Điểm (2;1).\nVuông góc y=2x có hệ số góc -1/2: y-1=-1/2(x-2) → y=-x/2+2.", answer: "y=-x/2+2" },
          { prompt: "Tính khoảng cách từ gốc tọa độ đến đường thẳng 3x+4y−10=0.", solution: "d=|3(0)+4(0)-10|/√(9+16)=10/5=2.", answer: "2" },
          { prompt: "Viết phương trình đường tròn tâm (1,2) tiếp xúc với trục hoành.", solution: "Bán kính = khoảng cách từ tâm đến trục hoành = 2.\nPT: (x-1)²+(y-2)²=4.", answer: "(x-1)²+(y-2)²=4" },
          { prompt: "Tìm giao điểm của đường thẳng x−y+1=0 với đường tròn x²+y²=25.", solution: "y=x+1. Thay: x²+(x+1)²=25 → 2x²+2x-24=0 → x²+x-12=0 → x=3 hoặc x=-4.\nTại x=3: y=4. Tại x=-4: y=-3. Giao điểm (3;4) và (-4;-3).", answer: "(3;4) và (-4;-3)" },
          { prompt: "Cho A(1,1), B(5,1), C(5,4). Tính diện tích tam giác ABC.", solution: "AB nằm ngang dài 4, BC nằm dọc dài 3, tam giác vuông tại B.\nDiện tích = ½×4×3 = 6.", answer: "6" },
        ],
      },
      {
        id: "dai-so-to-hop-10",
        title: "Đại số tổ hợp",
        questions: [
          { prompt: "Quy tắc cộng áp dụng khi nào?", options: ["Công việc thực hiện theo 1 trong nhiều phương án riêng biệt", "Công việc hoàn thành qua nhiều giai đoạn liên tiếp", "Không có quy tắc nào áp dụng được", "Chỉ dùng cho phép nhân"], correct: 0, explain: "Quy tắc cộng dùng khi có nhiều phương án riêng biệt, chỉ chọn một trong số đó." },
          { prompt: "Quy tắc nhân áp dụng khi nào?", options: ["Công việc hoàn thành qua nhiều giai đoạn liên tiếp", "Chỉ có 1 giai đoạn duy nhất", "Không áp dụng được trong thực tế", "Chỉ dùng cho quy tắc cộng"], correct: 0, explain: "Quy tắc nhân dùng khi công việc phải hoàn thành qua nhiều giai đoạn nối tiếp nhau." },
          { prompt: "Số hoán vị của n phần tử là?", options: ["n!", "n", "n²", "2n"], correct: 0, explain: "Số cách sắp xếp n phần tử khác nhau là n giai thừa (n!)." },
          { prompt: "Số chỉnh hợp chập k của n phần tử thường ký hiệu là gì?", options: ["A(n,k)", "C(n,k)", "P(n)", "n!"], correct: 0, explain: "Chỉnh hợp chập k của n phần tử ký hiệu là A(n,k) hay Aₙᵏ." },
          { prompt: "Tính 4! = ?", options: ["24", "12", "16", "10"], correct: 0, explain: "4! = 4×3×2×1 = 24." },
          { prompt: "Số tổ hợp chập k của n phần tử tính bằng công thức nào?", options: ["n! / (k!(n-k)!)", "n! / k!", "n! × k!", "n! - k!"], correct: 0, explain: "Công thức tổ hợp: C(n,k) = n! / (k!(n-k)!)." },
        ],
        exercises: [
          { prompt: "Có bao nhiêu cách sắp xếp 5 quyển sách khác nhau trên một kệ?", solution: "Số cách sắp xếp n phần tử khác nhau = n!\n5! = 5×4×3×2×1 = 120 cách.", answer: "120 cách" },
          { prompt: "Từ 5 chữ số 1,2,3,4,5, tạo được bao nhiêu số có 3 chữ số khác nhau?", solution: "Đây là bài toán chỉnh hợp: A(5,3) = 5×4×3 = 60.", answer: "60" },
          { prompt: "Có bao nhiêu cách chọn 3 học sinh từ một nhóm 10 học sinh (không kể thứ tự)?", solution: "Đây là bài toán tổ hợp: C(10,3) = 10!/(3!×7!) = (10×9×8)/(3×2×1) = 120.", answer: "120" },
          { prompt: "Có bao nhiêu cách xếp 4 học sinh vào 4 chỗ ngồi khác nhau?", solution: "Đây là số hoán vị của 4 phần tử: 4! = 24 cách.", answer: "24 cách" },
          { prompt: "Từ 6 người, chọn ra một nhóm 4 người (không kể thứ tự). Có bao nhiêu cách?", solution: "C(6,4) = 6!/(4!×2!) = 15 cách.", answer: "15 cách" },
          { prompt: "Có bao nhiêu số có 2 chữ số khác nhau lập được từ các chữ số 1, 2, 3, 4, 5?", solution: "A(5,2) = 5×4 = 20.", answer: "20" },
          { prompt: "Tính C(7,3).", solution: "C(7,3) = 7!/(3!×4!) = (7×6×5)/(3×2×1) = 35.", answer: "35" },
          { prompt: "Một đội bóng có 11 cầu thủ, chọn ra đội trưởng và đội phó (2 vai trò khác nhau). Có bao nhiêu cách?", solution: "A(11,2) = 11×10 = 110 cách.", answer: "110 cách" },
          { prompt: "Có bao nhiêu cách chọn 3 quyển sách khác nhau từ 8 quyển để tặng 3 người khác nhau (mỗi người 1 quyển)?", solution: "A(8,3) = 8×7×6 = 336 cách.", answer: "336 cách" },
          { prompt: "Tính 6!/(4!×2!).", solution: "6!/(4!×2!) = 720/(24×2) = 15.", answer: "15" },
        ],
        advanced: [
          { prompt: "Có bao nhiêu cách xếp 5 học sinh (trong đó có 2 bạn A, B) thành một hàng sao cho A và B luôn đứng cạnh nhau?", solution: "Ghép A, B thành một nhóm (có 2 cách xếp trong nhóm: AB hoặc BA), coi như 1 phần tử cùng 3 học sinh còn lại → 4 phần tử: 4!=24 cách.\nTổng số cách = 24×2 = 48.", answer: "48" },
          { prompt: "Một hộp có 5 bi đỏ, 3 bi xanh. Chọn ra 3 bi sao cho có ít nhất 1 bi đỏ. Có bao nhiêu cách?", solution: "Tổng số cách chọn 3 bi từ 8: C(8,3)=56.\nCách chọn không có bi đỏ nào (toàn bi xanh, chỉ có 3 bi xanh): C(3,3)=1.\nSố cách có ít nhất 1 bi đỏ = 56-1 = 55.", answer: "55" },
          { prompt: "Tính hệ số của x³ trong khai triển (x+2)⁵.", solution: "Số hạng tổng quát: C(5,k)·x^(5-k)·2^k. Cần 5-k=3 → k=2.\nHệ số = C(5,2)×2² = 10×4 = 40.", answer: "40" },
          { prompt: "Có bao nhiêu cách xếp 6 học sinh vào 6 ghế thành hàng sao cho 2 bạn A, B luôn ngồi cạnh nhau?", solution: "Ghép A, B thành 1 khối (2 cách hoán vị trong khối), cùng 4 bạn còn lại: 5 phần tử.\n5!=120 cách xếp. Tổng = 120×2 = 240.", answer: "240" },
          { prompt: "Từ 10 người, chọn 1 trưởng ban, 1 phó ban, và 3 thành viên (không phân biệt vai trò trong 3 người). Có bao nhiêu cách?", solution: "Chọn trưởng: 10 cách. Chọn phó: 9 cách. Chọn 3 thành viên từ 8 người còn lại: C(8,3)=56.\nTổng = 10×9×56 = 5040.", answer: "5040" },
          { prompt: "Có bao nhiêu số tự nhiên có 5 chữ số khác nhau từ {0,1,2,3,4,5} chia hết cho 5?", solution: "TH tận cùng 0: 4 chữ số đầu chọn từ 5 số còn lại: A(5,4)=120.\nTH tận cùng 5: chữ số đầu có 4 cách (khác 0,5), 3 chữ số giữa: A(4,3)=24, tổng=4×24=96.\nTổng cộng = 120+96 = 216.", answer: "216" },
          { prompt: "Tính hệ số của x³ trong khai triển (x−2)⁶.", solution: "Số hạng tổng quát: C(6,k)x^(6-k)(-2)^k. Cần 6-k=3 → k=3.\nHệ số = C(6,3)×(-2)³ = 20×(-8) = -160.", answer: "-160" },
          { prompt: "Từ các số 1,2,3,4,5, lập được bao nhiêu số tự nhiên có 3 chữ số (có thể lặp lại)?", solution: "Mỗi vị trí có 5 lựa chọn: 5³ = 125.", answer: "125" },
          { prompt: "Có bao nhiêu cách sắp xếp các chữ cái trong từ \"TOAN\" (4 chữ cái khác nhau)?", solution: "4! = 24.", answer: "24" },
          { prompt: "Có bao nhiêu cách chọn đội bóng 11 người từ 15 cầu thủ, trong đó phải chọn đúng 1 trong 2 thủ môn có sẵn?", solution: "Chọn thủ môn: 2 cách. Chọn 10 cầu thủ từ 13 người còn lại: C(13,10)=C(13,3)=286.\nTổng = 2×286 = 572.", answer: "572" },
        ],
      },
      {
        id: "xac-suat-co-dien-10",
        title: "Tính xác suất theo định nghĩa cổ điển",
        questions: [
          { prompt: "Xác suất theo định nghĩa cổ điển của biến cố A tính bằng?", options: ["n(A) / n(Ω)", "n(Ω) / n(A)", "n(A) × n(Ω)", "n(A) - n(Ω)"], correct: 0, explain: "Xác suất cổ điển: P(A) = n(A)/n(Ω), với n(Ω) là số phần tử không gian mẫu." },
          { prompt: "Không gian mẫu khi gieo một đồng xu 2 lần có bao nhiêu phần tử?", options: ["4", "2", "8", "16"], correct: 0, explain: "Các kết quả: SS, SN, NS, NN — 4 phần tử." },
          { prompt: "Xác suất của biến cố chắc chắn bằng?", options: ["1", "0", "0,5", "Không xác định"], correct: 0, explain: "Biến cố chắc chắn luôn xảy ra nên xác suất bằng 1." },
          { prompt: "Gieo 1 xúc xắc, xác suất ra số nguyên tố (2, 3, 5) là?", options: ["1/2", "1/3", "1/6", "2/3"], correct: 0, explain: "Có 3 số nguyên tố trong 6 kết quả: xác suất = 3/6 = 1/2." },
          { prompt: "Hai biến cố A và B gọi là xung khắc khi nào?", options: ["Không thể đồng thời xảy ra", "Luôn đồng thời xảy ra", "Có xác suất bằng nhau", "Không liên quan gì đến nhau"], correct: 0, explain: "Hai biến cố xung khắc là hai biến cố không thể cùng xảy ra trong một phép thử." },
          { prompt: "Nếu A và B là hai biến cố xung khắc thì P(A∪B) = ?", options: ["P(A) + P(B)", "P(A) × P(B)", "P(A) - P(B)", "P(A) / P(B)"], correct: 0, explain: "Với hai biến cố xung khắc, xác suất hợp bằng tổng hai xác suất thành phần." },
        ],
        exercises: [
          { prompt: "Gieo 2 xúc xắc, tính xác suất tổng 2 mặt bằng 8.", solution: "Các cặp thỏa mãn: (2,6),(3,5),(4,4),(5,3),(6,2) → 5 kết quả trong 36.\nXác suất = 5/36.", answer: "5/36" },
          { prompt: "Một hộp có 4 bi đỏ, 6 bi xanh. Lấy ngẫu nhiên 2 bi cùng lúc, tính xác suất cả 2 đều đỏ.", solution: "Xác suất = C(4,2)/C(10,2) = 6/45 = 2/15.", answer: "2/15" },
          { prompt: "Rút 1 lá bài từ bộ 52 lá, tính xác suất được lá cơ hoặc lá rô (26 lá màu đỏ).", solution: "Xác suất = 26/52 = 1/2.", answer: "1/2" },
          { prompt: "Một hộp có 5 bi đỏ, 3 bi xanh, 2 bi vàng. Lấy ngẫu nhiên 1 bi, tính xác suất không phải bi vàng.", solution: "Tổng = 10 bi. Không vàng = 8 bi.\nXác suất = 8/10 = 4/5.", answer: "4/5" },
          { prompt: "Gieo 1 xúc xắc, tính xác suất ra số không phải số 6.", solution: "Xác suất = 5/6 (5 kết quả không phải 6 trong 6 kết quả).", answer: "6" },
          { prompt: "Hai xúc xắc gieo cùng lúc. Tính xác suất được 2 mặt giống nhau.", solution: "Có 6 cặp giống nhau: (1,1),(2,2),...,(6,6) trong 36 kết quả.\nXác suất = 6/36 = 1/6.", answer: "1/6" },
          { prompt: "Chọn ngẫu nhiên 1 số từ 1 đến 100, tính xác suất số đó là số chính phương (1,4,9,...,100 — có 10 số).", solution: "Xác suất = 10/100 = 1/10.", answer: "1/10" },
          { prompt: "Một lớp có 20 nam, 15 nữ, chọn ngẫu nhiên 1 nhóm 3 người. Tính xác suất cả 3 đều nữ.", solution: "Xác suất = C(15,3)/C(35,3) = 455/6545 ≈ 0,0695.", answer: "455/6545 ≈ 0,0695" },
          { prompt: "Tính xác suất gieo 3 đồng xu được ít nhất 1 mặt ngửa.", solution: "P(không có mặt ngửa nào) = 1/8.\nP(ít nhất 1 ngửa) = 1-1/8 = 7/8.", answer: "7/8" },
          { prompt: "Từ bộ 52 lá bài, tính xác suất rút được lá cơ (13 lá).", solution: "Xác suất = 13/52 = 1/4.", answer: "1/4" },
        ],
        advanced: [
          { prompt: "Một lớp có 20 học sinh gồm 12 nam, 8 nữ. Chọn ngẫu nhiên 1 nhóm 5 học sinh. Tính xác suất nhóm có đúng 3 nam.", solution: "Tổng số cách chọn: C(20,5)=15504.\nSố cách chọn 3 nam (trong 12) và 2 nữ (trong 8): C(12,3)×C(8,2)=220×28=6160.\nXác suất = 6160/15504 ≈ 0,397.", answer: "6160/15504 ≈ 0,397" },
          { prompt: "Gieo 3 xúc xắc, tính xác suất tổng 3 mặt bằng 4.", solution: "Chỉ có bộ (1,1,2) và các hoán vị của nó thỏa mãn tổng=4: có 3 cách sắp xếp vị trí số 2.\nKhông gian mẫu = 6³=216.\nXác suất = 3/216 = 1/72.", answer: "1/72" },
          { prompt: "Một hộp có 10 tấm thẻ đánh số 1-10. Rút 2 thẻ cùng lúc, tính xác suất tổng 2 số ghi trên thẻ là số chẵn.", solution: "Tổng chẵn khi cả 2 cùng chẵn hoặc cả 2 cùng lẻ. Có 5 số chẵn, 5 số lẻ.\nSố cách: C(5,2)+C(5,2)=10+10=20.\nTổng số cách chọn 2 từ 10: C(10,2)=45.\nXác suất = 20/45 = 4/9.", answer: "4/9" },
          { prompt: "Một hộp có 6 bi đỏ, 4 bi xanh. Lấy ngẫu nhiên 3 bi. Tính xác suất có ít nhất 2 bi đỏ.", solution: "P(2 đỏ)=C(6,2)C(4,1)/C(10,3)=15×4/120=1/2.\nP(3 đỏ)=C(6,3)/C(10,3)=20/120=1/6.\nP(ít nhất 2 đỏ)=1/2+1/6=2/3.", answer: "2/3" },
          { prompt: "Gieo 2 xúc xắc, tính xác suất tích 2 số chấm ≥20.", solution: "Các cặp có tích≥20: (4,5),(5,4),(4,6),(6,4),(5,5),(5,6),(6,5),(6,6) → 8 cặp.\nXác suất = 8/36 = 2/9.", answer: "2/9" },
          { prompt: "Ba xạ thủ bắn vào 1 mục tiêu, xác suất trúng mỗi người là 0,5. Tính xác suất có đúng 2 người trúng.", solution: "C(3,2)×(0,5)²×(0,5) = 3×0,25×0,5 = 0,375.", answer: "0,375" },
          { prompt: "Một túi có thẻ đánh số 1-9. Rút ngẫu nhiên 2 thẻ. Tính xác suất tích 2 số là số lẻ.", solution: "Tích lẻ khi cả 2 số đều lẻ. Số lẻ trong 1-9: 5 số.\nXác suất = C(5,2)/C(9,2) = 10/36 = 5/18.", answer: "5/18" },
          { prompt: "Gieo 4 đồng xu, tính xác suất có ít nhất 1 mặt ngửa.", solution: "P(không có ngửa nào) = (1/2)⁴ = 1/16.\nP(ít nhất 1 ngửa) = 1-1/16 = 15/16.", answer: "15/16" },
          { prompt: "Một hộp có 5 bi đánh số 1-5. Lấy đồng thời 3 bi. Tính xác suất tổng 3 số bằng 9.", solution: "Các bộ 3 số phân biệt từ 1-5 có tổng=9: {1,3,5} và {2,3,4} → 2 bộ.\nTổng số cách chọn 3 từ 5: C(5,3)=10.\nXác suất = 2/10 = 1/5.", answer: "1/5" },
          { prompt: "Một lớp 24 học sinh có 6 bạn giỏi Toán. Chọn ngẫu nhiên 4 bạn. Tính xác suất có đúng 2 bạn giỏi Toán.", solution: "C(6,2)×C(18,2)/C(24,4) = 15×153/10626 = 2295/10626 ≈ 0,216.", answer: "≈0,216" },
        ],
      },
    ],
    examTopics: [
      {
        id: "de-giua-hk1-10-thpt-luong-dac-bang",
        title: "Đề giữa HK1 (đề thi thật)",
        source: "THPT Lương Đắc Bằng – Thanh Hóa, năm học 2024–2025",
        questions: [
          { prompt: "Cho tam giác ABC với BC=a, AC=b, AB=c và S là diện tích tam giác ABC. Khẳng định nào sau đây đúng?", options: ["S = ½bc·sinA", "S = ½bc·sinB", "S = ½ac·sinA", "S = ½bc·sinC"], correct: 0, explain: "Công thức diện tích tam giác theo hai cạnh và góc xen giữa: S = ½·AB·AC·sinA = ½bc·sinA." },
          { prompt: "Cho sinα = 1/3 và 90° < α < 180°. Tính cosα.", options: ["2/3", "-2/3", "-2√2/3", "2√2/3"], correct: 2, explain: "cos²α = 1 − sin²α = 8/9. Vì α là góc tù (90°–180°) nên cosα âm: cosα = -2√2/3." },
          { prompt: "Bất phương trình nào sau đây KHÔNG phải là bất phương trình bậc nhất hai ẩn?", options: ["y − 2 ≤ 0", "x + y > 3", "x + y ≤ 2024", "(x+y)(x-y) ≥ 3"], correct: 3, explain: "Khai triển (x+y)(x-y) = x²-y², chứa bậc 2 nên không phải bất phương trình bậc nhất hai ẩn." },
          { prompt: "Cho S = {7,2,8,4,9,12} và T = {1,3,7,4}. Tìm S∩T.", options: ["{4,7}", "{1,2,3,4,8,9,7,12}", "{1,3}", "{2,8,9,12}"], correct: 0, explain: "Giao hai tập hợp là các phần tử chung: chỉ 4 và 7 xuất hiện ở cả S và T." },
          { prompt: "Cho α là góc tù. Mệnh đề nào sau đây đúng?", options: ["cosα > 0", "tanα < 0", "sinα < 0", "cotα > 0"], correct: 1, explain: "Góc tù có sinα > 0, cosα < 0, nên tanα = sinα/cosα < 0." },
          { prompt: "Cho X = (-∞;2] ∩ (-6;+∞). Khẳng định nào sau đây đúng?", options: ["X = (-∞;+∞)", "X = (-6;2]", "X = (-∞;2]", "X = (-6;+∞)"], correct: 1, explain: "Giao của hai khoảng lấy phần chung: lớn hơn -6 và nhỏ hơn hoặc bằng 2, tức (-6;2]." },
          { prompt: "Tam giác ABC có góc B=60°, góc C=45°, AB=5. Tính độ dài cạnh AC.", options: ["AC = 10", "AC = 5√6/2", "AC = 5√2", "AC = 5√3"], correct: 1, explain: "Theo định lý sin: AC/sinB = AB/sinC, suy ra AC = 5·sin60°/sin45° = 5√6/2." },
          { prompt: "Cho mệnh đề \"∀x∈ℝ, x²-7x+10<0\". Mệnh đề phủ định là?", options: ["∃x∈ℝ, x²-7x+10≥0", "∀x∈ℝ, x²-7x+10<0", "∃x∈ℝ, x²-7x+10<0", "∀x∈ℝ, x²-7x+10>0"], correct: 0, explain: "Phủ định của \"∀x, P(x)\" là \"∃x, không P(x)\": đổi ∀ thành ∃ và đổi < thành ≥." },
        ],
      },
    ],
    examSources: [
      { label: "Đề giữa HK1 – TOANMATH.com", url: "https://toanmath.com/de-thi-giua-hk1-toan-10" },
      { label: "Đề HK1 – TOANMATH.com", url: "https://toanmath.com/de-thi-hk1-toan-10" },
      { label: "Đề giữa HK2 – TOANMATH.com", url: "https://toanmath.com/de-thi-giua-hk2-toan-10" },
      { label: "Đề HK2 – TOANMATH.com", url: "https://toanmath.com/de-thi-hk2-toan-10" },
      { label: "Đề khảo sát chất lượng – TOANMATH.com", url: "https://toanmath.com/khao-sat-chat-luong-toan-10" },
      { label: "Đề học sinh giỏi – TOANMATH.com", url: "https://toanmath.com/de-thi-hsg-toan-10" },
      { label: "Tài liệu học tập lớp 10 – Nguyễn Bảo Vương", url: "https://www.toannbv.vn/search/label/T%C3%A0i%20Li%E1%BB%87u%20H%E1%BB%8Dc%20T%E1%BA%ADp%2010" },
      { label: "Đề thi giữa/cuối kỳ (nhiều khối) – Nguyễn Bảo Vương", url: "https://www.toannbv.vn/search/label/%C4%90%E1%BB%81%20Thi%20Gi%E1%BB%AFa%20HK1" },
    ],
  },
  {
    id: 11,
    label: "Lớp 11",
    topics: [
      {
        id: "csc-csn-11",
        title: "Cấp số cộng & cấp số nhân",
        questions: [
          { prompt: "CSC có u₁=2, d=3. u₅ = ?", options: ["14", "17", "11", "20"], correct: 0, explain: "u₅ = u₁+4d = 2+12 = 14." },
          { prompt: "CSN có u₁=3, q=2. u₄ = ?", options: ["24", "18", "12", "48"], correct: 0, explain: "u₄ = u₁×q³ = 3×8 = 24." },
          { prompt: "Tổng 5 số hạng đầu CSC u₁=1, d=2 là?", options: ["25", "20", "15", "30"], correct: 0, explain: "S₅ = 5/2×(2×1+4×2) = 5/2×10 = 25." },
          { prompt: "Công bội của CSN 2, 6, 18, 54 là?", options: ["3", "2", "4", "6"], correct: 0, explain: "6/2=3, 18/6=3 — công bội q=3." },
          { prompt: "Công sai của CSC 5, 8, 11, 14 là?", options: ["3", "2", "4", "5"], correct: 0, explain: "Mỗi số hạng hơn số trước 3 đơn vị." },
          { prompt: "CSN có u₁=1, q=1/2. u₃ = ?", options: ["1/4", "1/2", "1/8", "2"], correct: 0, explain: "u₃ = u₁×q² = 1×1/4 = 1/4." },
        ],
        exercises: [
          { prompt: "CSC có u₁=5, d=4. Tính u₁₀.", solution: "u₁₀ = u₁+9d = 5+36 = 41.", answer: "41" },
          { prompt: "CSN có u₁=2, q=3. Tính tổng 5 số hạng đầu.", solution: "S₅ = u₁(q⁵-1)/(q-1) = 2(243-1)/2 = 242.", answer: "242" },
          { prompt: "Tìm công sai d biết CSC có u₃=11, u₇=23.", solution: "u₇-u₃ = 4d = 23-11 = 12 → d=3.", answer: "3" },
          { prompt: "CSC có u₁=3, u₅=19. Tìm công sai d.", solution: "u₅=u₁+4d → 19=3+4d → d=4.", answer: "4" },
          { prompt: "Tính tổng 10 số hạng đầu của CSC: 2, 5, 8, 11, ...", solution: "d=3. S₁₀ = 10/2×(2×2+9×3) = 5×(4+27) = 5×31 = 155.", answer: "155" },
          { prompt: "CSN có u₁=1, u₄=8. Tìm công bội q.", solution: "u₄=u₁×q³ → 8=q³ → q=2.", answer: "2" },
          { prompt: "Ba số x, y, z lập thành CSC theo thứ tự đó, biết y=7 và x+y+z=21. Tính x+z.", solution: "Vì y là số hạng giữa của CSC nên x+z=2y=14 (kiểm tra: x+y+z=14+7=21, đúng).", answer: "21, đúng)" },
          { prompt: "CSN có các số hạng dương, u₂=6, u₄=54. Tìm công bội q.", solution: "u₄/u₂ = q² = 54/6 = 9 → q=3 (lấy dương vì đề cho các số hạng dương).", answer: "3" },
          { prompt: "Tính tổng cấp số nhân lùi vô hạn: 3 + 1 + 1/3 + 1/9 + ...", solution: "u₁=3, q=1/3. S = u₁/(1-q) = 3/(2/3) = 4,5.", answer: "4,5" },
          { prompt: "CSC có tổng 6 số hạng đầu là 72, u₁=2. Tìm công sai d.", solution: "S₆ = 6/2×(2×2+5d) = 3×(4+5d) = 72 → 4+5d=24 → d=4.", answer: "4" },
        ],
        advanced: [
          { prompt: "Ba số x, y, z theo thứ tự lập thành CSC, biết x+y+z=27 và x²+y²+z²=293. Tìm x, y, z.", solution: "Vì y là số hạng giữa: x+z=2y. Từ x+y+z=3y=27 → y=9, x+z=18.\nx²+z²=293-81=212. (x+z)²=x²+2xz+z²=324 → 2xz=324-212=112 → xz=56.\nx, z là nghiệm của t²-18t+56=0 → t=(18±10)/2 → t=14 hoặc t=4.\nVậy (x,y,z)=(4,9,14) hoặc (14,9,4).", answer: "(4,9,14) hoặc (14,9,4)" },
          { prompt: "CSN có tổng vô hạn bằng 8, u₁=4. Tìm công bội q.", solution: "S = u₁/(1-q) = 8 → 4/(1-q)=8 → 1-q=0,5 → q=0,5.", answer: "0,5" },
          { prompt: "CSC có u₅=15, u₁₀=35. Tìm u₁ và công sai d.", solution: "u₁₀-u₅ = 5d = 35-15=20 → d=4.\nu₅=u₁+4d=15 → u₁=15-16=-1.", answer: "-1" },
          { prompt: "Tìm 3 số hạng đầu của CSC biết u₁+u₂+u₃=15 và u₁×u₂×u₃=80.", solution: "Đặt u₂=b: tổng=3b=15→b=5. Đặt u₁=5-d,u₃=5+d.\nTích=(5-d)(5)(5+d)=5(25-d²)=80→d²=9→d=3.\nBa số: 2, 5, 8.", answer: "2, 5, 8" },
          { prompt: "Cho CSN có u₃=12, u₆=96. Tìm u₁ và q.", solution: "u₆/u₃=q³=96/12=8 → q=2.\nu₃=u₁×q²=4u₁=12 → u₁=3.", answer: "u₁=3, q=2" },
          { prompt: "Tính tổng: 3+6+9+...+300.", solution: "Số hạng cuối=300, đầu=3, công sai=3. Số số hạng=(300-3)/3+1=100.\nTổng=100×(3+300)/2=15150.", answer: "15150" },
          { prompt: "Ba số theo thứ tự lập thành CSN có tổng=21 và tích=216. Tìm 3 số.", solution: "Đặt b là số giữa: tích=b³=216 → b=6. Tổng: a+c=15. Tích CSN: ac=b²=36.\na,c là nghiệm t²-15t+36=0 → t=12 hoặc t=3.\nBa số: 3, 6, 12.", answer: "3, 6, 12" },
          { prompt: "Cho dãy uₙ=3n−1. Chứng minh đây là CSC, tìm công sai và u₁₀.", solution: "uₙ₊₁-uₙ=3(n+1)-1-(3n-1)=3, hằng số, nên là CSC với d=3.\nu₁₀=3(10)-1=29.", answer: "d=3, u₁₀=29" },
          { prompt: "Tính tổng 10 số hạng đầu của CSN có u₁=2, q=3.", solution: "S₁₀=u₁(q¹⁰-1)/(q-1)=2(3¹⁰-1)/2=3¹⁰-1=59049-1=59048.", answer: "59048" },
          { prompt: "Một CSC có tổng 10 số hạng đầu bằng 110, u₁=2. Tìm công sai d.", solution: "S₁₀=5(4+9d)=110 → 4+9d=22 → d=2.", answer: "2" },
        ],
      },
      {
        id: "gioi-han-11",
        title: "Giới hạn dãy số",
        questions: [
          { prompt: "lim(1/n) khi n→∞ = ?", options: ["0", "1", "∞", "Không tồn tại"], correct: 0, explain: "Khi n càng lớn, 1/n càng gần 0." },
          { prompt: "lim((2n+1)/n) khi n→∞ = ?", options: ["2", "1", "0", "∞"], correct: 0, explain: "Chia cả tử và mẫu cho n: (2+1/n)/1 → 2." },
          { prompt: "lim(n²/n) khi n→∞ = ?", options: ["+∞", "0", "1", "Không tồn tại"], correct: 0, explain: "n²/n = n, mà n→∞ nên giới hạn là +∞ (không hữu hạn)." },
          { prompt: "lim((3n+2)/(2n+1)) khi n→∞ = ?", options: ["3/2", "2/3", "1", "0"], correct: 0, explain: "Chia tử mẫu cho n, các số hạng chứa 1/n triệt tiêu, còn lại 3/2." },
          { prompt: "Dãy (1/2)ⁿ có giới hạn bằng?", options: ["0", "1", "1/2", "∞"], correct: 0, explain: "Vì |1/2|<1 nên (1/2)ⁿ dần về 0 khi n tăng." },
          { prompt: "lim((n+1)/n²) khi n→∞ = ?", options: ["0", "1", "∞", "1/2"], correct: 0, explain: "Bậc mẫu cao hơn bậc tử nên giới hạn bằng 0." },
        ],
        exercises: [
          { prompt: "Tính lim(1/n²) khi n→∞.", solution: "Khi n càng lớn, 1/n² càng gần 0. Vậy giới hạn bằng 0.", answer: "0." },
          { prompt: "Tính lim (5n−3)/(2n+1) khi n→∞.", solution: "Chia tử và mẫu cho n: (5-3/n)/(2+1/n) → 5/2.", answer: "(5-3/n)/(2+1/n) → 5/2" },
          { prompt: "Tính lim (n²+1)/(2n²−3) khi n→∞.", solution: "Chia tử mẫu cho n²: (1+1/n²)/(2-3/n²) → 1/2.", answer: "(1+1/n²)/(2-3/n²) → 1/2" },
          { prompt: "Tính lim (√(n+1) − √n) khi n→∞.", solution: "Nhân liên hợp: (√(n+1)-√n)(√(n+1)+√n)/(√(n+1)+√n) = 1/(√(n+1)+√n) → 0 khi n→∞.", answer: "1/(√(n+1)+√n) → 0 khi n→∞" },
          { prompt: "Tính tổng cấp số nhân lùi vô hạn: 1 − 1/3 + 1/9 − 1/27 + ...", solution: "u₁=1, q=-1/3. S = u₁/(1-q) = 1/(1+1/3) = 1/(4/3) = 3/4.", answer: "3/4" },
          { prompt: "Tính lim (2ⁿ)/(3ⁿ) khi n→∞.", solution: "= (2/3)ⁿ. Vì |2/3|<1 nên giới hạn bằng 0.", answer: "(2/3)ⁿ. Vì |2/3|<1 nên giới hạn bằng 0" },
          { prompt: "Tính lim (n³−2n)/(3n³+1) khi n→∞.", solution: "Chia tử mẫu cho n³: (1-2/n²)/(3+1/n³) → 1/3.", answer: "(1-2/n²)/(3+1/n³) → 1/3" },
          { prompt: "Tính lim (3n+1)/n² khi n→∞.", solution: "Chia tử mẫu cho n²: (3/n+1/n²) → 0.", answer: "Chia tử mẫu cho n²: (3/n+1/n²) → 0" },
          { prompt: "Cho dãy uₙ=(−1)ⁿ/n. Tính lim uₙ khi n→∞.", solution: "|uₙ|=1/n → 0, mà (-1)ⁿ chỉ đổi dấu nên uₙ→0.", answer: "1/n → 0, mà (-1)ⁿ chỉ đổi dấu nên uₙ→0" },
          { prompt: "Tính lim (4n²−3n+2)/(n²+5) khi n→∞.", solution: "Chia tử mẫu cho n²: (4-3/n+2/n²)/(1+5/n²) → 4.", answer: "(4-3/n+2/n²)/(1+5/n²) → 4" },
        ],
        advanced: [
          { prompt: "Tính lim (√(n²+n) − n) khi n→∞.", solution: "Nhân liên hợp: (n²+n-n²)/(√(n²+n)+n) = n/(√(n²+n)+n).\nChia cả tử mẫu cho n: 1/(√(1+1/n)+1) → 1/(1+1) = 1/2.", answer: "1/2" },
          { prompt: "Tính tổng cấp số nhân lùi vô hạn: 1/2 + 1/4 + 1/8 + ...", solution: "u₁=1/2, q=1/2.\nS = (1/2)/(1-1/2) = 1.", answer: "1" },
          { prompt: "Tính lim (2ⁿ+3ⁿ)/3ⁿ khi n→∞.", solution: "= (2/3)ⁿ + 1.\nVì |2/3|<1 nên (2/3)ⁿ→0, do đó giới hạn → 0+1 = 1.", answer: "1" },
          { prompt: "Tính lim (3n³−2n+1)/(2n³+5) khi n→∞.", solution: "Chia tử mẫu cho n³: (3-2/n²+1/n³)/(2+5/n³) → 3/2.", answer: "3/2" },
          { prompt: "Tính lim (√(n+1)−√n) khi n→∞.", solution: "Nhân liên hợp: (n+1-n)/(√(n+1)+√n) = 1/(√(n+1)+√n) → 0.", answer: "0" },
          { prompt: "Tính tổng cấp số nhân lùi vô hạn: 5−5/3+5/9−5/27+...", solution: "u₁=5, q=-1/3.\nS = 5/(1-(-1/3)) = 5/(4/3) = 15/4.", answer: "15/4" },
          { prompt: "Tính lim [(1+2+...+n)/n²] khi n→∞.", solution: "Tử = n(n+1)/2. Biểu thức = n(n+1)/(2n²) = (n+1)/(2n) = 1/2+1/(2n) → 1/2.", answer: "1/2" },
          { prompt: "Cho dãy uₙ với u₁=1, uₙ₊₁=uₙ/2+1. Giả sử dãy hội tụ về L, tìm L.", solution: "Nếu dãy hội tụ về L thì L=L/2+1 → L/2=1 → L=2.", answer: "2" },
          { prompt: "Tính lim (2n−√(4n²+1)) khi n→∞.", solution: "Nhân liên hợp: [(2n)²-(4n²+1)]/(2n+√(4n²+1)) = -1/(2n+√(4n²+1)) → 0.", answer: "0" },
          { prompt: "Một quả bóng thả từ độ cao 10m, mỗi lần nảy lên đạt 2/3 độ cao trước. Tính tổng quãng đường bóng di chuyển.", solution: "Quãng đường = 10 (rơi đầu) + 2×[10×(2/3)+10×(2/3)²+...] = 10 + 2×10×(2/3)/(1-2/3) = 10+40 = 50m.", answer: "50m" },
        ],
      },
      {
        id: "ham-so-luong-giac-11",
        title: "Hàm số lượng giác",
        questions: [
          { prompt: "Tập xác định của hàm số y=tanx là?", options: ["x ≠ π/2+kπ", "x ∈ ℝ", "x ≠ kπ", "x ≥ 0"], correct: 0, explain: "Hàm tanx không xác định khi cosx=0, tức x=π/2+kπ." },
          { prompt: "Chu kỳ của hàm số y=sinx là?", options: ["2π", "π", "π/2", "4π"], correct: 0, explain: "Hàm số sinx là hàm tuần hoàn với chu kỳ 2π." },
          { prompt: "Phương trình sinx=0 có nghiệm nào?", options: ["x = kπ", "x = π/2+kπ", "x = k2π", "x = π/4+kπ"], correct: 0, explain: "sinx=0 khi x là bội của π: x=kπ (k∈ℤ)." },
          { prompt: "Phương trình cosx=1 có nghiệm nào?", options: ["x = k2π", "x = kπ", "x = π+k2π", "x = π/2+kπ"], correct: 0, explain: "cosx=1 chỉ tại các điểm x=k2π." },
          { prompt: "Giá trị lớn nhất của hàm số y=sinx là?", options: ["1", "-1", "0", "2"], correct: 0, explain: "Hàm sinx có tập giá trị [-1;1], nên giá trị lớn nhất là 1." },
          { prompt: "Hàm số y=cosx là hàm số chẵn hay lẻ?", options: ["Hàm chẵn", "Hàm lẻ", "Không chẵn không lẻ", "Vừa chẵn vừa lẻ"], correct: 0, explain: "cos(-x)=cos(x) với mọi x, nên y=cosx là hàm số chẵn." },
        ],
        exercises: [
          { prompt: "Tìm tập xác định của hàm số y=1/cosx.", solution: "Cần cosx≠0, tức x≠π/2+kπ (k∈ℤ).", answer: "Cần cosx≠0, tức x≠π/2+kπ (k∈ℤ)" },
          { prompt: "Tính chu kỳ của hàm số y=cos(3x).", solution: "Chu kỳ của cos(ax) là 2π/|a|. Với a=3: T=2π/3.", answer: "2π/3" },
          { prompt: "Giải phương trình: cosx=0", solution: "x = π/2+kπ (k∈ℤ).", answer: "π/2+kπ (k∈ℤ)" },
          { prompt: "Giải phương trình: tanx=1", solution: "x = π/4+kπ (k∈ℤ).", answer: "π/4+kπ (k∈ℤ)" },
          { prompt: "Tính giá trị nhỏ nhất của hàm số y=cosx.", solution: "Hàm cosx có tập giá trị [-1;1], nên giá trị nhỏ nhất là -1.", answer: "-1." },
          { prompt: "Giải phương trình: sinx = √3/2", solution: "x = π/3+k2π hoặc x = 2π/3+k2π (k∈ℤ).", answer: "2π/3+k2π (k∈ℤ)" },
          { prompt: "Tính f(π/6) với f(x)=2sinx+1.", solution: "f(π/6) = 2×sin(π/6)+1 = 2×(1/2)+1 = 2.", answer: "2" },
          { prompt: "Hàm số y=tanx có tập giá trị là gì?", solution: "Hàm tanx nhận mọi giá trị thực, tập giá trị là ℝ.", answer: "Hàm tanx nhận mọi giá trị thực, tập giá trị là ℝ" },
          { prompt: "Giải phương trình: cos2x=1", solution: "2x=k2π → x=kπ (k∈ℤ).", answer: "kπ (k∈ℤ)" },
          { prompt: "Xét tính chẵn lẻ của hàm số y=sinx.", solution: "sin(-x)=-sin(x) với mọi x, nên y=sinx là hàm số lẻ.", answer: "sinx là hàm số lẻ" },
        ],
        advanced: [
          { prompt: "Giải phương trình: 2sin²x − 3sinx + 1 = 0", solution: "Đặt t=sinx: 2t²-3t+1=0 → (2t-1)(t-1)=0 → t=1/2 hoặc t=1.\nVới sinx=1/2: x=π/6+k2π hoặc x=5π/6+k2π.\nVới sinx=1: x=π/2+k2π.", answer: "π/2+k2π" },
          { prompt: "Tìm tập giá trị của hàm số y=2sinx+1.", solution: "Vì sinx∈[-1;1], nên 2sinx∈[-2;2], suy ra y=2sinx+1∈[-1;3].", answer: "2sinx+1∈[-1;3]" },
          { prompt: "Tính chu kỳ chung của hàm số y=sin(x/2)+cos(2x).", solution: "Chu kỳ của sin(x/2) là 4π. Chu kỳ của cos(2x) là π.\nChu kỳ chung là BCNN(4π, π) = 4π.", answer: "4π" },
          { prompt: "Giải phương trình: cos2x=cosx", solution: "2cos²x-1-cosx=0. Đặt t=cosx: 2t²-t-1=0 → (2t+1)(t-1)=0 → t=1 hoặc t=-1/2.\ncosx=1: x=k2π. cosx=-1/2: x=±2π/3+k2π.", answer: "x=k2π hoặc x=±2π/3+k2π" },
          { prompt: "Tìm GTLN, GTNN của hàm số y=3cosx−4sinx.", solution: "Viết dưới dạng Rcos(x+φ) với R=√(3²+4²)=5.\nGTLN=5, GTNN=-5.", answer: "GTLN=5, GTNN=-5" },
          { prompt: "Giải phương trình: sinx=1/2 trong khoảng [0,2π).", solution: "x=π/6 hoặc x=5π/6.", answer: "π/6 hoặc 5π/6" },
          { prompt: "Tính chu kỳ của hàm số y=tan(3x).", solution: "Chu kỳ hàm tan(kx) là π/k. Với k=3: chu kỳ=π/3.", answer: "π/3" },
          { prompt: "Xét tính chẵn lẻ của hàm số y=x×sinx.", solution: "f(-x)=(-x)sin(-x)=(-x)(-sinx)=x sinx=f(x).\nVậy hàm số là hàm chẵn.", answer: "Hàm chẵn" },
          { prompt: "Giải bất phương trình: sinx>0 trong khoảng [0,2π).", solution: "sinx>0 khi 0<x<π.", answer: "0<x<π" },
          { prompt: "Tính giá trị: sin(π/6)+cos(π/3)+tan(π/4).", solution: "sin(π/6)=1/2. cos(π/3)=1/2. tan(π/4)=1.\nTổng = 1/2+1/2+1 = 2.", answer: "2" },
        ],
      },
      {
        id: "dao-ham-quy-tac-11",
        title: "Đạo hàm (quy tắc tính)",
        questions: [
          { prompt: "Đạo hàm của y=x⁵ là?", options: ["5x⁴", "x⁴", "5x⁵", "4x⁵"], correct: 0, explain: "Công thức (xⁿ)'=n·xⁿ⁻¹, với n=5 được 5x⁴." },
          { prompt: "Đạo hàm của y=sinx là?", options: ["cosx", "-cosx", "-sinx", "sinx"], correct: 0, explain: "Công thức đạo hàm cơ bản: (sinx)'=cosx." },
          { prompt: "Đạo hàm của y=cosx là?", options: ["-sinx", "sinx", "-cosx", "cosx"], correct: 0, explain: "Công thức đạo hàm cơ bản: (cosx)'=-sinx." },
          { prompt: "Đạo hàm của tích y=u·v tính theo công thức nào?", options: ["u'v+uv'", "u'v'", "u'v-uv'", "uv'"], correct: 0, explain: "Quy tắc đạo hàm của một tích: (uv)'=u'v+uv'." },
          { prompt: "Đạo hàm của y=5 (hàm hằng) là?", options: ["0", "5", "1", "Không xác định"], correct: 0, explain: "Hàm hằng không đổi theo x nên đạo hàm luôn bằng 0." },
          { prompt: "Đạo hàm của y=1/x (x≠0) là?", options: ["-1/x²", "1/x²", "-1/x", "1/x"], correct: 0, explain: "Viết y=x⁻¹, đạo hàm là -1·x⁻²=-1/x²." },
        ],
        exercises: [
          { prompt: "Tính đạo hàm của y=x⁴−3x²+2.", solution: "y' = 4x³-6x.", answer: "4x³-6x" },
          { prompt: "Tính đạo hàm của y=(3x−1)(x+2).", solution: "Khai triển trước: y=3x²+6x-x-2=3x²+5x-2.\ny' = 6x+5.", answer: "6x+5" },
          { prompt: "Tính đạo hàm của y=√x (x>0).", solution: "y' = 1/(2√x).", answer: "1/(2√x)" },
          { prompt: "Tính đạo hàm của y=(2x+1)/(x−1) (x≠1) bằng quy tắc thương.", solution: "y' = [2(x-1)-(2x+1)×1]/(x-1)² = [2x-2-2x-1]/(x-1)² = -3/(x-1)².", answer: "-3/(x-1)²" },
          { prompt: "Tính đạo hàm của y=cos(2x).", solution: "Áp dụng quy tắc hàm hợp: y' = -2sin(2x).", answer: "-2sin(2x)" },
          { prompt: "Tính đạo hàm của y=x²sinx tại x=0.", solution: "y' = 2xsinx+x²cosx.\nTại x=0: y'(0) = 0+0 = 0.", answer: "0" },
          { prompt: "Tính đạo hàm của y=tanx.", solution: "y' = 1/cos²x.", answer: "1/cos²x" },
          { prompt: "Tính đạo hàm của y=3x⁵−2x³+x.", solution: "y' = 15x⁴-6x²+1.", answer: "15x⁴-6x²+1" },
          { prompt: "Tính đạo hàm của y=(x²+1)³ (dùng quy tắc chuỗi).", solution: "y' = 3(x²+1)²×(x²+1)' = 3(x²+1)²×2x = 6x(x²+1)².", answer: "6x(x²+1)²" },
          { prompt: "Tính f'(2) với f(x)=x³−4x.", solution: "f'(x) = 3x²-4.\nf'(2) = 3×4-4 = 8.", answer: "8" },
        ],
        advanced: [
          { prompt: "Tính đạo hàm của y=sin(x²+1) (dùng quy tắc hàm hợp).", solution: "y' = cos(x²+1)×(x²+1)' = cos(x²+1)×2x = 2x·cos(x²+1).", answer: "2x·cos(x²+1)" },
          { prompt: "Cho f(x)=x³−3x²+2. Tìm x để f'(x)=0.", solution: "f'(x)=3x²-6x=3x(x-2)=0 → x=0 hoặc x=2.", answer: "2" },
          { prompt: "Tính đạo hàm của y=(x²+1)/(x−1) (dùng quy tắc thương).", solution: "y' = [2x(x-1)-(x²+1)×1]/(x-1)² = [2x²-2x-x²-1]/(x-1)² = (x²-2x-1)/(x-1)².", answer: "(x²-2x-1)/(x-1)²" },
          { prompt: "Tính đạo hàm y=√(x²+1) (dùng quy tắc hàm hợp).", solution: "y' = (2x)/(2√(x²+1)) = x/√(x²+1).", answer: "x/√(x²+1)" },
          { prompt: "Tìm phương trình tiếp tuyến của đồ thị y=x³ tại điểm có hoành độ x=1.", solution: "y'=3x². Tại x=1: y=1, y'(1)=3.\nPT tiếp tuyến: y-1=3(x-1) → y=3x-2.", answer: "y=3x-2" },
          { prompt: "Cho f(x)=sin(2x). Tính f'(π/4).", solution: "f'(x)=2cos(2x). f'(π/4)=2cos(π/2)=0.", answer: "0" },
          { prompt: "Tính đạo hàm cấp 2 của y=x⁴−3x²+1.", solution: "y'=4x³-6x. y''=12x²-6.", answer: "y''=12x²-6" },
          { prompt: "Tìm m để hàm số y=x³−3mx+1 có 2 điểm cực trị.", solution: "y'=3x²-3m=0 → x²=m. Cần 2 nghiệm phân biệt: m>0.", answer: "m>0" },
          { prompt: "Cho y=xeˣ. Tính y' (dùng quy tắc tích).", solution: "y'=eˣ+xeˣ=eˣ(1+x).", answer: "eˣ(1+x)" },
          { prompt: "Tính đạo hàm của y=ln(x²+1).", solution: "y'=2x/(x²+1).", answer: "2x/(x²+1)" },
        ],
      },
      {
        id: "xac-suat-11",
        title: "Xác suất",
        questions: [
          { prompt: "Gieo một con xúc xắc 6 mặt, xác suất ra mặt 6 chấm là?", options: ["1/6", "1/2", "1/3", "1"], correct: 0, explain: "Có 6 kết quả đồng khả năng, ra mặt 6 chấm là 1 trong 6, nên xác suất là 1/6." },
          { prompt: "Xác suất của biến cố chắc chắn bằng?", options: ["1", "0", "0,5", "Không xác định"], correct: 0, explain: "Biến cố chắc chắn luôn xảy ra nên xác suất bằng 1." },
          { prompt: "Xác suất của biến cố không thể xảy ra bằng?", options: ["0", "1", "0,5", "Không xác định"], correct: 0, explain: "Biến cố không thể xảy ra có xác suất bằng 0." },
          { prompt: "Tung một đồng xu, xác suất ra mặt ngửa là?", options: ["1/2", "1", "1/3", "1/4"], correct: 0, explain: "Đồng xu có 2 mặt đồng khả năng, xác suất ra mặt ngửa là 1/2." },
          { prompt: "Rút 1 lá bài từ bộ 52 lá, xác suất rút được lá Át (4 lá) là?", options: ["1/13", "1/4", "1/52", "4/13"], correct: 0, explain: "Xác suất = 4/52 = 1/13." },
          { prompt: "Nếu P(A)=0,3 thì xác suất của biến cố đối của A là?", options: ["0,7", "0,3", "1", "0"], correct: 0, explain: "Xác suất biến cố đối = 1 - P(A) = 1 - 0,3 = 0,7." },
        ],
        exercises: [
          { prompt: "Gieo 3 đồng xu, tính xác suất có đúng 2 mặt ngửa.", solution: "Số kết quả thuận lợi: C(3,2)=3. Không gian mẫu: 2³=8.\nXác suất = 3/8.", answer: "3/8" },
          { prompt: "Hộp có 5 bi trắng, 3 bi đen. Lấy 1 bi, tính xác suất lấy được bi đen.", solution: "Tổng bi = 8. Xác suất = 3/8.", answer: "3/8" },
          { prompt: "Hai biến cố A, B độc lập, P(A)=0,4, P(B)=0,5. Tính P(A∩B).", solution: "P(A∩B) = P(A)×P(B) = 0,4×0,5 = 0,2.", answer: "0,2" },
          { prompt: "Gieo 1 xúc xắc 2 lần, tính xác suất tổng bằng 9 (các cặp: (3,6),(4,5),(5,4),(6,3)).", solution: "Có 4 kết quả thuận lợi trong 36. Xác suất = 4/36 = 1/9.", answer: "1/9" },
          { prompt: "Một hộp có 10 thẻ đánh số 1-10, lấy 1 thẻ. Tính xác suất số đó chia hết cho 3.", solution: "Các số chia hết cho 3: 3,6,9 → 3 kết quả. Xác suất = 3/10.", answer: "3/10" },
          { prompt: "Cho P(A)=0,6. Tính xác suất biến cố đối của A.", solution: "P(không A) = 1-0,6 = 0,4.", answer: "0,4" },
          { prompt: "Gieo 2 đồng xu, tính xác suất có ít nhất 1 mặt ngửa.", solution: "P(không có mặt ngửa nào) = P(SS) = 1/4.\nP(ít nhất 1 ngửa) = 1-1/4 = 3/4.", answer: "3/4" },
          { prompt: "Hộp có 4 bi đỏ, 6 bi xanh. Lấy 2 bi liên tiếp không hoàn lại, tính xác suất cả 2 đều đỏ.", solution: "P = (4/10)×(3/9) = 12/90 = 2/15.", answer: "2/15" },
          { prompt: "Hai biến cố A, B có P(A)=0,3, P(B)=0,4, P(A∪B)=0,58. A và B có độc lập không?", solution: "Nếu độc lập: P(A∩B)=0,3×0,4=0,12.\nTheo công thức: P(A∪B)=P(A)+P(B)-P(A∩B)=0,3+0,4-0,12=0,58, khớp với đề bài.\nVậy A và B độc lập.", answer: "A và B độc lập" },
          { prompt: "Một lớp có 20 nam, 15 nữ. Chọn ngẫu nhiên 1 học sinh, tính xác suất chọn được nữ.", solution: "Tổng số học sinh = 35. Xác suất = 15/35 = 3/7.", answer: "3/7" },
        ],
        advanced: [
          { prompt: "Hai xạ thủ độc lập bắn vào bia, xác suất trúng lần lượt là 0,7 và 0,8. Tính xác suất có ít nhất 1 người bắn trúng.", solution: "P(cả 2 trượt) = 0,3×0,2 = 0,06.\nP(ít nhất 1 trúng) = 1-0,06 = 0,94.", answer: "0,94" },
          { prompt: "Một hộp có 6 bi trắng, 4 bi đen. Lấy ngẫu nhiên 3 bi. Tính xác suất có đúng 2 bi trắng.", solution: "Số cách chọn 2 bi trắng (trong 6) và 1 bi đen (trong 4): C(6,2)×C(4,1)=15×4=60.\nTổng số cách chọn 3 bi từ 10: C(10,3)=120.\nXác suất = 60/120 = 0,5.", answer: "0,5" },
          { prompt: "Cho P(A)=0,4, P(B)=0,5, P(A∪B)=0,7. Tính P(A∩B) và kết luận A, B có độc lập không.", solution: "P(A∩B) = P(A)+P(B)-P(A∪B) = 0,4+0,5-0,7 = 0,2.\nNếu độc lập thì P(A∩B) phải bằng 0,4×0,5=0,2. Đúng khớp, vậy A và B độc lập.", answer: "0,2. Đúng khớp, vậy A và B độc lập" },
          { prompt: "Hai biến cố A, B độc lập với P(A)=0,3, P(B)=0,6. Tính P(A∪B).", solution: "P(A∩B)=0,3×0,6=0,18.\nP(A∪B)=0,3+0,6-0,18=0,72.", answer: "0,72" },
          { prompt: "Một hộp có 5 bi đỏ, 3 bi xanh, 2 bi vàng. Lấy ngẫu nhiên 2 bi. Tính xác suất 2 bi cùng màu.", solution: "P(2 đỏ)=C(5,2)/C(10,2)=10/45. P(2 xanh)=3/45. P(2 vàng)=1/45.\nTổng = 14/45.", answer: "14/45" },
          { prompt: "Cho P(A|B)=0,4, P(B)=0,5. Tính P(A∩B).", solution: "P(A∩B)=P(A|B)×P(B)=0,4×0,5=0,2.", answer: "0,2" },
          { prompt: "Ba xạ thủ độc lập bắn, xác suất trúng lần lượt 0,5; 0,6; 0,7. Tính xác suất chỉ đúng 1 người trúng.", solution: "P(chỉ A)=0,5×0,4×0,3=0,06. P(chỉ B)=0,5×0,6×0,3=0,09. P(chỉ C)=0,5×0,4×0,7=0,14.\nTổng=0,06+0,09+0,14=0,29.", answer: "0,29" },
          { prompt: "Lớp có 60% giỏi Toán, 50% giỏi Văn, 30% giỏi cả 2 môn. Tính xác suất 1 học sinh không giỏi môn nào.", solution: "Giỏi ít nhất 1 môn=60+50-30=80%.\nKhông giỏi môn nào = 20%.", answer: "20%" },
          { prompt: "Gieo 2 xúc xắc, tính xác suất được ít nhất 1 mặt 6 chấm.", solution: "P(không có mặt 6) = (5/6)² = 25/36.\nP(ít nhất 1 mặt 6) = 1-25/36 = 11/36.", answer: "11/36" },
          { prompt: "Cho P(A)=0,5, P(B)=0,4, P(A∩B)=0,1. Tính P(A|B) và P(B|A).", solution: "P(A|B)=P(A∩B)/P(B)=0,1/0,4=0,25.\nP(B|A)=P(A∩B)/P(A)=0,1/0,5=0,2.", answer: "P(A|B)=0,25; P(B|A)=0,2" },
        ],
      },
      {
        id: "so-dac-trung-mau-ghep-nhom-11",
        title: "Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm",
        questions: [
          { prompt: "Mẫu số liệu ghép nhóm là gì?", options: ["Dữ liệu được chia thành các khoảng (lớp)", "Dữ liệu chỉ có 1 giá trị duy nhất", "Dữ liệu không có số liệu cụ thể", "Dữ liệu ngẫu nhiên không sắp xếp"], correct: 0, explain: "Mẫu số liệu ghép nhóm là dữ liệu được tổ chức thành các khoảng (lớp) thay vì liệt kê từng giá trị riêng lẻ." },
          { prompt: "Giá trị đại diện của một nhóm [a;b) trong mẫu số liệu ghép nhóm thường lấy là?", options: ["Trung điểm (a+b)/2", "Giá trị a", "Giá trị b", "Giá trị lớn nhất trong nhóm"], correct: 0, explain: "Giá trị đại diện của một nhóm thường lấy là trung điểm của khoảng đó." },
          { prompt: "Số trung bình của mẫu số liệu ghép nhóm tính bằng cách nào?", options: ["Tổng (giá trị đại diện × tần số) chia tổng tần số", "Chỉ lấy giá trị đại diện lớn nhất", "Chỉ lấy tần số lớn nhất", "Không thể tính được"], correct: 0, explain: "Số trung bình = tổng (giá trị đại diện×tần số của từng nhóm) / tổng tần số." },
          { prompt: "Trung vị của mẫu số liệu ghép nhóm nằm trong nhóm nào?", options: ["Nhóm chứa vị trí giữa của dữ liệu", "Nhóm đầu tiên", "Nhóm cuối cùng", "Nhóm có tần số nhỏ nhất"], correct: 0, explain: "Trung vị nằm trong nhóm chứa vị trí giữa của toàn bộ dữ liệu, xác định qua tần số tích lũy." },
          { prompt: "Mốt của mẫu số liệu ghép nhóm được xác định dựa vào?", options: ["Nhóm có tần số lớn nhất", "Nhóm có tần số nhỏ nhất", "Nhóm đầu tiên", "Nhóm cuối cùng"], correct: 0, explain: "Mốt nằm trong nhóm có tần số lớn nhất (nhóm chứa giá trị xuất hiện nhiều nhất)." },
          { prompt: "Tần số tích lũy dùng để làm gì?", options: ["Xác định vị trí trung vị, tứ phân vị trong dữ liệu ghép nhóm", "Tính trung bình cộng trực tiếp", "Không có tác dụng gì", "Chỉ dùng để vẽ biểu đồ"], correct: 0, explain: "Tần số tích lũy giúp xác định nhóm chứa trung vị hoặc các tứ phân vị." },
        ],
        exercises: [
          { prompt: "Cho bảng: nhóm [0;10) tần số 3, [10;20) tần số 5, [20;30) tần số 2. Tính giá trị đại diện mỗi nhóm.", solution: "Giá trị đại diện là trung điểm mỗi khoảng: 5, 15, 25.", answer: "5, 15, 25" },
          { prompt: "Tính số trung bình của mẫu số liệu ở bài trên.", solution: "TB = (3×5+5×15+2×25)/(3+5+2) = (15+75+50)/10 = 140/10 = 14.", answer: "14" },
          { prompt: "Nhóm nào chứa mốt trong bài trên?", solution: "Nhóm [10;20) có tần số lớn nhất (5), nên mốt thuộc nhóm này.", answer: "5" },
          { prompt: "Cho bảng: [0;5) tần số 4, [5;10) tần số 6, [10;15) tần số 10, tổng 20. Nhóm nào chứa trung vị (vị trí n/2=10)?", solution: "Tần số tích lũy: 4, rồi 4+6=10, rồi 20.\nVị trí thứ 10 đạt được ngay khi tích lũy tới nhóm [5;10), nên trung vị thuộc nhóm [5;10).", answer: "10" },
          { prompt: "Một mẫu ghép nhóm có tổng tần số 50. Vị trí trung vị nằm ở đâu?", solution: "Vị trí trung vị = n/2 = 50/2 = 25, tức là giá trị thứ 25 trong dãy đã sắp xếp.", answer: "25" },
          { prompt: "Giá trị đại diện của nhóm [20;30) là bao nhiêu?", solution: "Giá trị đại diện = (20+30)/2 = 25.", answer: "25" },
          { prompt: "Cho bảng: [0;10) tần số 6, [10;20) tần số 4. Tính số trung bình.", solution: "Giá trị đại diện: 5 và 15.\nTB = (6×5+4×15)/10 = (30+60)/10 = 9.", answer: "9" },
          { prompt: "Trong bảng ở bài trên, nhóm nào chứa mốt?", solution: "Nhóm [0;10) có tần số lớn hơn (6>4), nên chứa mốt.", answer: "4" },
          { prompt: "Cho bảng: [0;10) tần số 6, [10;20) tần số 4, [20;30) tần số 5. Tính tần số tích lũy đến hết nhóm thứ 2.", solution: "Tần số tích lũy = 6+4 = 10.", answer: "10" },
          { prompt: "Tổng tần số của bảng ở bài trên là bao nhiêu?", solution: "Tổng = 6+4+5 = 15.", answer: "15" },
        ],
        advanced: [
          { prompt: "Bảng ghép nhóm: [0;10) tần số 5, [10;20) tần số 8, [20;30) tần số 7. Tính số trung bình.", solution: "Giá trị đại diện: 5, 15, 25.\nTrung bình = (5×5+8×15+7×25)/20 = (25+120+175)/20 = 320/20 = 16.", answer: "16" },
          { prompt: "Trong bảng ở bài trên (tổng 20 số liệu), nhóm nào chứa trung vị (vị trí n/2=10)?", solution: "Tần số tích lũy: 5, 13, 20. Vị trí thứ 10 nằm trong khoảng tích lũy từ 5 đến 13, thuộc nhóm [10;20).", answer: "20" },
          { prompt: "Bảng: [0;5) tần số 4, [5;10) tần số 9, [10;15) tần số 6. Tìm nhóm chứa mốt và giá trị đại diện của nhóm đó.", solution: "Nhóm [5;10) có tần số lớn nhất (9), nên chứa mốt.\nGiá trị đại diện của nhóm này (trung điểm) là 7,5.", answer: "7,5." },
          { prompt: "Mẫu ghép nhóm: [0,10) tần số 4, [10,20) tần số 8, [20,30) tần số 6, [30,40) tần số 2. Tính số trung bình.", solution: "Giá trị đại diện: 5,15,25,35.\nTB=(4×5+8×15+6×25+2×35)/20=(20+120+150+70)/20=18.", answer: "18" },
          { prompt: "Với mẫu ở bài trên (tổng 20 số liệu), tìm nhóm chứa trung vị.", solution: "Tần số tích lũy: 4,12,18,20. Vị trí n/2=10 nằm trong khoảng [4,12), thuộc nhóm [10,20).", answer: "[10,20)" },
          { prompt: "Bảng ghép nhóm có 3 nhóm tần số 5,10,15, tổng 30. Tính tần số tương đối mỗi nhóm.", solution: "Nhóm 1: 5/30≈16,7%. Nhóm 2: 10/30≈33,3%. Nhóm 3: 15/30=50%.", answer: "≈16,7%; 33,3%; 50%" },
          { prompt: "Tìm mốt của mẫu ghép nhóm: [0,5) tần số 3, [5,10) tần số 12, [10,15) tần số 5.", solution: "Nhóm [5,10) có tần số lớn nhất (12), là nhóm chứa mốt.\nGiá trị đại diện=7,5.", answer: "7,5" },
          { prompt: "Một mẫu ghép nhóm có độ rộng mỗi nhóm là 10, 5 nhóm bắt đầu từ 0. Viết các khoảng của 5 nhóm.", solution: "[0,10), [10,20), [20,30), [30,40), [40,50).", answer: "[0,10), [10,20), [20,30), [30,40), [40,50)" },
          { prompt: "Mẫu ghép nhóm 2 nhóm: [0,20) tần số x, [20,40) tần số 3x, tổng tần số 40. Tìm x.", solution: "x+3x=40 → 4x=40 → x=10.", answer: "10" },
          { prompt: "Tính số trung bình của mẫu ghép nhóm: [10,20) tần số 6, [20,30) tần số 4.", solution: "Giá trị đại diện 15, 25.\nTB=(6×15+4×25)/10=(90+100)/10=19.", answer: "19" },
        ],
      },
      {
        id: "quan-he-song-song-khong-gian-11",
        title: "Quan hệ song song trong không gian",
        questions: [
          { prompt: "Hai đường thẳng trong không gian được gọi là song song khi nào?", options: ["Cùng nằm trong một mặt phẳng và không có điểm chung", "Chỉ cần không có điểm chung", "Chỉ cần cùng nằm trong một mặt phẳng", "Luôn cắt nhau"], correct: 0, explain: "Hai đường thẳng song song phải đồng phẳng và không có điểm chung." },
          { prompt: "Đường thẳng song song với mặt phẳng khi nào?", options: ["Không có điểm chung với mặt phẳng", "Có đúng 1 điểm chung", "Nằm trong mặt phẳng đó", "Vuông góc với mặt phẳng"], correct: 0, explain: "Đường thẳng song song với mặt phẳng là đường thẳng không có điểm chung với mặt phẳng đó." },
          { prompt: "Hai mặt phẳng song song khi nào?", options: ["Không có điểm chung", "Có đúng 1 điểm chung", "Cắt nhau theo 1 đường thẳng", "Luôn trùng nhau"], correct: 0, explain: "Hai mặt phẳng song song là hai mặt phẳng không có điểm chung." },
          { prompt: "Nếu đường thẳng a song song với mặt phẳng (P), thì a có song song với mọi đường thẳng trong (P) không?", options: ["Không nhất thiết", "Luôn luôn song song", "Luôn cắt nhau", "Luôn trùng nhau"], correct: 0, explain: "a có thể song song hoặc chéo nhau với các đường thẳng khác nhau nằm trong (P)." },
          { prompt: "Nếu hai mặt phẳng phân biệt cùng song song với một đường thẳng thì giao tuyến của chúng (nếu có) sẽ như thế nào với đường thẳng đó?", options: ["Song song với đường thẳng đó", "Vuông góc với đường thẳng đó", "Trùng với đường thẳng đó", "Không liên quan gì"], correct: 0, explain: "Đây là một tính chất quan trọng về quan hệ song song trong không gian." },
          { prompt: "Phép chiếu song song bảo toàn tính chất nào của hình?", options: ["Tính song song và tỉ lệ đoạn thẳng trên các đường thẳng song song", "Độ dài mọi đoạn thẳng", "Mọi góc trong hình", "Diện tích của hình"], correct: 0, explain: "Phép chiếu song song bảo toàn tính song song và tỉ số độ dài trên các đoạn thẳng song song, nhưng không bảo toàn độ dài hay góc nói chung." },
        ],
        exercises: [
          { prompt: "Cho hình chóp S.ABCD có đáy ABCD là hình bình hành. Giải thích vì sao AB song song với mặt phẳng (SCD).", solution: "Vì ABCD là hình bình hành nên AB//CD.\nCD nằm trong mặt phẳng (SCD), còn AB không nằm trong (SCD).\nSuy ra AB//(SCD).", answer: "AB//(SCD)" },
          { prompt: "Hai đường thẳng phân biệt cùng song song với đường thẳng thứ ba thì có quan hệ gì với nhau?", solution: "Chúng song song với nhau (tính chất bắc cầu của quan hệ song song trong không gian).", answer: "Chúng song song với nhau (tính chất bắc cầu của quan hệ song song trong không gian)" },
          { prompt: "Cho hai mặt phẳng song song (P) và (Q). Một đường thẳng cắt (P) mà không song song với (Q) thì có cắt (Q) không?", solution: "Có. Vì (P) và (Q) song song, đường thẳng không song song với chúng bắt buộc phải cắt cả hai mặt phẳng.", answer: "Có. Vì (P) và (Q) song song, đường thẳng không song song với chúng bắt buộc phải cắt cả hai mặt phẳng" },
          { prompt: "Cho hình lăng trụ ABC.A'B'C'. Giải thích vì sao AA' song song với BB'.", solution: "Theo định nghĩa hình lăng trụ, các cạnh bên đều song song và bằng nhau, nên AA'//BB'.", answer: "Theo định nghĩa hình lăng trụ, các cạnh bên đều song song và bằng nhau, nên AA'//BB'" },
          { prompt: "Trong không gian, hai đường thẳng không có điểm chung thì có chắc chắn song song không?", solution: "Không. Chúng có thể là hai đường thẳng chéo nhau (không đồng phẳng). Chỉ khi đồng phẳng và không có điểm chung mới là song song.", answer: "Không. Chúng có thể là hai đường thẳng chéo nhau (không đồng phẳng). Chỉ khi đồng phẳng và không có điểm chung mới là song song" },
          { prompt: "Cho hình chóp S.ABCD, M, N lần lượt là trung điểm SA, SB. Chứng tỏ MN//AB.", solution: "Trong tam giác SAB, M và N là trung điểm hai cạnh SA, SB.\nMN là đường trung bình của tam giác nên MN//AB.", answer: "MN là đường trung bình của tam giác nên MN//AB" },
          { prompt: "Đường thẳng a nằm trong mặt phẳng (α), và (α) song song với mặt phẳng (β). Khi nào a song song với (β)?", solution: "Vì (α)//(β) nên (α) và (β) không có điểm chung, do đó mọi đường thẳng a nằm trong (α) cũng không có điểm chung với (β), tức a//(β).", answer: "Vì (α)//(β) nên (α) và (β) không có điểm chung, do đó mọi đường thẳng a nằm trong (α) cũng không có điểm chung với (β), tức a//(β)" },
          { prompt: "Cho hai mặt phẳng phân biệt cùng đi qua điểm A và cùng song song với đường thẳng d. Giao tuyến của hai mặt phẳng này có quan hệ gì với d?", solution: "Giao tuyến của hai mặt phẳng (đường thẳng qua A) song song với d.", answer: "Giao tuyến của hai mặt phẳng (đường thẳng qua A) song song với d" },
          { prompt: "Trong hình hộp ABCD.A'B'C'D', giải thích vì sao mặt phẳng (ABB'A') song song với mặt phẳng (DCC'D').", solution: "Vì AB//DC và AA'//DD' (các cạnh đối của hình hộp), hai đường thẳng cắt nhau trong (ABB'A') lần lượt song song với hai đường thẳng cắt nhau trong (DCC'D'), nên hai mặt phẳng song song.", answer: "Vì AB//DC và AA'//DD' (các cạnh đối của hình hộp), hai đường thẳng cắt nhau trong (ABB'A') lần lượt song song với hai đường thẳng cắt nhau trong (DCC'D'), nên hai mặt phẳng song song" },
          { prompt: "Cho hình chóp tứ giác đều S.ABCD. Hai đường chéo AC và BD của đáy có cắt nhau không?", solution: "Có. Vì ABCD là hình vuông (đáy của hình chóp tứ giác đều), hai đường chéo AC và BD luôn cắt nhau tại tâm O của hình vuông.", answer: "Có. Vì ABCD là hình vuông (đáy của hình chóp tứ giác đều), hai đường chéo AC và BD luôn cắt nhau tại tâm O của hình vuông" },
        ],
        advanced: [
          { prompt: "Cho hình chóp S.ABCD đáy là hình bình hành. M là trung điểm SA, N là trung điểm SB. Chứng minh MN//(ABCD).", solution: "Trong tam giác SAB, M và N là trung điểm SA, SB nên MN là đường trung bình, suy ra MN//AB.\nVì AB nằm trong mặt phẳng (ABCD) còn MN không nằm trong mặt phẳng đó, suy ra MN//(ABCD).", answer: "Vì AB nằm trong mặt phẳng (ABCD) còn MN không nằm trong mặt phẳng đó, suy ra MN//(ABCD)" },
          { prompt: "Hai mặt phẳng phân biệt (P), (Q) cùng song song với đường thẳng d. Nếu (P) và (Q) cắt nhau theo giao tuyến a, a có quan hệ gì với d?", solution: "a // d, vì giao tuyến của hai mặt phẳng cùng song song với một đường thẳng thì cũng song song với đường thẳng đó.", answer: "a // d, vì giao tuyến của hai mặt phẳng cùng song song với một đường thẳng thì cũng song song với đường thẳng đó" },
          { prompt: "Cho hình lăng trụ ABC.A'B'C'. Giải thích vì sao mặt phẳng (ABC) song song với mặt phẳng (A'B'C').", solution: "Vì AB//A'B' và AC//A'C' (tính chất lăng trụ), hai đường thẳng cắt nhau trong (ABC) lần lượt song song với hai đường thẳng cắt nhau trong (A'B'C'), nên hai mặt phẳng song song.", answer: "Vì AB//A'B' và AC//A'C' (tính chất lăng trụ), hai đường thẳng cắt nhau trong (ABC) lần lượt song song với hai đường thẳng cắt nhau trong (A'B'C'), nên hai mặt phẳng song song" },
          { prompt: "Cho hình chóp S.ABCD, M, N lần lượt là trung điểm SA, SB. Chứng minh MN//(ABCD).", solution: "MN là đường trung bình tam giác SAB nên MN//AB.\nVì AB nằm trong (ABCD), suy ra MN//(ABCD).", answer: "Đã chứng minh" },
          { prompt: "Cho 2 mặt phẳng song song (P), (Q). Đường thẳng d cắt (P). Hỏi d có cắt (Q) không?", solution: "Có. Nếu d không cắt (Q) thì d//(Q) hoặc d nằm trong (Q), nhưng khi đó d không thể cắt (P) (vì (P)//(Q)), mâu thuẫn giả thiết d cắt (P).", answer: "Có, d chắc chắn cắt (Q)" },
          { prompt: "Cho hình hộp ABCD.A'B'C'D'. Mặt phẳng (ACC'A') có song song với (BDD'B') không?", solution: "Không. Vì AC và BD cắt nhau tại tâm đáy hình hộp, hai mặt phẳng chứa chúng cũng cắt nhau (giao tuyến qua tâm, song song cạnh bên).", answer: "Không song song" },
          { prompt: "Tứ diện ABCD, G là trọng tâm tam giác BCD. Đường thẳng AG cắt mặt phẳng (BCD) tại điểm nào?", solution: "G thuộc mặt phẳng (BCD) (vì là trọng tâm tam giác BCD). Do A không thuộc (BCD) (tứ diện), đường thẳng AG cắt (BCD) tại chính điểm G.", answer: "Tại điểm G" },
          { prompt: "Hình chóp S.ABCD đáy hình bình hành, M là trung điểm SC. Mặt phẳng (ABM) cắt SD tại N. Chứng minh MN//CD.", solution: "(ABM) chứa AB//CD (đáy hbh). (ABM) cắt (SCD) theo giao tuyến MN.\nVì CD//AB và AB nằm trong (ABM), theo tính chất giao tuyến: MN//CD.", answer: "Đã chứng minh" },
          { prompt: "Lăng trụ tam giác ABC.A'B'C', M là trung điểm AA'. Mặt phẳng qua M song song đáy cắt BB', CC' tại N, P. Xác định vị trí N, P.", solution: "Vì mặt phẳng song song đáy và các cạnh bên song song, bằng nhau, N và P cũng là trung điểm của BB' và CC'.", answer: "N, P lần lượt là trung điểm BB', CC'" },
          { prompt: "Hai đường thẳng chéo nhau a, b. Có bao nhiêu mặt phẳng chứa a và song song với b?", solution: "Có đúng 1 mặt phẳng — mặt phẳng chứa a và song song với b, được xác định duy nhất khi a, b chéo nhau.", answer: "1 mặt phẳng" },
        ],
      },
      {
        id: "ham-so-mu-logarit-11",
        title: "Hàm số mũ và hàm số lôgarit",
        questions: [
          { prompt: "Với a>0, a≠1, log_a(a^x) = ?", options: ["x", "a^x", "1", "0"], correct: 0, explain: "Đây là tính chất cơ bản của lôgarit: log_a(a^x)=x." },
          { prompt: "log₂(8) = ?", options: ["3", "2", "4", "8"], correct: 0, explain: "2³=8 nên log₂(8)=3." },
          { prompt: "Hàm số mũ y=a^x (a>0, a≠1) có tập giá trị là?", options: ["(0;+∞)", "ℝ", "[0;+∞)", "(-∞;0)"], correct: 0, explain: "Hàm số mũ luôn nhận giá trị dương, tập giá trị là (0;+∞)." },
          { prompt: "Hàm số y=log_a(x) xác định khi nào?", options: ["x > 0", "x ≥ 0", "x ∈ ℝ", "x < 0"], correct: 0, explain: "Lôgarit chỉ xác định với đối số dương: x>0." },
          { prompt: "Phương trình 2^x=8 có nghiệm x = ?", options: ["3", "2", "4", "8"], correct: 0, explain: "2³=8 nên x=3." },
          { prompt: "log_a(xy) = ? (với x,y > 0)", options: ["log_a(x) + log_a(y)", "log_a(x) × log_a(y)", "log_a(x) - log_a(y)", "log_a(x) / log_a(y)"], correct: 0, explain: "Công thức lôgarit của một tích: log_a(xy) = log_a(x)+log_a(y)." },
        ],
        exercises: [
          { prompt: "Giải phương trình: 3^x=81", solution: "81 = 3⁴, nên x=4.", answer: "4" },
          { prompt: "Tính log₃(27) + log₃(9)", solution: "log₃(27)=3 (vì 3³=27). log₃(9)=2 (vì 3²=9).\nTổng = 3+2 = 5.", answer: "5" },
          { prompt: "Giải phương trình: log₂(x)=5", solution: "x = 2⁵ = 32.", answer: "32" },
          { prompt: "Tính giá trị biểu thức: 2³ × 2⁻¹", solution: "2³×2⁻¹ = 2^(3-1) = 2² = 4.", answer: "4" },
          { prompt: "Giải phương trình: 5^x = 1/25", solution: "1/25 = 5⁻², nên x=-2.", answer: "-2" },
          { prompt: "Tính log₅(1)", solution: "5⁰=1, nên log₅(1)=0.", answer: "0" },
          { prompt: "Rút gọn: log₂(16) − log₂(4)", solution: "log₂(16)=4, log₂(4)=2.\n4-2 = 2.", answer: "2" },
          { prompt: "Giải bất phương trình: 2^x > 8", solution: "8 = 2³. Vì cơ số 2>1 nên hàm mũ đồng biến: x>3.", answer: "x>3" },
          { prompt: "Tính (1/3)⁻²", solution: "(1/3)⁻² = 3² = 9.", answer: "9" },
          { prompt: "Giải phương trình: log₂(x−1)=3", solution: "x-1 = 2³ = 8.\nx = 9.", answer: "9" },
        ],
        advanced: [
          { prompt: "Giải phương trình: 4^x − 3×2^x − 4 = 0 (đặt t=2^x)", solution: "Đặt t=2^x (t>0): t²-3t-4=0 → (t-4)(t+1)=0 → t=4 (loại t=-1 vì t>0).\n2^x=4 → x=2.", answer: "2" },
          { prompt: "Giải bất phương trình: log₂(x−1) < 3", solution: "Điều kiện: x>1. log₂(x-1)<3 → x-1<8 → x<9.\nKết hợp điều kiện: 1<x<9.", answer: "Kết hợp điều kiện: 1<x<9" },
          { prompt: "Tính giá trị biểu thức: log₃(9) + log₃(1/3) − log₃(1)", solution: "log₃(9)=2. log₃(1/3)=-1. log₃(1)=0.\nTổng = 2-1-0 = 1.", answer: "1" },
          { prompt: "Giải phương trình: log₂(x)+log₂(x−2)=3", solution: "Điều kiện x>2. log₂[x(x-2)]=3 → x(x-2)=8 → x²-2x-8=0 → (x-4)(x+2)=0.\nx=4 (thỏa), x=-2 (loại vì cần x>2).", answer: "4" },
          { prompt: "Tính: 2^(log₂5)", solution: "= 5 (tính chất a^(logₐb)=b).", answer: "5" },
          { prompt: "Giải bất phương trình: (1/2)^x > 8", solution: "8=(1/2)⁻³. Vì cơ số 1/2<1, hàm nghịch biến: x<-3.", answer: "x<-3" },
          { prompt: "Tìm x biết: logₓ(16)=2 (x là cơ số).", solution: "x²=16 → x=4 (cơ số phải dương và khác 1).", answer: "4" },
          { prompt: "Giải phương trình: 3^(2x−1)=27", solution: "27=3³. 2x-1=3 → x=2.", answer: "2" },
          { prompt: "Tính giá trị: log₂8+log₃9−log₅25", solution: "log₂8=3. log₃9=2. log₅25=2.\nKết quả = 3+2-2 = 3.", answer: "3" },
          { prompt: "Giải phương trình: 4^x−5×2^x+4=0 (đặt t=2^x).", solution: "Đặt t=2^x (t>0): t²-5t+4=0 → (t-1)(t-4)=0 → t=1 hoặc t=4.\n2^x=1: x=0. 2^x=4: x=2.", answer: "x=0 hoặc x=2" },
        ],
      },
      {
        id: "quan-he-vuong-goc-khong-gian-11",
        title: "Quan hệ vuông góc trong không gian",
        questions: [
          { prompt: "Hai đường thẳng vuông góc trong không gian là hai đường thẳng có góc giữa chúng bằng?", options: ["90°", "180°", "45°", "0°"], correct: 0, explain: "Định nghĩa hai đường thẳng vuông góc: góc giữa chúng bằng 90°." },
          { prompt: "Đường thẳng vuông góc với mặt phẳng khi nào?", options: ["Vuông góc với mọi đường thẳng nằm trong mặt phẳng đó", "Chỉ vuông góc với 1 đường bất kỳ trong mặt phẳng", "Song song với mặt phẳng", "Nằm trong mặt phẳng"], correct: 0, explain: "Đường thẳng vuông góc với mặt phẳng khi nó vuông góc với mọi đường thẳng nằm trong mặt phẳng đó." },
          { prompt: "Hai mặt phẳng vuông góc khi nào?", options: ["Góc giữa chúng bằng 90°", "Song song với nhau", "Chỉ có chung 1 điểm", "Trùng nhau"], correct: 0, explain: "Hai mặt phẳng vuông góc khi góc nhị diện giữa chúng bằng 90°." },
          { prompt: "Khoảng cách từ một điểm đến một mặt phẳng là độ dài đoạn nào?", options: ["Đoạn vuông góc kẻ từ điểm đó đến mặt phẳng", "Đoạn bất kỳ nối điểm với mặt phẳng", "Đoạn song song với mặt phẳng", "Không xác định được"], correct: 0, explain: "Khoảng cách từ điểm đến mặt phẳng luôn là độ dài đoạn vuông góc, ngắn nhất." },
          { prompt: "Góc giữa đường thẳng và mặt phẳng được xác định bằng góc giữa đường thẳng đó và?", options: ["Hình chiếu vuông góc của nó trên mặt phẳng", "Một đường thẳng bất kỳ trong mặt phẳng", "Đường thẳng vuông góc với mặt phẳng", "Không xác định được"], correct: 0, explain: "Góc giữa đường thẳng và mặt phẳng là góc giữa đường thẳng đó với hình chiếu vuông góc của nó lên mặt phẳng." },
          { prompt: "Thể tích khối chóp có diện tích đáy B và chiều cao h là?", options: ["(1/3)Bh", "Bh", "(1/2)Bh", "2Bh"], correct: 0, explain: "Công thức thể tích khối chóp: V = (1/3)×diện tích đáy×chiều cao." },
        ],
        exercises: [
          { prompt: "Cho hình chóp S.ABC có SA⊥(ABC). Tính góc giữa SA và mặt phẳng đáy.", solution: "Vì SA vuông góc với mặt đáy, góc giữa chúng bằng 90°.", answer: "90°" },
          { prompt: "Hình chóp tứ giác đều có đáy là hình vuông cạnh a. Tính diện tích đáy.", solution: "Diện tích hình vuông cạnh a là a².", answer: "Diện tích hình vuông cạnh a là a²" },
          { prompt: "Cho khối chóp có diện tích đáy 12cm², chiều cao 9cm. Tính thể tích.", solution: "V = (1/3)×12×9 = 36cm³.", answer: "36cm³" },
          { prompt: "Cho hình lập phương cạnh a. Tính thể tích.", solution: "V = a³ (cạnh × cạnh × cạnh).", answer: "a³ (cạnh × cạnh × cạnh)" },
          { prompt: "Cho hình chóp S.ABCD có SA⊥(ABCD), đáy là hình vuông cạnh a, SA=a. Tính thể tích khối chóp.", solution: "Diện tích đáy = a². V = (1/3)×a²×a = a³/3.", answer: "a³/3" },
          { prompt: "Hai mặt phẳng vuông góc thì góc giữa chúng bằng bao nhiêu?", solution: "90°, theo định nghĩa hai mặt phẳng vuông góc.", answer: "90°" },
          { prompt: "Khoảng cách từ điểm A đến mặt phẳng (P) khi A thuộc (P) là bao nhiêu?", solution: "Bằng 0, vì A đã nằm trên mặt phẳng đó.", answer: "Bằng 0, vì A đã nằm trên mặt phẳng đó" },
          { prompt: "Cho hình chóp có đáy là tam giác vuông với hai cạnh góc vuông 3cm, 4cm, chiều cao khối chóp 6cm. Tính thể tích.", solution: "Diện tích đáy = ½×3×4 = 6cm².\nV = (1/3)×6×6 = 12cm³.", answer: "12cm³" },
          { prompt: "Đường thẳng d vuông góc với hai đường thẳng cắt nhau a, b cùng nằm trong mặt phẳng (P). Kết luận gì về quan hệ giữa d và (P)?", solution: "d vuông góc với mặt phẳng (P) (định lý điều kiện đường thẳng vuông góc với mặt phẳng).", answer: "d vuông góc với mặt phẳng (P) (định lý điều kiện đường thẳng vuông góc với mặt phẳng)" },
          { prompt: "Cho hình lập phương ABCD.A'B'C'D' cạnh a. Tính độ dài đường chéo không gian AC'.", solution: "Đường chéo không gian của hình lập phương cạnh a có độ dài AC' = a√3.", answer: "a√3" },
        ],
        advanced: [
          { prompt: "Cho hình chóp S.ABC có SA⊥(ABC), tam giác ABC vuông tại B. Chứng minh SB⊥BC.", solution: "Vì SA⊥(ABC) nên SA⊥BC. Mặt khác AB⊥BC (giả thiết vuông tại B).\nVì BC vuông góc với hai đường thẳng cắt nhau SA và AB trong mặt phẳng (SAB), suy ra BC⊥(SAB), do đó BC⊥SB.", answer: "Vì BC vuông góc với hai đường thẳng cắt nhau SA và AB trong mặt phẳng (SAB), suy ra BC⊥(SAB), do đó BC⊥SB" },
          { prompt: "Hình chóp tứ giác đều S.ABCD có cạnh đáy a, đường cao h. Tính thể tích.", solution: "Diện tích đáy (hình vuông cạnh a) = a².\nThể tích V = (1/3)×a²×h.", answer: "(1/3)×a²×h" },
          { prompt: "Hình lập phương ABCD.A'B'C'D' cạnh a. Tính góc giữa đường chéo AC' và mặt đáy ABCD.", solution: "Hình chiếu của AC' lên đáy là AC (đường chéo đáy, dài a√2).\ntan(góc) = CC'/AC = a/(a√2) = 1/√2 ≈ 0,707.\nGóc ≈ 35,26°.", answer: "Góc ≈ 35,26°" },
          { prompt: "Cho hình chóp S.ABC có SA⊥(ABC), tam giác ABC vuông tại B. Chứng minh (SAB)⊥(SBC).", solution: "SA⊥(ABC) nên SA⊥BC. Mặt khác AB⊥BC (giả thiết). Suy ra BC⊥(SAB) (vuông góc 2 đường cắt nhau).\nVì BC nằm trong (SBC), nên (SBC)⊥(SAB).", answer: "Đã chứng minh" },
          { prompt: "Hình chóp tứ giác đều S.ABCD có cạnh đáy a, cạnh bên b. Tính chiều cao hình chóp.", solution: "Nửa đường chéo đáy = a√2/2.\nChiều cao h = √(b²-(a√2/2)²) = √(b²-a²/2).", answer: "√(b²-a²/2)" },
          { prompt: "Hình lập phương ABCD.A'B'C'D' cạnh a. Tính khoảng cách giữa 2 đường thẳng chéo nhau AB và A'D'.", solution: "Do tính đối xứng của hình lập phương, khoảng cách giữa AB và A'D' bằng đúng cạnh AA' = a.", answer: "a" },
          { prompt: "Hình chóp S.ABCD đáy hình vuông cạnh a, SA⊥(ABCD), SA=a. Tính góc giữa SC và (ABCD).", solution: "Hình chiếu SC lên đáy là AC (dài a√2).\ntan(góc)=SA/AC=a/(a√2)=1/√2 → góc≈35,26°.", answer: "≈35,26°" },
          { prompt: "Tứ diện đều ABCD cạnh a. Tính khoảng cách từ A đến mặt phẳng (BCD).", solution: "Đây là chiều cao tứ diện đều: h = a√(2/3) = a√6/3.", answer: "a√6/3" },
          { prompt: "Hình chóp S.ABC có SA=SB=SC=a, đáy ABC đều cạnh a. Tính góc giữa cạnh bên và đáy.", solution: "Chân đường cao từ S trùng tâm ngoại tiếp ABC. Bán kính ngoại tiếp R=a/√3.\ncos(góc)=R/SA=1/√3 → góc≈54,7°.", answer: "≈54,7°" },
          { prompt: "Hình chóp S.ABC có (SAB)⊥(ABC), tam giác SAB đều cạnh a. Tính chiều cao hình chóp từ S.", solution: "Đường cao SH của tam giác đều SAB (từ S xuống AB) vuông góc (ABC) vì (SAB)⊥(ABC) với giao tuyến AB.\nSH = a√3/2 (đường cao tam giác đều cạnh a).", answer: "a√3/2" },
        ],
      },
    ],
    examSources: [
      { label: "Đề giữa HK1 – TOANMATH.com", url: "https://toanmath.com/de-thi-giua-hk1-toan-11" },
      { label: "Đề HK1 – TOANMATH.com", url: "https://toanmath.com/de-thi-hk1-toan-11" },
      { label: "Đề giữa HK2 – TOANMATH.com", url: "https://toanmath.com/de-thi-giua-hk2-toan-11" },
      { label: "Đề HK2 – TOANMATH.com", url: "https://toanmath.com/de-thi-hk2-toan-11" },
      { label: "Đề khảo sát chất lượng – TOANMATH.com", url: "https://toanmath.com/khao-sat-chat-luong-toan-11" },
      { label: "Đề học sinh giỏi – TOANMATH.com", url: "https://toanmath.com/de-thi-hsg-toan-11" },
      { label: "Tài liệu học tập lớp 11 – Nguyễn Bảo Vương", url: "https://www.toannbv.vn/search/label/T%C3%A0i%20Li%E1%BB%87u%20H%E1%BB%8Dc%20T%E1%BA%ADp%2011" },
      { label: "Đề khảo sát chất lượng lớp 11 – Nguyễn Bảo Vương", url: "https://www.nbv.edu.vn/search/label/%C4%90%E1%BB%81%20thi%20KSCL%2011" },
    ],
  },
  {
    id: 12,
    label: "Lớp 12",
    topics: [
      {
        id: "dao-ham-12",
        title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
        questions: [
          { prompt: "Đạo hàm của y = x³ là?", options: ["3x²", "x²", "3x", "x³"], correct: 0, explain: "Công thức (xⁿ)' = n·xⁿ⁻¹, với n=3 được 3x²." },
          { prompt: "Đạo hàm của y = x² + 3x là?", options: ["2x+3", "2x", "x+3", "2x+3x"], correct: 0, explain: "Đạo hàm từng số hạng: (x²)'=2x, (3x)'=3." },
          { prompt: "y = x³−3x đồng biến khi nào?", options: ["x<-1 hoặc x>1", "-1<x<1", "x>0", "x<0"], correct: 0, explain: "y'=3x²-3>0 khi x²>1, tức x<-1 hoặc x>1." },
          { prompt: "y = −x²+4x−1 đạt giá trị lớn nhất tại?", options: ["x = 2", "x = 4", "x = -2", "x = 1"], correct: 0, explain: "Đỉnh parabol tại x=-b/2a = 4/2 = 2, và a<0 nên đây là giá trị lớn nhất." },
          { prompt: "Điểm cực trị của y = x³−3x là?", options: ["x = ±1", "x = 0", "x = ±3", "x = 1"], correct: 0, explain: "y'=3x²-3=0 khi x²=1, tức x=1 hoặc x=-1." },
          { prompt: "Đường thẳng x=a được gọi là tiệm cận đứng của đồ thị hàm số khi nào?", options: ["Khi giới hạn của hàm số tại a bằng vô cực", "Khi hàm số xác định tại a", "Khi đồ thị đi qua điểm (a,0)", "Khi hàm số liên tục tại a"], correct: 0, explain: "Tiệm cận đứng x=a xảy ra khi lim (x→a) f(x) = ±∞." },
        ],
        exercises: [
          { prompt: "Tìm khoảng đồng biến của hàm số y=x³−3x²+1.", solution: "y'=3x²-6x=3x(x-2).\ny'>0 khi x<0 hoặc x>2.\nVậy hàm đồng biến trên (-∞;0) và (2;+∞).", answer: "hàm đồng biến trên (-∞;0) và (2;+∞)" },
          { prompt: "Tìm giá trị lớn nhất của hàm số y=−x²+6x−5 trên ℝ.", solution: "Đỉnh parabol tại x=-b/2a=3 (vì a=-1<0).\ny(3)=-9+18-5=4. GTLN=4.", answer: "4" },
          { prompt: "Tìm tiệm cận đứng của đồ thị hàm số y=(2x+1)/(x−3).", solution: "Mẫu bằng 0 tại x=3, tử khác 0 tại đó (2×3+1=7≠0).\nTiệm cận đứng là x=3.", answer: "3" },
          { prompt: "Tìm cực trị của hàm số y=x³−3x+1.", solution: "y'=3x²-3=0 → x=±1.\nx=-1 là điểm cực đại (y=3). x=1 là điểm cực tiểu (y=-1).", answer: "-1)" },
          { prompt: "Tìm giá trị nhỏ nhất của hàm số y=x²−4x+7 trên ℝ.", solution: "Đỉnh tại x=2 (vì a=1>0). y(2)=4-8+7=3. GTNN=3.", answer: "3" },
          { prompt: "Tìm tiệm cận ngang của đồ thị hàm số y=(3x+1)/(x−2).", solution: "Khi x→∞, y→3 (tỉ số hệ số bậc cao nhất). Tiệm cận ngang là y=3.", answer: "3" },
          { prompt: "Xét tính đơn điệu của hàm số y=−x³+3x trên khoảng (−1;1).", solution: "y'=-3x²+3=3(1-x²)>0 khi -1<x<1.\nVậy hàm đồng biến trên (-1;1).", answer: "hàm đồng biến trên (-1;1)" },
          { prompt: "Tìm giá trị lớn nhất của hàm số y=x³−3x² trên đoạn [0;3].", solution: "y'=3x²-6x=0 → x=0 hoặc x=2.\ny(0)=0, y(2)=-4, y(3)=0.\nGTLN trên [0;3] là 0 (tại x=0 hoặc x=3).", answer: "3)" },
          { prompt: "Tìm điểm cực đại của hàm số y=−x²+2x+3.", solution: "y'=-2x+2=0 → x=1.\nVì a=-1<0, x=1 là điểm cực đại, y(1)=4.", answer: "4" },
          { prompt: "Cho hàm số y=x³−6x²+9x. Tìm các điểm cực trị.", solution: "y'=3x²-12x+9=3(x-1)(x-3)=0 → x=1 hoặc x=3.\nx=1: cực đại (y=4). x=3: cực tiểu (y=0).", answer: "0)" },
        ],
        advanced: [
          { prompt: "Tìm GTLN, GTNN của hàm số y=x³−3x+1 trên đoạn [−2;2].", solution: "y'=3x²-3=0 → x=±1.\ny(-2)=-8+6+1=-1. y(-1)=-1+3+1=3. y(1)=1-3+1=-1. y(2)=8-6+1=3.\nGTLN=3 (tại x=-1 hoặc x=2). GTNN=-1 (tại x=-2 hoặc x=1).", answer: "1)" },
          { prompt: "Tìm m để hàm số y=x³−3mx²+3(m²−1)x+1 đạt cực đại tại x=1.", solution: "y'=3x²-6mx+3(m²-1). y'(1)=0: 3-6m+3m²-3=0 → 3m²-6m=0 → m=0 hoặc m=2.\ny''=6x-6m, y''(1)=6-6m. Cần cực đại nên y''(1)<0: 6-6m<0 → m>1.\nVậy m=2 thỏa mãn (m=0 cho y''(1)=6>0 là cực tiểu, loại).", answer: "6>0 là cực tiểu, loại)" },
          { prompt: "Tìm tiệm cận của đồ thị hàm số y=(2x−1)/(x+3).", solution: "Tiệm cận đứng: x=-3 (mẫu=0, tử khác 0 tại đó).\nTiệm cận ngang: y=2 (tỉ số hệ số bậc cao nhất khi x→∞).", answer: "2 (tỉ số hệ số bậc cao nhất khi x→∞)" },
          { prompt: "Tìm khoảng đồng biến, nghịch biến của y=x³−3x²−9x+5.", solution: "y'=3x²-6x-9=3(x-3)(x+1)=0 → x=-1 hoặc x=3.\nĐồng biến khi x<-1 hoặc x>3; nghịch biến khi -1<x<3.", answer: "đồng biến (-∞,-1)∪(3,+∞); nghịch biến (-1,3)" },
          { prompt: "Tìm GTLN, GTNN của y=x⁴−2x²+3 trên đoạn [−2,2].", solution: "y'=4x³-4x=4x(x-1)(x+1)=0 → x=0,±1.\ny(0)=3, y(±1)=2, y(±2)=11. GTLN=11 tại x=±2. GTNN=2 tại x=±1.", answer: "GTLN=11, GTNN=2" },
          { prompt: "Tìm m để hàm số y=(1/3)x³−mx²+(m²−1)x+2 đạt cực tiểu tại x=2.", solution: "y'=x²-2mx+m²-1. y'(2)=0: 4-4m+m²-1=0 → m²-4m+3=0 → m=1 hoặc m=3.\ny''=2x-2m, y''(2)=4-2m. Cần y''(2)>0: m<2. Vậy m=1 (m=3 cho cực đại, loại).", answer: "1" },
          { prompt: "Khảo sát và tìm điểm uốn của đồ thị y=x³−3x²+2.", solution: "y''=6x-6=0 → x=1. y(1)=1-3+2=0.\nĐiểm uốn (1;0).", answer: "(1;0)" },
          { prompt: "Cho f(x)=ax³+bx²+cx+d có f'(x)=3x²−6x+3. Tìm a, b, c.", solution: "f'(x)=3ax²+2bx+c. So sánh: 3a=3→a=1. 2b=-6→b=-3. c=3.", answer: "a=1, b=-3, c=3" },
          { prompt: "Tìm m để hàm số y=x³+3x²+mx+1 đồng biến trên ℝ.", solution: "y'=3x²+6x+m. Cần y'≥0 với mọi x: Δ'≤0: 9-3m≤0 → m≥3.", answer: "m≥3" },
          { prompt: "Cho y=(x−1)/(x+2). Tính y' và xét tính đơn điệu.", solution: "y'=[(x+2)-(x-1)]/(x+2)²=3/(x+2)².\nVì y'>0 với mọi x≠-2, hàm luôn đồng biến trên từng khoảng xác định.", answer: "Luôn đồng biến (y'>0)" },
        ],
      },
      {
        id: "vecto-he-truc-toa-do-khong-gian-12",
        title: "Vectơ và hệ trục toạ độ trong không gian",
        questions: [
          { prompt: "Trong không gian Oxyz, điểm M(x,y,z) có hình chiếu vuông góc lên trục Ox là điểm nào?", options: ["(x,0,0)", "(0,y,0)", "(0,0,z)", "(x,y,0)"], correct: 0, explain: "Hình chiếu lên trục Ox giữ nguyên hoành độ x, các tọa độ còn lại bằng 0." },
          { prompt: "Cho A(1,2,3), B(4,6,3). Tính độ dài AB.", options: ["5", "7", "25", "3"], correct: 0, explain: "AB = √((4-1)²+(6-2)²+(3-3)²) = √(9+16+0) = √25 = 5." },
          { prompt: "Một vectơ trong không gian Oxyz được xác định bởi bao nhiêu tọa độ?", options: ["3", "2", "1", "4"], correct: 0, explain: "Vectơ trong không gian ba chiều có 3 tọa độ (x,y,z)." },
          { prompt: "Cho vectơ a=(1,2,3), b=(2,−1,1). Tính a+b.", options: ["(3,1,4)", "(3,3,4)", "(1,3,2)", "(-1,3,2)"], correct: 0, explain: "Cộng từng tọa độ: (1+2; 2-1; 3+1) = (3;1;4)." },
          { prompt: "Tích vô hướng của hai vectơ a=(1,0,0), b=(0,1,0) bằng?", options: ["0", "1", "-1", "2"], correct: 0, explain: "a·b = 1×0+0×1+0×0 = 0, chứng tỏ hai vectơ vuông góc." },
          { prompt: "Trong không gian Oxyz, mặt phẳng (Oxy) có phương trình là?", options: ["z = 0", "x = 0", "y = 0", "x+y+z = 0"], correct: 0, explain: "Mặt phẳng (Oxy) là tập hợp các điểm có cao độ z=0." },
        ],
        exercises: [
          { prompt: "Cho A(1,0,2), B(3,4,0). Tính tọa độ trung điểm M của AB.", solution: "M = ((1+3)/2; (0+4)/2; (2+0)/2) = (2;2;1).", answer: "(2;2;1)" },
          { prompt: "Tính tích vô hướng của a=(1,2,−1) và b=(3,0,2).", solution: "a·b = 1×3+2×0+(-1)×2 = 3+0-2 = 1.", answer: "1" },
          { prompt: "Cho A(0,0,0), B(3,4,0). Tính độ dài AB.", solution: "AB = √(3²+4²+0²) = √25 = 5.", answer: "5" },
          { prompt: "Cho a=(2,−1,3), b=(1,2,−1). Tính a−b.", solution: "a-b = (2-1; -1-2; 3-(-1)) = (1;-3;4).", answer: "(1;-3;4)" },
          { prompt: "Tính độ dài vectơ a=(2,2,1).", solution: "|a| = √(4+4+1) = √9 = 3.", answer: "3" },
          { prompt: "Cho A(1,1,1), B(2,3,4). Tính tọa độ vectơ AB.", solution: "AB = (2-1; 3-1; 4-1) = (1;2;3).", answer: "(1;2;3)" },
          { prompt: "Hai vectơ a=(2,4,−2) và b=(1,2,−1) có cùng phương không?", solution: "a = 2×b (mỗi tọa độ của a gấp đôi tọa độ tương ứng của b).\nVậy hai vectơ cùng phương.", answer: "hai vectơ cùng phương" },
          { prompt: "Tính tọa độ trọng tâm G của tam giác ABC với A(1,2,3), B(3,0,1), C(2,4,2).", solution: "G = ((1+3+2)/3; (2+0+4)/3; (3+1+2)/3) = (2;2;2).", answer: "(2;2;2)" },
          { prompt: "Cho a=(1,0,0), b=(0,1,0). Tính góc giữa hai vectơ.", solution: "a·b = 0, nên hai vectơ vuông góc, góc giữa chúng bằng 90°.", answer: "90°" },
          { prompt: "Cho A(2,1,−1), B(4,3,1). Tính khoảng cách AB.", solution: "AB = √((4-2)²+(3-1)²+(1-(-1))²) = √(4+4+4) = √12 = 2√3.", answer: "2√3" },
        ],
        advanced: [
          { prompt: "Cho điểm M trên trục Oz cách đều hai điểm A(1,2,1) và B(2,1,3). Tìm tọa độ M.", solution: "M có dạng (0,0,z). MA²=1+4+(z-1)²=5+(z-1)². MB²=4+1+(z-3)²=5+(z-3)².\nĐặt bằng nhau: (z-1)²=(z-3)² → z²-2z+1=z²-6z+9 → 4z=8 → z=2.\nVậy M(0,0,2).", answer: "M(0,0,2)" },
          { prompt: "Cho hình hộp chữ nhật có 3 cạnh xuất phát từ 1 đỉnh là a=2, b=3, c=4 (theo 3 trục vuông góc). Tính thể tích.", solution: "Vì 3 cạnh đôi một vuông góc, thể tích = tích 3 cạnh = 2×3×4 = 24.", answer: "24" },
          { prompt: "Cho A(1,2,3), B(4,−1,2), C(2,3,−1). Ước lượng diện tích tam giác ABC bằng công thức tích có hướng: S=½|AB×AC|.", solution: "AB=(3,-3,-1), AC=(1,1,-4).\nAB×AC = ((-3)(-4)-(-1)(1); (-1)(1)-(3)(-4); (3)(1)-(-3)(1)) = (13;11;6).\n|AB×AC|=√(169+121+36)=√326.\nDiện tích = ½√326 ≈ 9,03.", answer: "½√326 ≈ 9,03" },
          { prompt: "Cho A(1,0,0), B(0,1,0), C(0,0,1). Tính diện tích tam giác ABC.", solution: "AB=(-1,1,0). AC=(-1,0,1).\nAB×AC=(1,1,1). |AB×AC|=√3.\nDiện tích=√3/2.", answer: "√3/2" },
          { prompt: "Tìm tọa độ trung điểm M của đoạn AB với A(2,−1,3), B(4,3,−1).", solution: "M=((2+4)/2;(-1+3)/2;(3-1)/2)=(3;1;1).", answer: "(3;1;1)" },
          { prompt: "Cho vectơ a=(1,2,−2). Tính độ dài vectơ a.", solution: "|a|=√(1+4+4)=3.", answer: "3" },
          { prompt: "Cho A(1,1,1), B(2,3,4). Tính khoảng cách AB.", solution: "AB=√((2-1)²+(3-1)²+(4-1)²)=√(1+4+9)=√14.", answer: "√14" },
          { prompt: "Cho 2 vectơ a=(2,−1,3), b=(1,4,−2). Tính tích vô hướng a·b.", solution: "a·b=2×1+(-1)×4+3×(-2)=2-4-6=-8.", answer: "-8" },
          { prompt: "Tìm m để 2 vectơ a=(1,2,m) và b=(2,4,6) cùng phương.", solution: "Cùng phương: 1/2=2/4=m/6. Vì 1/2=2/4=0,5 nên m/6=0,5 → m=3.", answer: "3" },
          { prompt: "Tứ diện ABCD với A(0,0,0), B(1,0,0), C(0,1,0), D(0,0,1). Tính thể tích (V=1/6|tích hỗn hợp AB,AC,AD|).", solution: "AB=(1,0,0), AC=(0,1,0), AD=(0,0,1). Tích hỗn hợp=1.\nV=1/6×1=1/6.", answer: "1/6" },
        ],
      },
      {
        id: "so-dac-trung-phan-tan-12",
        title: "Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm",
        questions: [
          { prompt: "Phương sai của mẫu số liệu ghép nhóm đo lường điều gì?", options: ["Mức độ phân tán của dữ liệu quanh giá trị trung bình", "Giá trị lớn nhất trong mẫu", "Giá trị nhỏ nhất trong mẫu", "Số lượng nhóm dữ liệu"], correct: 0, explain: "Phương sai cho biết mức độ các số liệu phân tán xa hay gần giá trị trung bình." },
          { prompt: "Độ lệch chuẩn được tính từ phương sai bằng cách nào?", options: ["Lấy căn bậc hai của phương sai", "Bình phương của phương sai", "Chia đôi phương sai", "Không liên quan đến phương sai"], correct: 0, explain: "Độ lệch chuẩn = √(phương sai)." },
          { prompt: "Khoảng biến thiên của mẫu số liệu là gì?", options: ["Hiệu giữa giá trị lớn nhất và giá trị nhỏ nhất", "Giá trị trung bình cộng", "Trung vị của mẫu", "Mốt của mẫu"], correct: 0, explain: "Khoảng biến thiên = giá trị lớn nhất - giá trị nhỏ nhất." },
          { prompt: "Khoảng tứ phân vị đo lường điều gì?", options: ["Độ phân tán của khoảng 50% dữ liệu ở giữa", "Toàn bộ phạm vi dữ liệu", "Chỉ giá trị lớn nhất", "Chỉ giá trị nhỏ nhất"], correct: 0, explain: "Khoảng tứ phân vị là hiệu giữa tứ phân vị thứ ba và thứ nhất, phản ánh độ phân tán của phần dữ liệu ở giữa." },
          { prompt: "Phương sai càng lớn thì dữ liệu càng như thế nào?", options: ["Càng phân tán, không đồng đều", "Càng đồng đều", "Không thay đổi", "Không xác định được"], correct: 0, explain: "Phương sai lớn nghĩa là các giá trị lệch xa trung bình nhiều, dữ liệu phân tán rộng." },
          { prompt: "Đơn vị của độ lệch chuẩn so với đơn vị của dữ liệu gốc như thế nào?", options: ["Cùng đơn vị với dữ liệu gốc", "Bình phương đơn vị dữ liệu gốc", "Không có đơn vị", "Luôn tính bằng %"], correct: 0, explain: "Độ lệch chuẩn (khác phương sai) có cùng đơn vị với dữ liệu gốc, nên dễ so sánh trực tiếp hơn." },
        ],
        exercises: [
          { prompt: "Mẫu số liệu có phương sai 16. Tính độ lệch chuẩn.", solution: "Độ lệch chuẩn = √16 = 4.", answer: "4" },
          { prompt: "Mẫu A có độ lệch chuẩn 2, mẫu B có độ lệch chuẩn 5. Mẫu nào có dữ liệu phân tán hơn?", solution: "Mẫu B phân tán hơn vì có độ lệch chuẩn lớn hơn.", answer: "Mẫu B phân tán hơn vì có độ lệch chuẩn lớn hơn" },
          { prompt: "Mẫu số liệu có giá trị lớn nhất 90, nhỏ nhất 40. Tính khoảng biến thiên.", solution: "Khoảng biến thiên = 90-40 = 50.", answer: "50" },
          { prompt: "Mẫu số liệu có tứ phân vị Q1=20, Q3=35. Tính khoảng tứ phân vị.", solution: "Khoảng tứ phân vị = Q3-Q1 = 35-20 = 15.", answer: "15" },
          { prompt: "Nếu mọi giá trị trong mẫu bằng nhau thì phương sai bằng bao nhiêu?", solution: "Phương sai bằng 0, vì không có sự phân tán nào quanh giá trị trung bình.", answer: "0," },
          { prompt: "Tính phương sai của mẫu 4, 4, 4, 4.", solution: "Mọi giá trị đều bằng trung bình (4), nên phương sai = 0.", answer: "0" },
          { prompt: "Độ lệch chuẩn có đơn vị như thế nào so với dữ liệu gốc?", solution: "Độ lệch chuẩn có cùng đơn vị với dữ liệu gốc (khác với phương sai là bình phương đơn vị).", answer: "Độ lệch chuẩn có cùng đơn vị với dữ liệu gốc (khác với phương sai là bình phương đơn vị)" },
          { prompt: "Cho phương sai bằng 25. Tính độ lệch chuẩn.", solution: "Độ lệch chuẩn = √25 = 5.", answer: "5" },
          { prompt: "Mẫu số liệu có khoảng biến thiên bằng 0. Kết luận gì về mẫu này?", solution: "Khoảng biến thiên = giá trị lớn nhất - giá trị nhỏ nhất = 0, nghĩa là tất cả các giá trị trong mẫu đều bằng nhau.", answer: "0," },
          { prompt: "So sánh độ phân tán của hai mẫu có phương sai lần lượt là 9 và 4.", solution: "Độ lệch chuẩn tương ứng là 3 và 2. Mẫu có phương sai 9 phân tán hơn.", answer: "9" },
        ],
        advanced: [
          { prompt: "Hai lớp có cùng điểm trung bình 7, độ lệch chuẩn lớp A là 0,8, lớp B là 1,5. Lớp nào có kết quả học tập đồng đều hơn?", solution: "Lớp A có độ lệch chuẩn nhỏ hơn, nên kết quả học tập đồng đều hơn.", answer: "Lớp A có độ lệch chuẩn nhỏ hơn, nên kết quả học tập đồng đều hơn" },
          { prompt: "Mẫu số liệu có phương sai 25 và số trung bình 50. Tính hệ số biến thiên CV (=độ lệch chuẩn/trung bình × 100%).", solution: "Độ lệch chuẩn = √25 = 5.\nCV = 5/50×100% = 10%.", answer: "10%" },
          { prompt: "Hai mẫu A (n=10, phương sai 16) và B (n=15, phương sai 9) được ghép chung. Độ lệch chuẩn của mẫu ghép có đơn giản là trung bình cộng hai độ lệch chuẩn không?", solution: "Không. Phương sai của mẫu ghép phụ thuộc cả vào chênh lệch giữa các số trung bình từng mẫu và cỡ mẫu, cần công thức phương sai tổng hợp phức tạp hơn, không đơn giản là trung bình cộng.", answer: "Không. Phương sai của mẫu ghép phụ thuộc cả vào chênh lệch giữa các số trung bình từng mẫu và cỡ mẫu, cần công thức phương sai tổng hợp phức tạp hơn, không đơn giản là trung bình cộng" },
          { prompt: "Hai lớp có cùng trung bình. Lớp A độ lệch chuẩn 1,2, lớp B độ lệch chuẩn 2,5. Lớp nào ổn định hơn?", solution: "Lớp A có độ lệch chuẩn nhỏ hơn nên ổn định hơn (ít phân tán hơn).", answer: "Lớp A" },
          { prompt: "Mẫu số liệu có khoảng biến thiên = 0. Kết luận gì?", solution: "Tất cả các giá trị trong mẫu đều bằng nhau.", answer: "Tất cả giá trị bằng nhau" },
          { prompt: "Tính phương sai của mẫu: 4, 4, 4, 4.", solution: "Vì tất cả giá trị bằng nhau, phương sai = 0.", answer: "0" },
          { prompt: "Nếu nhân mỗi giá trị của mẫu với hằng số k, phương sai mới bằng bao nhiêu lần phương sai cũ?", solution: "Phương sai mới = k² × phương sai cũ.", answer: "k² lần" },
          { prompt: "Một mẫu 8 giá trị có độ lệch chuẩn 3. Tính phương sai.", solution: "Phương sai = 3² = 9.", answer: "9" },
          { prompt: "Hai mẫu cùng cỡ n=20. Mẫu A có khoảng tứ phân vị 5, mẫu B có khoảng tứ phân vị 8. Mẫu nào tập trung hơn?", solution: "Mẫu A có khoảng tứ phân vị nhỏ hơn nên tập trung hơn.", answer: "Mẫu A" },
          { prompt: "Mẫu 6 giá trị có tổng bình phương độ lệch so với trung bình là 54. Tính độ lệch chuẩn.", solution: "Phương sai=54/6=9. Độ lệch chuẩn=√9=3.", answer: "3" },
        ],
      },
      {
        id: "nguyen-ham-12",
        title: "Nguyên hàm",
        questions: [
          { prompt: "Nguyên hàm của f(x)=x² là?", options: ["x³/3 + C", "x³ + C", "3x + C", "x³/2 + C"], correct: 0, explain: "Công thức ∫xⁿdx = xⁿ⁺¹/(n+1) + C, với n=2 được x³/3+C." },
          { prompt: "Nguyên hàm của f(x)=cosx là?", options: ["sinx + C", "-sinx + C", "cosx + C", "-cosx + C"], correct: 0, explain: "∫cosx dx = sinx + C." },
          { prompt: "Nguyên hàm của f(x)=1/x (x>0) là?", options: ["ln|x| + C", "1/x² + C", "-1/x + C", "x + C"], correct: 0, explain: "∫(1/x)dx = ln|x| + C." },
          { prompt: "Nguyên hàm của f(x)=eˣ là?", options: ["eˣ + C", "xeˣ + C", "eˣ/x + C", "ln(x) + C"], correct: 0, explain: "Hàm số mũ eˣ là nguyên hàm của chính nó: ∫eˣdx = eˣ + C." },
          { prompt: "Nguyên hàm của f(x)=3 (hằng số) là?", options: ["3x + C", "3 + C", "x + C", "3x² + C"], correct: 0, explain: "∫3dx = 3x + C." },
          { prompt: "Nguyên hàm của f(x)=sinx là?", options: ["-cosx + C", "cosx + C", "-sinx + C", "sinx + C"], correct: 0, explain: "∫sinx dx = -cosx + C." },
        ],
        exercises: [
          { prompt: "Tìm nguyên hàm của f(x)=4x³−2x+1.", solution: "F(x) = x⁴-x²+x+C.", answer: "x⁴-x²+x+C" },
          { prompt: "Tìm nguyên hàm của f(x)=2sinx−3cosx.", solution: "F(x) = -2cosx-3sinx+C.", answer: "-2cosx-3sinx+C" },
          { prompt: "Tìm nguyên hàm F(x) của f(x)=2x biết F(1)=5.", solution: "Nguyên hàm tổng quát: F(x)=x²+C.\nThay x=1: 1+C=5 → C=4.\nVậy F(x)=x²+4.", answer: "x²+4" },
          { prompt: "Tìm nguyên hàm của f(x)=1/x² (x≠0).", solution: "Viết f(x)=x⁻². Nguyên hàm = -x⁻¹+C = -1/x+C.", answer: "-1/x+C" },
          { prompt: "Tìm nguyên hàm của f(x)=5x⁴.", solution: "F(x) = x⁵+C.", answer: "x⁵+C" },
          { prompt: "Tìm nguyên hàm của f(x)=e^(2x).", solution: "F(x) = (1/2)e^(2x)+C.", answer: "(1/2)e^(2x)+C" },
          { prompt: "Tìm nguyên hàm của f(x)=3x²−4x+2.", solution: "F(x) = x³-2x²+2x+C.", answer: "x³-2x²+2x+C" },
          { prompt: "Tìm nguyên hàm của f(x)=1/(2x+1) (x>−1/2).", solution: "F(x) = (1/2)ln|2x+1|+C.", answer: "(1/2)ln|2x+1|+C" },
          { prompt: "Tìm nguyên hàm F(x) của f(x)=cosx biết F(0)=1.", solution: "Nguyên hàm tổng quát: F(x)=sinx+C.\nThay x=0: 0+C=1 → C=1.\nVậy F(x)=sinx+1.", answer: "sinx+1" },
          { prompt: "Tìm nguyên hàm của f(x)=6x²+2.", solution: "F(x) = 2x³+2x+C.", answer: "2x³+2x+C" },
        ],
        advanced: [
          { prompt: "Tìm nguyên hàm của f(x)=x·eˣ (dùng phương pháp nguyên hàm từng phần với u=x, dv=eˣdx).", solution: "∫x·eˣdx = x·eˣ - ∫eˣdx = x·eˣ - eˣ + C = eˣ(x-1) + C.", answer: "eˣ(x-1) + C" },
          { prompt: "Tìm nguyên hàm F(x) của f(x)=3x²−4x+1, biết đồ thị F đi qua điểm (1,2).", solution: "F(x)=x³-2x²+x+C. Thay x=1, F=2: 1-2+1+C=2 → C=2.\nVậy F(x)=x³-2x²+x+2.", answer: "x³-2x²+x+2" },
          { prompt: "Tính nguyên hàm: ∫(2x+1)/(x²+x+1) dx", solution: "Nhận xét: (x²+x+1)' = 2x+1, đúng bằng tử số.\nVậy nguyên hàm = ln|x²+x+1| + C.", answer: "ln|x²+x+1| + C" },
          { prompt: "Tìm nguyên hàm của f(x)=cos(2x).", solution: "F(x)=(1/2)sin(2x)+C.", answer: "(1/2)sin(2x)+C" },
          { prompt: "Tính ∫x·cos(x)dx (dùng nguyên hàm từng phần).", solution: "u=x, dv=cosx dx → du=dx, v=sinx.\n∫x cosx dx = x sinx - ∫sinx dx = x sinx + cosx + C.", answer: "x sinx + cosx + C" },
          { prompt: "Tìm nguyên hàm của f(x)=1/(x²−1) (phân tích thành phân thức đơn giản).", solution: "1/(x²-1) = (1/2)[1/(x-1) - 1/(x+1)].\nNguyên hàm = (1/2)ln|x-1| - (1/2)ln|x+1| + C.", answer: "(1/2)ln|(x-1)/(x+1)| + C" },
          { prompt: "Tính ∫e^(2x)dx.", solution: "= (1/2)e^(2x) + C.", answer: "(1/2)e^(2x) + C" },
          { prompt: "Tìm nguyên hàm của f(x)=sin³x·cosx (đổi biến t=sinx).", solution: "Đặt t=sinx, dt=cosx dx: ∫t³dt = t⁴/4+C = sin⁴x/4 + C.", answer: "sin⁴x/4 + C" },
          { prompt: "Tính ∫(3x²−2)/x dx.", solution: "= ∫(3x - 2/x)dx = 3x²/2 - 2ln|x| + C.", answer: "3x²/2 - 2ln|x| + C" },
          { prompt: "Tìm nguyên hàm F(x) của f(x)=4x³−6x²+2 biết F(1)=0.", solution: "F(x)=x⁴-2x³+2x+C. F(1)=1-2+2+C=0 → C=-1.\nF(x)=x⁴-2x³+2x-1.", answer: "x⁴-2x³+2x-1" },
        ],
      },
      {
        id: "tich-phan-12",
        title: "Tích phân",
        questions: [
          { prompt: "∫₀¹ x dx = ?", options: ["1/2", "1", "2", "1/3"], correct: 0, explain: "Nguyên hàm là x²/2, tính từ 0 đến 1: 1/2 - 0 = 1/2." },
          { prompt: "∫₀² 3 dx = ?", options: ["6", "3", "2", "9"], correct: 0, explain: "Nguyên hàm là 3x, tính từ 0 đến 2: 6-0=6." },
          { prompt: "∫₀^π sinx dx = ?", options: ["2", "0", "-2", "1"], correct: 0, explain: "Nguyên hàm là -cosx, tính từ 0 đến π: (-cosπ)-(-cos0)=1+1=2." },
          { prompt: "Diện tích hình phẳng giới hạn bởi y=f(x)≥0, trục Ox, x=a, x=b tính bằng?", options: ["∫ₐᵇ f(x)dx", "∫ₐᵇ f'(x)dx", "f(b)-f(a)", "∫ₐᵇ |f(x)|²dx"], correct: 0, explain: "Đây là công thức tính diện tích hình phẳng bằng tích phân — nội dung ứng dụng hình học của tích phân." },
          { prompt: "∫₁² 2x dx = ?", options: ["3", "4", "2", "6"], correct: 0, explain: "Nguyên hàm là x², tính từ 1 đến 2: 4-1=3." },
          { prompt: "Nếu F(x) là một nguyên hàm của f(x) thì ∫ₐᵇ f(x)dx = ?", options: ["F(b) - F(a)", "F(a) - F(b)", "F(a) + F(b)", "F(b)·F(a)"], correct: 0, explain: "Đây là công thức Newton-Leibniz cơ bản của tích phân." },
        ],
        exercises: [
          { prompt: "Tính ∫₁³(2x+1)dx.", solution: "Nguyên hàm là x²+x.\nTại x=3: 12. Tại x=1: 2.\nKết quả = 12-2 = 10.", answer: "10" },
          { prompt: "Tính ∫₀²x²dx.", solution: "Nguyên hàm là x³/3.\nTại x=2: 8/3. Tại x=0: 0.\nKết quả = 8/3.", answer: "8/3" },
          { prompt: "Tính diện tích hình phẳng giới hạn bởi y=x², trục Ox, x=0, x=2.", solution: "S = ∫₀²x²dx = 8/3 (đơn vị diện tích).", answer: "8/3 (đơn vị diện tích)" },
          { prompt: "Tính ∫₀¹eˣdx.", solution: "[eˣ] từ 0 đến 1 = e¹-e⁰ = e-1.", answer: "e-1" },
          { prompt: "Tính ∫₀^(π/2)cosx dx.", solution: "[sinx] từ 0 đến π/2 = 1-0 = 1.", answer: "1" },
          { prompt: "Tính ∫₁²(3x²−2)dx.", solution: "Nguyên hàm là x³-2x.\nTại x=2: 8-4=4. Tại x=1: 1-2=-1.\nKết quả = 4-(-1) = 5.", answer: "5" },
          { prompt: "Tính ∫₀³4dx.", solution: "Nguyên hàm là 4x. Tại x=3: 12.\nKết quả = 12.", answer: "12" },
          { prompt: "Tính ∫₁⁴(1/x)dx.", solution: "Nguyên hàm là ln|x|.\nTại x=4: ln4. Tại x=1: ln1=0.\nKết quả = ln4.", answer: "ln4" },
          { prompt: "Tính thể tích khối tròn xoay khi quay y=x quanh trục Ox trên đoạn [0;2] (công thức V=π∫y²dx).", solution: "V = π∫₀²x²dx = π×8/3 = 8π/3.", answer: "8π/3" },
          { prompt: "Tính ∫₀^π sin²x dx (gợi ý: dùng công thức hạ bậc sin²x=(1-cos2x)/2).", solution: "∫(1-cos2x)/2 dx = [x/2 - sin2x/4] từ 0 đến π = π/2 - 0 = π/2.", answer: "π/2" },
        ],
        advanced: [
          { prompt: "Tính ∫₀¹ x·eˣ dx (dùng nguyên hàm từng phần).", solution: "Nguyên hàm của x·eˣ là eˣ(x-1).\nTại x=1: e¹(0)=0. Tại x=0: e⁰(-1)=-1.\nKết quả = 0-(-1) = 1.", answer: "1" },
          { prompt: "Tính diện tích hình phẳng giới hạn bởi y=x² và y=x.", solution: "Giao điểm: x²=x → x=0 hoặc x=1.\nS = ∫₀¹(x-x²)dx = [x²/2-x³/3] từ 0 đến 1 = (1/2-1/3)-0 = 1/6.", answer: "1/6" },
          { prompt: "Tính thể tích khối tròn xoay khi quay hình phẳng giới hạn bởi y=√x, trục Ox, x=0 đến x=4 quanh trục Ox.", solution: "V = π∫₀⁴(√x)²dx = π∫₀⁴x dx = π[x²/2] từ 0 đến 4 = π×8 = 8π.", answer: "8π" },
          { prompt: "Tính ∫₀² (3x²−2x+1)dx.", solution: "= [x³-x²+x] từ 0 đến 2 = (8-4+2)-0 = 6.", answer: "6" },
          { prompt: "Tính ∫₁^e (1/x)dx.", solution: "= [lnx] từ 1 đến e = ln(e)-ln(1) = 1-0 = 1.", answer: "1" },
          { prompt: "Tính diện tích hình phẳng giới hạn bởi y=x²−4 và trục Ox.", solution: "Giao điểm x=±2. Trong [-2,2], x²-4≤0.\nS = -∫₋₂²(x²-4)dx = -[x³/3-4x] từ -2 đến 2 = 32/3.", answer: "32/3" },
          { prompt: "Tính ∫₀^π sinx dx.", solution: "= [-cosx] từ 0 đến π = -cos(π)-(-cos0) = 1+1 = 2.", answer: "2" },
          { prompt: "Tính thể tích khối tròn xoay khi quay y=x² quanh Ox trên [0,1].", solution: "V=π∫₀¹x⁴dx=π[x⁵/5] từ 0 đến 1 = π/5.", answer: "π/5" },
          { prompt: "Tính ∫₀¹ (2x+1)² dx (đổi biến u=2x+1).", solution: "Đặt u=2x+1, du=2dx. Khi x=0,u=1; x=1,u=3.\n∫u²(du/2) = (1/6)[u³] từ 1 đến 3 = (1/6)(27-1) = 13/3.", answer: "13/3" },
          { prompt: "Tính diện tích giữa 2 đường y=4−x² và y=x²−4.", solution: "Giao điểm: x=±2. S=∫₋₂²[(4-x²)-(x²-4)]dx=∫₋₂²(8-2x²)dx=[8x-2x³/3] từ -2 đến 2 = 64/3.", answer: "64/3" },
        ],
      },
      {
        id: "phuong-phap-toa-do-khong-gian-12",
        title: "Phương pháp toạ độ trong không gian",
        questions: [
          { prompt: "Phương trình tổng quát của mặt phẳng trong không gian có dạng nào?", options: ["ax+by+cz+d=0", "ax+by+c=0", "ax²+by+cz=0", "x+y+z=d"], correct: 0, explain: "Đây là dạng phương trình tổng quát của mặt phẳng trong không gian." },
          { prompt: "Vectơ pháp tuyến của mặt phẳng ax+by+cz+d=0 là?", options: ["(a,b,c)", "(a,b,d)", "(b,c,d)", "(a,c,d)"], correct: 0, explain: "Vectơ pháp tuyến của mặt phẳng lấy từ các hệ số a, b, c của x, y, z." },
          { prompt: "Phương trình mặt cầu tâm I(a,b,c), bán kính R có dạng nào?", options: ["(x-a)²+(y-b)²+(z-c)²=R²", "(x-a)²+(y-b)²+(z-c)²=R", "x²+y²+z²=R²", "ax+by+cz=R"], correct: 0, explain: "Đây là phương trình chính tắc của mặt cầu tâm I(a,b,c), bán kính R." },
          { prompt: "Đường thẳng trong không gian thường được biểu diễn dưới dạng nào?", options: ["Phương trình tham số", "Phương trình bậc hai", "Phương trình mặt phẳng", "Không biểu diễn được bằng phương trình"], correct: 0, explain: "Đường thẳng trong không gian thường viết dưới dạng phương trình tham số theo một điểm và vectơ chỉ phương." },
          { prompt: "Góc giữa hai mặt phẳng trong không gian được tính thông qua góc giữa hai đại lượng nào?", options: ["Hai vectơ pháp tuyến của chúng", "Hai vectơ chỉ phương bất kỳ", "Hai điểm bất kỳ trên mặt phẳng", "Không tính được"], correct: 0, explain: "Góc giữa hai mặt phẳng liên hệ trực tiếp với góc giữa hai vectơ pháp tuyến tương ứng." },
          { prompt: "Mặt cầu tâm O(0,0,0), bán kính R=3 có phương trình nào?", options: ["x²+y²+z²=9", "x²+y²+z²=3", "x+y+z=9", "x²+y²+z²=6"], correct: 0, explain: "Phương trình mặt cầu tâm gốc tọa độ bán kính R là x²+y²+z²=R²=9." },
        ],
        exercises: [
          { prompt: "Viết phương trình mặt phẳng đi qua A(1,2,3) với vectơ pháp tuyến n=(2,−1,1).", solution: "2(x-1)-1(y-2)+1(z-3)=0 → 2x-y+z-3=0.", answer: "0" },
          { prompt: "Tính khoảng cách từ gốc tọa độ O đến mặt phẳng x+2y+2z−6=0.", solution: "d = |0+0+0-6|/√(1+4+4) = 6/3 = 2.", answer: "2" },
          { prompt: "Viết phương trình mặt cầu tâm I(1,−2,3), bán kính R=4.", solution: "(x-1)²+(y+2)²+(z-3)²=16.", answer: "16" },
          { prompt: "Tìm vectơ pháp tuyến của mặt phẳng 3x−2y+z+5=0.", solution: "Vectơ pháp tuyến lấy từ các hệ số: (3,-2,1).", answer: "(3,-2,1)" },
          { prompt: "Tìm tâm và bán kính mặt cầu x²+y²+z²−2x+4y−4=0.", solution: "Đưa về dạng chuẩn: (x-1)²+(y+2)²+z²=1+4+4=9.\nTâm I(1,-2,0), bán kính R=3.", answer: "3" },
          { prompt: "Cho A(1,1,1), B(3,3,3). Viết phương trình tham số đường thẳng AB.", solution: "Vectơ chỉ phương AB=(2,2,2), rút gọn (1,1,1).\nPT tham số: x=1+t, y=1+t, z=1+t.", answer: "1+t" },
          { prompt: "Tính khoảng cách giữa hai mặt phẳng song song x+y+z−1=0 và x+y+z−4=0.", solution: "d = |1-4|/√(1+1+1) = 3/√3 = √3.", answer: "√3" },
          { prompt: "Viết phương trình mặt phẳng đi qua gốc tọa độ và có vectơ pháp tuyến (1,1,1).", solution: "1(x-0)+1(y-0)+1(z-0)=0 → x+y+z=0.", answer: "0" },
          { prompt: "Tính bán kính mặt cầu tâm O(0,0,0) đi qua điểm A(3,4,0).", solution: "R = OA = √(9+16+0) = 5.", answer: "5" },
          { prompt: "Cho A(1,0,0), B(0,1,0). Viết phương trình mặt phẳng trung trực của AB.", solution: "Trung điểm M=(0,5; 0,5; 0). Vectơ AB=(-1,1,0) là pháp tuyến.\nPT: -1(x-0,5)+1(y-0,5)+0(z-0)=0 → -x+y=0, tức x-y=0.", answer: "0" },
        ],
        advanced: [
          { prompt: "Viết phương trình mặt phẳng đi qua 3 điểm A(1,0,0), B(0,2,0), C(0,0,3).", solution: "Dùng phương trình mặt phẳng theo đoạn chắn: x/1+y/2+z/3=1.\nQuy đồng và nhân 6: 6x+3y+2z-6=0.", answer: "0" },
          { prompt: "Tìm hình chiếu vuông góc của điểm M(1,2,3) lên mặt phẳng (Oxy).", solution: "Hình chiếu lên (Oxy) giữ nguyên x, y và cho z=0: (1;2;0).", answer: "0: (1;2;0)" },
          { prompt: "Viết phương trình mặt cầu tâm I(1,2,−1) bán kính 3.", solution: "(x-1)²+(y-2)²+(z+1)²=9.", answer: "(x-1)²+(y-2)²+(z+1)²=9" },
          { prompt: "Tìm giao điểm của đường thẳng x=1+t, y=2t, z=3−t với mặt phẳng x+y+z=6.", solution: "(1+t)+2t+(3-t)=6 → 2t+4=6 → t=1.\nĐiểm: (2;2;2).", answer: "(2;2;2)" },
          { prompt: "Cho A(1,0,0), B(0,2,0), C(0,0,3). Viết phương trình mặt phẳng (ABC).", solution: "Phương trình đoạn chắn: x/1+y/2+z/3=1.\nQuy đồng: 6x+3y+2z-6=0.", answer: "6x+3y+2z-6=0" },
          { prompt: "Tính khoảng cách từ A(1,2,3) đến mặt phẳng 2x−y+2z−5=0.", solution: "d=|2(1)-2+2(3)-5|/√(4+1+4)=|1|/3=1/3.", answer: "1/3" },
          { prompt: "Viết phương trình mặt phẳng qua M(2,1,−1) vuông góc với đường có vectơ chỉ phương (1,−2,3).", solution: "PT: 1(x-2)-2(y-1)+3(z+1)=0 → x-2y+3z+3=0.", answer: "x-2y+3z+3=0" },
          { prompt: "Tìm tâm và bán kính mặt cầu: x²+y²+z²−2x+4y−6z+5=0.", solution: "(x-1)²+(y+2)²+(z-3)²=1+4+9-5=9.\nTâm (1;-2;3), bán kính 3.", answer: "Tâm (1;-2;3), R=3" },
          { prompt: "Cho A(1,1,1), B(3,3,3). Viết phương trình mặt phẳng trung trực của AB.", solution: "Trung điểm M=(2;2;2). Vectơ AB=(2,2,2) là pháp tuyến.\nPT: 2(x-2)+2(y-2)+2(z-2)=0 → x+y+z-6=0.", answer: "x+y+z-6=0" },
          { prompt: "Tính khoảng cách giữa hai mặt phẳng song song: x+2y−2z+3=0 và x+2y−2z−6=0.", solution: "d = |3-(-6)|/√(1+4+4) = 9/3 = 3.", answer: "3" },
        ],
      },
      {
        id: "xac-suat-co-dieu-kien-12",
        title: "Xác suất có điều kiện",
        questions: [
          { prompt: "Xác suất có điều kiện P(A|B) là xác suất của biến cố nào?", options: ["A xảy ra biết rằng B đã xảy ra", "A và B cùng xảy ra", "A hoặc B xảy ra", "Không liên quan gì đến B"], correct: 0, explain: "P(A|B) là xác suất của A với điều kiện đã biết B xảy ra." },
          { prompt: "Công thức tính xác suất có điều kiện P(A|B) là?", options: ["P(A∩B) / P(B)", "P(A) × P(B)", "P(A) + P(B)", "P(B) / P(A)"], correct: 0, explain: "Công thức xác suất có điều kiện: P(A|B) = P(A∩B)/P(B), với P(B)>0." },
          { prompt: "Hai biến cố A, B độc lập khi nào?", options: ["P(A∩B) = P(A)×P(B)", "P(A∩B) = P(A)+P(B)", "P(A|B) = 0", "A và B xung khắc"], correct: 0, explain: "Định nghĩa hai biến cố độc lập: xác suất giao bằng tích hai xác suất thành phần." },
          { prompt: "Công thức xác suất toàn phần dùng để làm gì?", options: ["Tính xác suất của một biến cố thông qua hệ đầy đủ các biến cố khác", "Chỉ tính xác suất đơn giản của 1 biến cố", "Không có công thức nào như vậy", "Chỉ áp dụng cho biến cố độc lập"], correct: 0, explain: "Công thức xác suất toàn phần giúp tính P(A) khi biết cách A phụ thuộc vào một hệ đầy đủ các biến cố." },
          { prompt: "Công thức Bayes dùng để làm gì?", options: ["Tính xác suất \"ngược\" P(B|A) khi đã biết P(A|B)", "Chỉ tính P(A) đơn thuần", "Không liên quan gì đến xác suất có điều kiện", "Chỉ dùng cho biến cố độc lập"], correct: 0, explain: "Công thức Bayes cho phép suy ra xác suất ngược từ các xác suất có điều kiện đã biết." },
          { prompt: "Nếu P(A)=0,5, P(B)=0,4, P(A∩B)=0,2 thì P(A|B) = ?", options: ["0,5", "0,2", "0,4", "0,8"], correct: 0, explain: "P(A|B) = P(A∩B)/P(B) = 0,2/0,4 = 0,5." },
        ],
        exercises: [
          { prompt: "Cho P(A)=0,6, P(B)=0,5, P(A∩B)=0,3. Tính P(A|B).", solution: "P(A|B) = P(A∩B)/P(B) = 0,3/0,5 = 0,6.", answer: "0,6" },
          { prompt: "Hai biến cố A, B độc lập, P(A)=0,3, P(B)=0,4. Tính P(A∩B).", solution: "P(A∩B) = P(A)×P(B) = 0,3×0,4 = 0,12.", answer: "0,12" },
          { prompt: "Một lớp có 60% học sinh nam. Trong số nam, 30% thích Toán. Tính xác suất chọn ngẫu nhiên một học sinh là nam và thích Toán.", solution: "P(nam và thích Toán) = P(nam)×P(thích Toán|nam) = 0,6×0,3 = 0,18.", answer: "0,18" },
          { prompt: "Cho P(A|B)=0,4, P(B)=0,5. Tính P(A∩B).", solution: "P(A∩B) = P(A|B)×P(B) = 0,4×0,5 = 0,2.", answer: "0,2" },
          { prompt: "Nếu P(A)=0,5 và A, B độc lập thì P(A|B) bằng bao nhiêu?", solution: "Vì A, B độc lập nên P(A|B) = P(A) = 0,5.", answer: "0,5" },
          { prompt: "Hộp có 5 bi đỏ, 3 bi xanh. Lấy 2 bi liên tiếp không hoàn lại. Tính xác suất bi thứ 2 là đỏ, biết bi thứ nhất là đỏ.", solution: "Sau khi lấy 1 bi đỏ, còn lại 4 đỏ, 3 xanh (tổng 7 bi).\nXác suất = 4/7.", answer: "4/7" },
          { prompt: "Cho P(A)=0,7, P(B|A)=0,4. Tính P(A∩B).", solution: "P(A∩B) = P(A)×P(B|A) = 0,7×0,4 = 0,28.", answer: "0,28" },
          { prompt: "Hai biến cố A, B có P(A)=0,4, P(A∩B)=0,4, P(B)=0,6. Tính P(A|B).", solution: "P(A|B) = P(A∩B)/P(B) = 0,4/0,6 = 2/3.", answer: "2/3" },
          { prompt: "Trong một lớp, 50% học sinh giỏi Toán, trong đó 80% cũng giỏi Lý. Tính xác suất một học sinh giỏi cả Toán và Lý.", solution: "P(giỏi Toán và Lý) = P(giỏi Toán)×P(giỏi Lý|giỏi Toán) = 0,5×0,8 = 0,4.", answer: "0,4" },
          { prompt: "Cho P(A∩B)=0,15, P(A)=0,3. Tính P(B|A).", solution: "P(B|A) = P(A∩B)/P(A) = 0,15/0,3 = 0,5.", answer: "0,5" },
        ],
        advanced: [
          { prompt: "Một lô hàng có 60% sản phẩm loại A, 40% loại B. Loại A có 5% lỗi, loại B có 8% lỗi. Tính xác suất một sản phẩm lấy ngẫu nhiên bị lỗi (công thức xác suất toàn phần).", solution: "P(lỗi) = P(A)×P(lỗi|A) + P(B)×P(lỗi|B) = 0,6×0,05 + 0,4×0,08 = 0,03+0,032 = 0,062.", answer: "0,062" },
          { prompt: "Trong bài trên, biết sản phẩm bị lỗi, tính xác suất nó thuộc loại A (dùng công thức Bayes).", solution: "P(A|lỗi) = P(A)×P(lỗi|A)/P(lỗi) = 0,03/0,062 ≈ 0,484.", answer: "0,03/0,062 ≈ 0,484" },
          { prompt: "Cho P(A)=0,6, P(B|A)=0,5, P(B|không A)=0,3. Tính P(B) (dùng công thức xác suất toàn phần).", solution: "P(không A)=0,4.\nP(B) = P(A)×P(B|A) + P(không A)×P(B|không A) = 0,6×0,5 + 0,4×0,3 = 0,3+0,12 = 0,42.", answer: "0,42" },
          { prompt: "Một hộp có 3 bi trắng, 2 bi đen. Rút lần lượt 2 bi không hoàn lại. Tính P(bi thứ 2 trắng | bi thứ nhất trắng).", solution: "Sau khi rút 1 bi trắng, còn 2 trắng, 2 đen (4 bi).\nP=2/4=1/2.", answer: "1/2" },
          { prompt: "Cho P(A)=0,4, P(A∩B)=0,12. Tính P(B|A).", solution: "P(B|A)=P(A∩B)/P(A)=0,12/0,4=0,3.", answer: "0,3" },
          { prompt: "Trong 1 lớp, 70% đỗ Toán, trong số đỗ Toán có 80% đỗ cả Lý. Tính xác suất đỗ cả 2 môn.", solution: "P(đỗ cả 2)=P(đỗ Toán)×P(đỗ Lý|đỗ Toán)=0,7×0,8=0,56.", answer: "0,56" },
          { prompt: "A, B cùng thi. P(A đỗ)=0,8; nếu A đỗ thì P(B đỗ)=0,6; nếu A không đỗ thì P(B đỗ)=0,3. Tính P(B đỗ).", solution: "P(B đỗ)=0,8×0,6+0,2×0,3=0,48+0,06=0,54.", answer: "0,54" },
          { prompt: "Cho P(A)=0,5, P(B)=0,3, P(A∩B)=0,15. Kiểm tra A, B có độc lập không.", solution: "Nếu độc lập: P(A∩B)=P(A)×P(B)=0,5×0,3=0,15.\nĐúng khớp, vậy A, B độc lập.", answer: "Độc lập" },
          { prompt: "Một hộp có 60% sản phẩm loại tốt (5% lỗi) và 40% loại kém (20% lỗi). Tính xác suất 1 sản phẩm bất kỳ bị lỗi.", solution: "P(lỗi)=0,6×0,05+0,4×0,2=0,03+0,08=0,11.", answer: "0,11" },
          { prompt: "Trong bài trên, biết sản phẩm bị lỗi, tính xác suất nó thuộc loại kém.", solution: "P(kém|lỗi)=P(kém)×P(lỗi|kém)/P(lỗi)=0,08/0,11≈0,727.", answer: "≈0,727" },
        ],
      },
    ],
    examSources: [
      { label: "Đề giữa HK1 – TOANMATH.com", url: "https://toanmath.com/de-thi-giua-hk1-toan-12" },
      { label: "Đề HK1 – TOANMATH.com", url: "https://toanmath.com/de-thi-hk1-toan-12" },
      { label: "Đề giữa HK2 – TOANMATH.com", url: "https://toanmath.com/de-thi-giua-hk2-toan-12" },
      { label: "Đề HK2 – TOANMATH.com", url: "https://toanmath.com/de-thi-hk2-toan-12" },
      { label: "Đề khảo sát chất lượng – TOANMATH.com", url: "https://toanmath.com/khao-sat-chat-luong-toan-12" },
      { label: "Đề học sinh giỏi – TOANMATH.com", url: "https://toanmath.com/de-thi-hsg-toan-12" },
      { label: "Đề thi thử THPT (chung, nhiều trường) – TOANMATH.com", url: "https://toanmath.com/de-thi-thu-thpt-mon-toan" },
      { label: "Đề thi THPT chính thức các năm – TOANMATH.com", url: "https://toanmath.com/de-thi-thpt-mon-toan-chinh-thuc" },
      { label: "Tài liệu học tập lớp 12 – Nguyễn Bảo Vương", url: "https://www.toannbv.vn/search/label/T%C3%A0i%20Li%E1%BB%87u%20H%E1%BB%8Dc%20T%E1%BA%ADp%2012" },
      { label: "Đề khảo sát chất lượng lớp 12 – Nguyễn Bảo Vương", url: "https://www.nbv.edu.vn/search/label/%C4%90%E1%BB%81%20thi%20KSCL%2012" },
      { label: "Đề thi thử – Nguyễn Bảo Vương", url: "https://www.toannbv.vn/search/label/%C4%90%E1%BB%81%20Thi%20Th%E1%BB%AD" },
    ],
  },
];

const inkColor = "#1B3A5C";
const marginRed = "#C0453A";
const paperBg = "#FBF8F2";
const gridLine = "#CFE0EA";
const correctGreen = "#2F7A4F";

const font = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Literata:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    .lt-root { font-family: 'Inter', sans-serif; color: ${inkColor}; }
    .lt-serif { font-family: 'Literata', serif; }
    .lt-page {
      background-color: ${paperBg};
      background-image:
        linear-gradient(${gridLine} 1px, transparent 1px),
        linear-gradient(90deg, ${gridLine} 1px, transparent 1px);
      background-size: 26px 26px;
      position: relative;
    }
    .lt-margin {
      position: absolute;
      top: 0; bottom: 0; left: 48px;
      width: 1.5px;
      background: ${marginRed};
      opacity: 0.55;
    }
    .lt-tab {
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .lt-tab:hover { transform: translateX(3px); }
    .lt-option {
      transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
    }
    .lt-option:hover:not(.locked) { transform: translateX(4px); }
    .lt-stamp {
      animation: lt-pop 0.35s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes lt-pop {
      0% { transform: scale(0.5) rotate(-8deg); opacity: 0; }
      100% { transform: scale(1) rotate(-8deg); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .lt-tab, .lt-option, .lt-stamp { transition: none; animation: none; }
    }
  `}</style>
);

function GradeTabs({ grades, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {grades.map((g) => {
        const active = g.id === selected;
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className="lt-tab lt-serif"
            style={{
              padding: "10px 18px",
              borderRadius: "3px",
              border: `1.5px solid ${active ? inkColor : "#B8C4CC"}`,
              background: active ? inkColor : "transparent",
              color: active ? "#FBF8F2" : inkColor,
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {g.label}
          </button>
        );
      })}
    </div>
  );
}

function TopicList({ topics, onPick, onPickExercise, onPickAdvanced }) {
  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 480, margin: "0 auto" }}>
      {topics.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#fff",
            border: `1px solid #D9CFC0`,
            borderLeft: `4px solid ${marginRed}`,
            borderRadius: "2px",
            padding: "16px 20px",
          }}
        >
          <div className="lt-serif" style={{ fontSize: 17, fontWeight: 600, color: inkColor }}>
            {t.title}
          </div>
          {t.source && (
            <div style={{ fontSize: 12, color: marginRed, marginTop: 2 }}>{t.source}</div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => onPick(t)}
              className="lt-tab"
              style={{
                padding: "7px 14px",
                borderRadius: 3,
                border: `1.5px solid ${inkColor}`,
                background: inkColor,
                color: "#FBF8F2",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Làm trắc nghiệm ({t.questions.length} câu)
            </button>
            {t.exercises && t.exercises.length > 0 && onPickExercise && (
              <button
                onClick={() => onPickExercise(t)}
                className="lt-tab"
                style={{
                  padding: "7px 14px",
                  borderRadius: 3,
                  border: `1.5px solid ${marginRed}`,
                  background: "transparent",
                  color: marginRed,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bài tập tự luyện ({t.exercises.length} bài)
              </button>
            )}
            {t.advanced && t.advanced.length > 0 && onPickAdvanced && (
              <button
                onClick={() => onPickAdvanced(t)}
                className="lt-tab"
                style={{
                  padding: "7px 14px",
                  borderRadius: 3,
                  border: `1.5px solid #8B5CF6`,
                  background: "transparent",
                  color: "#8B5CF6",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ★ Nâng cao ({t.advanced.length} bài)
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExercisePractice({ grade, topic, level = "basic", onExit }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [revealed, setRevealed] = useState({});
  const [drafts, setDrafts] = useState({});
  const [results, setResults] = useState({});

  const items = level === "advanced" ? topic.advanced : topic.exercises;
  const label = level === "advanced" ? "Bài nâng cao" : "Bài tập tự luyện";
  const accent = level === "advanced" ? "#8B5CF6" : marginRed;
  const storageKey = `lt-results-${grade.id}-${topic.id}-${level}`;

  useEffect(() => {
    let saved = {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch (err) {
      saved = {};
    }
    setResults(saved);
    const draftInit = {};
    Object.keys(saved).forEach((idx) => { draftInit[idx] = saved[idx].given; });
    setDrafts(draftInit);
    setRevealed({});
  }, [storageKey]);

  function tryUnlock(e) {
    e.preventDefault();
    if (pwInput === SOLUTION_PASSWORD) {
      setUnlocked(true);
      setPwError("");
    } else {
      setPwError("Mật khẩu không đúng, thử lại nhé.");
    }
  }

  function toggleReveal(idx) {
    setRevealed((r) => ({ ...r, [idx]: !r[idx] }));
  }

  function submitAnswer(idx) {
    const given = drafts[idx] || "";
    const correct = checkAnswer(given, items[idx].answer);
    const next = { ...results, [idx]: { given, correct } };
    setResults(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (err) {
      // bỏ qua nếu trình duyệt chặn lưu trữ
    }
  }

  const answeredCount = Object.values(results).filter((r) => r && r.correct !== null).length;
  const correctCount = Object.values(results).filter((r) => r && r.correct === true).length;

  return (
    <div className="lt-page" style={{ minHeight: 420, padding: "32px 24px 40px", borderRadius: 4 }}>
      <div className="lt-margin" />
      <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#7A6F60" }}>
            {grade.label} · {topic.title} · {label}
          </span>
          <button
            onClick={onExit}
            style={{ background: "none", border: "none", color: "#7A6F60", fontSize: 13, cursor: "pointer" }}
          >
            ← Thoát ra
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#9C9080", marginBottom: 18 }}>
          Đã làm {answeredCount}/{items.length} câu — đúng {correctCount} câu. Kết quả tự động lưu lại trên máy này.
        </p>

        {!unlocked && (
          <form
            onSubmit={tryUnlock}
            style={{
              background: "#fff",
              border: "1px solid #D9CFC0",
              borderRadius: 3,
              padding: "16px 18px",
              marginBottom: 22,
            }}
          >
            <p style={{ fontSize: 14, color: "#4A4238", marginBottom: 10 }}>
              Con có thể tự làm và kiểm tra đáp số ngay bên dưới. Nhập mật khẩu để mở khóa xem lời giải chi tiết từng bước.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(""); }}
                placeholder="Mật khẩu"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: `1.5px solid ${pwError ? marginRed : "#D9CFC0"}`,
                  borderRadius: 3,
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  borderRadius: 3,
                  border: `1.5px solid ${inkColor}`,
                  background: inkColor,
                  color: "#FBF8F2",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Mở khóa
              </button>
            </div>
            {pwError && <p style={{ color: marginRed, fontSize: 12, marginTop: 6 }}>{pwError}</p>}
          </form>
        )}

        <div className="flex flex-col gap-3">
          {items.map((ex, idx) => {
            const status = results[idx] ? results[idx].correct : null;
            const boxColor = status === true ? correctGreen : status === false ? marginRed : "#D9CFC0";
            const boxBg = status === true ? "#EAF4EC" : status === false ? "#FBEAE8" : "#fff";
            return (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  border: "1px solid #D9CFC0",
                  borderLeft: `3px solid ${inkColor}`,
                  borderRadius: 2,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 13, color: "#9C9080", marginBottom: 6 }}>Bài {idx + 1}</div>
                <div className="lt-serif" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.5, marginBottom: 10 }}>
                  {ex.prompt}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "#9C9080", display: "block", marginBottom: 4 }}>
                    Đáp số của con
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={drafts[idx] ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [idx]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitAnswer(idx); } }}
                      placeholder="Nhập đáp số rồi bấm Kiểm tra..."
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: `1.5px solid ${boxColor}`,
                        background: boxBg,
                        borderRadius: 3,
                        fontSize: 14,
                        color: inkColor,
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={() => submitAnswer(idx)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 3,
                        border: `1.5px solid ${inkColor}`,
                        background: inkColor,
                        color: "#FBF8F2",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Kiểm tra
                    </button>
                  </div>
                  {status === true && (
                    <p style={{ color: correctGreen, fontSize: 12, marginTop: 6, fontWeight: 600 }}>✓ Chính xác!</p>
                  )}
                  {status === false && (
                    <p style={{ color: marginRed, fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                      ✕ Chưa đúng — thử lại hoặc xem lời giải bên dưới.
                    </p>
                  )}
                </div>
                {unlocked ? (
                  <>
                    <button
                      onClick={() => toggleReveal(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: accent,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {revealed[idx] ? "Ẩn lời giải ▲" : "Xem lời giải ▼"}
                    </button>
                    {revealed[idx] && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "12px 14px",
                          background: "#FBF8F2",
                          borderLeft: `3px solid ${accent}`,
                          fontSize: 14,
                          color: "#4A4238",
                          lineHeight: 1.6,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {ex.solution}
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: "#B5A98F" }}>Nhập mật khẩu ở trên để xem lời giải</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExamSources({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div style={{ maxWidth: 480, margin: "28px auto 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: marginRed }} />
        <h3 className="lt-serif" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
          Đề thi tổng kết
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        {sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lt-tab"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 16px",
              background: "#fff",
              border: "1px solid #D9CFC0",
              borderRadius: 2,
              textDecoration: "none",
              color: inkColor,
              fontSize: 14,
            }}
          >
            <span>{s.label}</span>
            <span style={{ color: "#B5A98F" }}>↗</span>
          </a>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#9C9080", marginTop: 10, lineHeight: 1.5 }}>
        Đây là link thật dẫn tới đúng trang chuyên mục trên TOANMATH.com / Nguyễn Bảo Vương để tải đề PDF về làm.
        App chưa tự chấm điểm được các đề này — muốn có bản chấm điểm tự động, gửi file PDF cho mình để nạp vào phần luyện tập ở trên.
      </p>
    </div>
  );
}

function Quiz({ grade, topic, onExit }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = topic.questions[idx];
  const isLast = idx === topic.questions.length - 1;

  function choose(optionIdx) {
    if (picked !== null) return;
    setPicked(optionIdx);
    if (optionIdx === q.correct) setScore((s) => s + 1);
  }

  function next() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  }

  function retry() {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / topic.questions.length) * 100);
    const msg =
      pct === 100
        ? "Tuyệt đối! Con nắm rất chắc phần này."
        : pct >= 70
        ? "Khá tốt! Chỉ còn vài chỗ cần xem lại."
        : pct >= 40
        ? "Ổn rồi, nhưng nên ôn lại phần này thêm chút nữa."
        : "Chưa vững lắm — hãy đọc lại lý thuyết rồi làm lại nhé.";
    return (
      <div className="lt-page" style={{ minHeight: 420, padding: "40px 24px", borderRadius: 4 }}>
        <div className="lt-margin" />
        <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div
            className="lt-stamp lt-serif"
            style={{
              display: "inline-block",
              border: `3px solid ${marginRed}`,
              borderRadius: "50%",
              color: marginRed,
              width: 120,
              height: 120,
              lineHeight: "114px",
              fontSize: 34,
              fontWeight: 700,
              transform: "rotate(-8deg)",
            }}
          >
            {score}/{topic.questions.length}
          </div>
          <h3 className="lt-serif" style={{ fontSize: 22, marginTop: 24, fontWeight: 600 }}>
            {msg}
          </h3>
          <p style={{ color: "#7A6F60", marginTop: 8, fontSize: 14 }}>
            {grade.label} · {topic.title}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
            <button
              onClick={retry}
              style={{
                padding: "10px 20px",
                borderRadius: 3,
                border: `1.5px solid ${inkColor}`,
                background: "transparent",
                color: inkColor,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Làm lại
            </button>
            <button
              onClick={onExit}
              style={{
                padding: "10px 20px",
                borderRadius: 3,
                border: `1.5px solid ${inkColor}`,
                background: inkColor,
                color: "#FBF8F2",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Chọn chủ đề khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lt-page" style={{ minHeight: 420, padding: "32px 24px 40px", borderRadius: 4 }}>
      <div className="lt-margin" />
      <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: "#7A6F60" }}>
            {grade.label} · {topic.title}
          </span>
          <span className="lt-serif" style={{ fontSize: 14, fontWeight: 600 }}>
            Câu {idx + 1}/{topic.questions.length}
          </span>
        </div>

        <h3 className="lt-serif" style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.4, marginBottom: 22 }}>
          {q.prompt}
        </h3>

        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = i === picked;
            let bg = "#fff";
            let border = "#D9CFC0";
            let textColor = inkColor;
            if (picked !== null) {
              if (isCorrect) {
                bg = "#EAF4EC";
                border = correctGreen;
                textColor = correctGreen;
              } else if (isPicked) {
                bg = "#FBEAE8";
                border = marginRed;
                textColor = marginRed;
              }
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`lt-option${picked !== null ? " locked" : ""}`}
                style={{
                  textAlign: "left",
                  padding: "13px 16px",
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 3,
                  cursor: picked === null ? "pointer" : "default",
                  color: textColor,
                  fontSize: 15,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{opt}</span>
                {picked !== null && isCorrect && <span>✓</span>}
                {picked !== null && isPicked && !isCorrect && <span>✕</span>}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              background: "#fff",
              borderLeft: `3px solid ${picked === q.correct ? correctGreen : marginRed}`,
              fontSize: 14,
              color: "#4A4238",
              lineHeight: 1.5,
            }}
          >
            {q.explain}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
          <button
            onClick={onExit}
            style={{ background: "none", border: "none", color: "#7A6F60", fontSize: 13, cursor: "pointer" }}
          >
            ← Thoát ra
          </button>
          {picked !== null && (
            <button
              onClick={next}
              style={{
                padding: "9px 20px",
                borderRadius: 3,
                border: `1.5px solid ${inkColor}`,
                background: inkColor,
                color: "#FBF8F2",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {isLast ? "Xem kết quả" : "Câu tiếp →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeTabs({ mode, onSelect, examCount }) {
  const modes = [
    { id: "chuyende", label: "Theo chuyên đề" },
    { id: "kythi", label: "Theo kỳ thi" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 18, marginBottom: 24 }}>
      {modes.map((m) => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom: active ? `2px solid ${marginRed}` : "2px solid transparent",
              background: "transparent",
              color: active ? inkColor : "#9C9080",
              fontWeight: active ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {m.label}
            {m.id === "kythi" && examCount > 0 ? ` (${examCount})` : ""}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [gradeId, setGradeId] = useState(6);
  const [mode, setMode] = useState("chuyende");
  const [topic, setTopic] = useState(null);
  const [exerciseTopic, setExerciseTopic] = useState(null);
  const [advancedTopic, setAdvancedTopic] = useState(null);

  const grade = GRADES.find((g) => g.id === gradeId);
  const examTopics = grade.examTopics || [];

  return (
    <div className="lt-root" style={{ minHeight: "100%", padding: "28px 16px", background: "#F3EEE3" }}>
      {font}
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 className="lt-serif" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Vở luyện toán
          </h1>
          <p style={{ fontSize: 14, color: "#7A6F60", marginTop: 6 }}>
            Luyện tập Toán lớp 6 đến lớp 12 — chọn lớp, chọn chủ đề, làm bài và xem kết quả ngay
          </p>
        </div>

        {!topic && !exerciseTopic && !advancedTopic && (
          <>
            <GradeTabs grades={GRADES} selected={gradeId} onSelect={(id) => { setGradeId(id); setTopic(null); setExerciseTopic(null); setAdvancedTopic(null); setMode("chuyende"); }} />
            <ModeTabs mode={mode} onSelect={setMode} examCount={examTopics.length} />

            {mode === "chuyende" && (
              <TopicList topics={grade.topics} onPick={setTopic} onPickExercise={setExerciseTopic} onPickAdvanced={setAdvancedTopic} />
            )}

            {mode === "kythi" && (
              <>
                {examTopics.length > 0 ? (
                  <TopicList topics={examTopics} onPick={setTopic} onPickExercise={setExerciseTopic} onPickAdvanced={setAdvancedTopic} />
                ) : (
                  <p style={{ textAlign: "center", fontSize: 14, color: "#9C9080", maxWidth: 420, margin: "0 auto" }}>
                    Chưa có đề thi thật nào được nạp sẵn cho lớp này. Xem các nguồn tham khảo bên dưới để tải đề về.
                  </p>
                )}
                <ExamSources sources={grade.examSources} />
              </>
            )}
          </>
        )}

        {topic && <Quiz grade={grade} topic={topic} onExit={() => setTopic(null)} />}
        {exerciseTopic && <ExercisePractice grade={grade} topic={exerciseTopic} level="basic" onExit={() => setExerciseTopic(null)} />}
        {advancedTopic && <ExercisePractice grade={grade} topic={advancedTopic} level="advanced" onExit={() => setAdvancedTopic(null)} />}
      </div>
    </div>
  );
}
