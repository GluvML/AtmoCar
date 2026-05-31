# AtmoCar - Hệ Thống Giám Sát CO₂ Ô Tô Tối Giản Apple-Style

**AtmoCar** là ứng dụng giám sát nồng độ khí CO₂, nhiệt độ và độ ẩm trong xe ô tô theo thời gian thực. Ứng dụng được thiết kế theo ngôn ngữ thiết kế tối giản, sang trọng của Apple (đặc trưng bởi giao diện Siri/CarPlay và Apple Health).

---

## 🌟 Tính năng nổi bật

- **Giám sát thời gian thực:** Đồng bộ dữ liệu giả lập chất lượng không khí trong cabin xe ô tô mỗi 3 giây.
- **Giao diện Apple-Style Minimalist:**
  - Nền mờ kính tối sâu (Matte Dark Slate-Black `#09090b`) kết hợp với hiệu ứng kính mờ (Glassmorphism) và cạnh phản quang phản chiếu tinh xảo.
  - **Ambient Drift Blobs:** Hai đốm màu Siri trôi nổi chậm ở nền, tự động đổi màu tương thích với chất lượng không khí (Xanh lá - Tốt, Vàng - Chú ý, Đỏ nhấp nháy - Nguy kịch).
- **Mặt số đo cơ học Luxury (Dial Dot & Glow):** Mặt đồng hồ vector fluid tự co giãn, tích hợp chấm chỉ vị trí kim quét màu trắng và quầng sáng radial mờ ở tâm mặt số.
- **Lời khuyên Sức khỏe Động (Apple Health Card):** Đưa ra chỉ dẫn y khoa bằng tiếng Việt/Anh/Trung tương ứng dựa trên trạng thái đo lường thực tế (ví dụ: khuyên mở cửa kính hoặc chuyển sang lấy gió ngoài khi CO₂ cao).
- **Cảnh báo Giọng nói (Speech Synthesis):** Tự động phát âm thanh cảnh báo bằng giọng nói tự nhiên khi nồng độ CO₂ vượt ngưỡng nguy hiểm.
- **Analytics & Reports:** Xem biểu đồ lịch sử 24h, 7 ngày, 30 ngày và xuất báo cáo hàng ngày chi tiết.

---

## 🛠️ Công nghệ sử dụng

- **HTML5 & Vanilla CSS3:** Sử dụng thiết kế thuần túy, Flexbox cân đối, không dùng framework cồng kềnh để tối ưu hóa hiệu năng trên thiết bị di động.
- **Vanilla JavaScript (ES6):** Xử lý luồng dữ liệu thời gian thực, thuật toán vẽ kim chỉ góc lượng giác, xử lý đa ngôn ngữ và text-to-speech.
- **Chart.js:** Hiển thị biểu đồ lịch sử tương tác mượt mà.

---

## 🚀 Hướng dẫn chạy ứng dụng

1. Tải thư mục dự án về máy tính của bạn.
2. Mở tệp `index.html` bằng trình duyệt web bất kỳ (Chrome, Safari, Edge, Firefox).
3. Sử dụng màn hình Cài đặt để cân chỉnh lại các ngưỡng báo động CO₂, Nhiệt độ, Độ ẩm hoặc lựa chọn Ngôn ngữ (Việt - Anh - Trung).
