---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
    background-color: #F8FAFC;
    color: #0F172A;
    padding: 40px 52px;
    font-size: 21px;
    line-height: 1.42;
  }
  h1 {
    color: #0F172A;
    font-size: 40px;
    font-weight: 800;
    margin-bottom: 10px;
    line-height: 1.18;
  }
  h2 {
    color: #0284C7;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 16px;
    border-left: 6px solid #06B6D4;
    padding-left: 14px;
  }
  h3 {
    color: #0F172A;
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }
  section.cover {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    color: #F8FAFC;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  section.cover h1 {
    color: #FFFFFF;
    font-size: 44px;
  }
  section.cover p {
    color: #CBD5E1;
    font-size: 23px;
  }
  section.section-title {
    background: linear-gradient(135deg, #0F172A 0%, #0E7490 100%);
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  section.section-title h1 {
    color: #FFFFFF;
    font-size: 44px;
  }
  section.section-title p {
    color: #CFFAFE;
    font-size: 23px;
  }
  .badge {
    display: inline-block;
    background: #06B6D4;
    color: #0F172A;
    font-weight: 700;
    font-size: 15px;
    padding: 5px 14px;
    border-radius: 999px;
    margin-bottom: 14px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    width: fit-content;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    margin-top: 10px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 18px;
    margin-top: 12px;
  }
  .grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 16px;
    margin-top: 14px;
  }
  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  }
  .card-accent {
    background: #ECFEFF;
    border: 1px solid #A5F3FC;
    border-radius: 14px;
    padding: 18px 20px;
  }
  .card-warn {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-radius: 14px;
    padding: 18px 20px;
  }
  .card-dark {
    background: #0F172A;
    color: #F8FAFC;
    border-radius: 14px;
    padding: 18px 20px;
  }
  .card-dark h3 {
    color: #38BDF8;
  }
  .split {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 26px;
    align-items: center;
  }
  .split img {
    width: 100%;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 19px;
  }
  th {
    background: #0F172A;
    color: #FFFFFF;
    padding: 11px 14px;
    text-align: left;
  }
  td {
    background: #FFFFFF;
    padding: 11px 14px;
    border-bottom: 1px solid #E2E8F0;
  }
  .quote-box {
    background: #0F172A;
    color: #F8FAFC;
    padding: 22px 28px;
    border-radius: 14px;
    border-left: 8px solid #10B981;
    font-size: 23px;
    font-weight: 600;
    margin-top: 16px;
  }
  section.cover .quote-box {
    background: #1E293B;
    border: 1px solid #334155;
    border-left: 8px solid #10B981;
  }
  .stat {
    font-size: 34px;
    font-weight: 800;
    color: #0284C7;
    margin-bottom: 4px;
  }
  ul {
    margin: 6px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 6px;
  }
---

<!-- _class: cover -->
<!-- _paginate: false -->

![bg right:42%](./images/cover_tech.jpg)

<div class="badge">Unit 6 • Thuyết trình nhóm (15–20 phút)</div>

# Công Nghệ Đã Thay Đổi Cách Chúng Ta Giao Tiếp & Kinh Doanh Như Thế Nào?

**Từ tương tác nội bộ đến trải nghiệm khách hàng trong kỷ nguyên số**

---

## Khởi Động: 24 Giờ Không Công Nghệ?

<table>
  <thead>
    <tr>
      <th>Hoạt động</th>
      <th>🕰️ Năm 2000</th>
      <th>🚀 Năm 2026</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Liên lạc & Tài liệu</strong></td>
      <td>Thư tay, fax, điện thoại bàn, lưu trữ tủ hồ sơ</td>
      <td>Nhắn tin tức thời, đồng bộ đám mây (Cloud) 24/7</td>
    </tr>
    <tr>
      <td><strong>Họp & Hợp tác</strong></td>
      <td>Bay trực tiếp, tốn thời gian & chi phí di chuyển</td>
      <td>Video Call xuyên quốc gia + AI dịch thuật & ghi chú</td>
    </tr>
    <tr>
      <td><strong>Mua sắm & Thanh toán</strong></td>
      <td>Ra cửa hàng vật lý, trả tiền mặt</td>
      <td>Lướt là mua (Social Commerce), quét QR / chạm NFC</td>
    </tr>
    <tr>
      <td><strong>Đào tạo nhân sự</strong></td>
      <td>Sách hướng dẫn giấy, tập trung cả phòng</td>
      <td>E-learning / Micro-learning 3 phút ngay trên điện thoại</td>
    </tr>
  </tbody>
</table>

---

## Bức Tranh Toàn Cảnh: 4 Trụ Cột Chuyển Đổi Số

<div class="grid-4">
  <div class="card-accent">
    <div class="stat">01</div>
    <h3>Giao tiếp nội bộ</h3>
    <p>Chuyển từ chat cá nhân rời rạc sang mạng xã hội doanh nghiệp bảo mật.</p>
  </div>
  <div class="card-accent">
    <div class="stat">02</div>
    <h3>Kết nối đa điểm</h3>
    <p>Họp trực tuyến phá bỏ rào cản địa lý cho kinh doanh, y tế & giáo dục.</p>
  </div>
  <div class="card-accent">
    <div class="stat">03</div>
    <h3>Kinh doanh số</h3>
    <p>Đa kênh (Bricks & Clicks), cá nhân hóa bằng dữ liệu & thanh toán 1 chạm.</p>
  </div>
  <div class="card-accent">
    <div class="stat">04</div>
    <h3>Con người</h3>
    <p>Đào tạo người dùng thích nghi nhanh — yếu tố quyết định thành bại.</p>
  </div>
</div>

---

<!-- _class: section-title -->

<div class="badge">Phần 1 • Giao tiếp hiện đại</div>

# Cách Mạng Trong Giao Tiếp Doanh Nghiệp & Xã Hội

Tốc độ • Bất đồng bộ • Kết nối không biên giới

---

## Giao Tiếp "Bất Đồng Bộ" & Ngôn Ngữ Số Mới

<div class="grid-2">
  <div class="card">
    <h3>⏱️ Từ Đồng Bộ → Bất Đồng Bộ (Async)</h3>
    <ul>
      <li><strong>Trước đây:</strong> Muốn trao đổi phải gọi điện hoặc họp cùng lúc → gián đoạn công việc.</li>
      <li><strong>Hiện nay:</strong> Làm việc xuyên múi giờ nhờ tin nhắn theo luồng (Thread), bình luận trực tiếp trên file (Google Docs, Notion).</li>
      <li><strong>Kết quả:</strong> Giảm họp hành vô nghĩa, tăng thời gian tập trung sâu.</li>
    </ul>
  </div>
  <div class="card-accent">
    <h3>🤖 Trợ Lý AI Trong Giao Tiếp</h3>
    <ul>
      <li>Tóm tắt hàng trăm tin nhắn bị trôi chỉ trong 3 giây.</li>
      <li>Tự động ghi biên bản cuộc họp & giao việc (Action items).</li>
      <li>Dịch thuật đa ngôn ngữ theo thời gian thực khi làm việc với đối tác nước ngoài.</li>
    </ul>
  </div>
</div>

---

## Mạng Xã Hội Cá Nhân vs. Doanh Nghiệp (ESN)

<div class="split">
  <div>
    <div class="card-warn" style="margin-bottom: 14px;">
      <h3>⚠️ Rủi ro khi dùng chat cá nhân để làm việc</h3>
      <ul>
        <li><strong>Trôi tin & nhiễu:</strong> Tin nhắn gia đình, quảng cáo lẫn lộn với việc công ty.</li>
        <li><strong>Mất dữ liệu:</strong> File gửi qua chat hết hạn hoặc khó tra cứu lại sau vài tháng.</li>
        <li><strong>Lỗ hổng bảo mật:</strong> Nhân viên nghỉ việc vẫn giữ nguyên lịch sử tin nhắn & tài liệu mật.</li>
      </ul>
    </div>
    <div class="card-accent">
      <h3>✅ Mạng xã hội doanh nghiệp (Slack, Teams, Lark)</h3>
      <p>Phân luồng chủ đề rõ ràng, gắn thẻ (tagging), lưu trữ đám mây tập trung và <strong>thu hồi quyền truy cập ngay</strong> khi nhân sự rời đi.</p>
    </div>
  </div>
  <div>
    <img src="./images/comm_evolution.jpg" alt="Enterprise social networking">
  </div>
</div>

---

## Hội Nghị Truyền Hình: Giá Trị Vượt Ra Ngoài Doanh Nghiệp

<div class="split">
  <div>
    <div class="card" style="margin-bottom: 12px;">
      <h3>💼 Kinh Doanh Toàn Cầu</h3>
      <p>Đàm phán với đối tác nước ngoài tức thì, tiết kiệm hàng chục % chi phí công tác và thời gian di chuyển.</p>
    </div>
    <div class="card" style="margin-bottom: 12px;">
      <h3>🏥 Y Tế & 🎓 Giáo Dục Từ Xa</h3>
      <p>Bác sĩ tuyến trên hội chẩn ca khó cho bệnh viện vùng sâu; học sinh ở xa vẫn học cùng giảng viên đầu ngành.</p>
    </div>
    <div class="card-accent">
      <h3>♿ Hòa Nhập Cộng Đồng</h3>
      <p>Công nghệ <strong>Speech-to-Text</strong> tạo phụ đề trực tiếp giúp người khiếm thính tham gia bình đẳng.</p>
    </div>
  </div>
  <div>
    <img src="./images/video_conf.jpg" alt="Video conferencing across industries">
  </div>
</div>

---

## Mặt Trái & Điều Kiện Để Giao Tiếp Số An Toàn

<div class="grid-3">
  <div class="card">
    <h3>📡 Hạ tầng & Nén dữ liệu</h3>
    <p>Cần đường truyền băng thông cao (5G/Cáp quang) và thuật toán nén (Compression) để hình ảnh mượt, không trễ tiếng.</p>
  </div>
  <div class="card-warn">
    <h3>🎭 Mặt trái tâm lý & Tin giả</h3>
    <ul>
      <li>Tin nhắn chữ dễ gây hiểu lầm cảm xúc.</li>
      <li>Áp lực "luôn phải phản hồi ngay" gây kiệt sức (Burnout).</li>
      <li>Nguy cơ lừa đảo giọng nói/hình ảnh (Deepfake).</li>
    </ul>
  </div>
  <div class="card-dark">
    <h3>🔐 Quy tắc vàng: Mã hóa</h3>
    <p>Mọi cuộc họp chiến lược và dữ liệu nội bộ bắt buộc phải được <strong>mã hóa đầu cuối (Encryption)</strong> và xác thực 2 lớp.</p>
  </div>
</div>

---

<!-- _class: section-title -->

<div class="badge">Phần 2 • Kinh doanh số</div>

# Cách Mạng Trong Kinh Doanh & Thương Mại Điện Tử

Từ cửa hàng truyền thống đến hệ sinh thái đa kênh

---

## 4 Mô Hình Kinh Doanh Số Cốt Lõi

<table>
  <thead>
    <tr>
      <th>Mô hình</th>
      <th>Bản chất</th>
      <th>Ví dụ thực tế tại Việt Nam</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>B2C</strong> (Business-to-Consumer)</td>
      <td>Doanh nghiệp bán trực tiếp cho người tiêu dùng</td>
      <td>Shopee, TikTok Shop, Tiki, website thương hiệu</td>
    </tr>
    <tr>
      <td><strong>B2B</strong> (Business-to-Business)</td>
      <td>Giao dịch nguyên liệu, phần mềm giữa doanh nghiệp</td>
      <td>Sàn cung ứng sỉ, phần mềm quản trị (MISA, Base)</td>
    </tr>
    <tr>
      <td><strong>B2G</strong> (Business-to-Government)</td>
      <td>Cung cấp dịch vụ, hạ tầng số cho cơ quan nhà nước</td>
      <td>Đấu thầu điện tử, hóa đơn & khai thuế trực tuyến</td>
    </tr>
    <tr>
      <td><strong>Bricks & Clicks</strong> (Đa kênh)</td>
      <td>Kết hợp cửa hàng vật lý + kênh bán hàng online</td>
      <td>Đặt trên app, ghé cửa hàng lấy/đổi trả (Thế Giới Di Động, Uniqlo)</td>
    </tr>
  </tbody>
</table>

---

## Xu Hướng Mới: Social Commerce & Cá Nhân Hóa

<div class="grid-2">
  <div class="card-accent">
    <h3>🎥 Từ "Tìm Kiếm" Sang "Giải Trí Để Mua"</h3>
    <ul>
      <li><strong>Trước đây:</strong> Khách hàng cần gì mới lên Google/sàn TMĐT tìm kiếm.</li>
      <li><strong>Hiện nay (Shoppertainment):</strong> Xem video ngắn, livestream trên TikTok/Facebook và chốt đơn ngay theo cảm xúc.</li>
      <li>Tương tác trực tiếp 2 chiều: hỏi đáp sản phẩm, thử đồ ngay trên sóng live.</li>
    </ul>
  </div>
  <div class="card">
    <h3>🎯 Cá Nhân Hóa Nhờ Dữ Liệu (AI & Cookies)</h3>
    <ul>
      <li>Hệ thống ghi nhận lịch sử xem, thời gian dừng lại ở từng món đồ.</li>
      <li>Tự động đề xuất đúng sản phẩm, đúng mức giá, đúng thời điểm khách cần.</li>
      <li><strong>Chatbot CSKH 24/7:</strong> Trả lời thắc mắc, kiểm tra tình trạng đơn hàng ngay lập tức mà không cần chờ nhân viên.</li>
    </ul>
  </div>
</div>

---

## Giải Phẫu "Hậu Trường" 1 Giây Bấm Đặt Hàng

<div class="split">
  <div>
    <div class="card" style="margin-bottom: 12px;">
      <h3>1️⃣ Giao diện người dùng (UI/UX)</h3>
      <p>Chỉ cần mất quá 3 giây tải trang hoặc bắt điền quá nhiều bước, khách hàng sẽ thoát app ngay lập tức.</p>
    </div>
    <div class="card" style="margin-bottom: 12px;">
      <h3>2️⃣ Giỏ hàng thông minh & Cookies</h3>
      <p>Lưu giữ sản phẩm bạn chọn dù tắt trình duyệt, đồng thời đồng bộ giỏ hàng giữa điện thoại và máy tính.</p>
    </div>
    <div class="card-accent">
      <h3>3️⃣ Thanh toán & Kết nối tự động (EDI)</h3>
      <p>Ngay khi tiền về: Kho tự động trừ hàng → Hãng vận chuyển nhận mã đơn → Kế toán tự xuất hóa đơn điện tử.</p>
    </div>
  </div>
  <div>
    <img src="./images/ecommerce_flow.jpg" alt="E-commerce behind the scenes">
  </div>
</div>

---

## Thanh Toán Không Chạm & Cuộc Chiến An Ninh Mạng

<div class="grid-3">
  <div class="card-accent">
    <h3>📱 Ví điện tử & VietQR</h3>
    <p>Thanh toán tức thời trong 2 giây qua MoMo, ZaloPay, ngân hàng số — minh bạch dòng tiền, giảm sai sót tiền mặt.</p>
  </div>
  <div class="card-accent">
    <h3>📶 Thanh toán chạm (NFC)</h3>
    <p>Apple Pay, Google Pay, thẻ không tiếp xúc — kết nối trải nghiệm liền mạch tại quầy thu ngân (Bricks & Clicks).</p>
  </div>
  <div class="card-warn">
    <h3>🛡️ Bảo mật & Thách thức</h3>
    <ul>
      <li>Tường lửa (Firewall) & xác thực sinh trắc học.</li>
      <li>Bảo vệ bản quyền số (DRM).</li>
      <li><strong>Rủi ro:</strong> Lộ dữ liệu thẻ, cạnh tranh phá giá & phụ thuộc thuật toán sàn.</li>
    </ul>
  </div>
</div>

---

<!-- _class: section-title -->

<div class="badge">Phần 3 • Con người & Thực tiễn</div>

# Yếu Tố Con Người & Bài Toán Doanh Nghiệp

Công nghệ chỉ là đòn bẩy — Con người mới là người tạo ra giá trị

---

## Đào Tạo Người Dùng: Mảnh Ghép Quyết Định Thành Bại

<div class="split">
  <div>
    <div class="card-warn" style="margin-bottom: 14px;">
      <h3>❌ Nghịch lý chuyển đổi số</h3>
      <p>Nhiều doanh nghiệp đầu tư phần mềm đắt tiền nhưng nhân viên <strong>ngại dùng</strong> vì được đào tạo bằng sách hướng dẫn dày cộp, khó hiểu → lại quay về file Excel và chat tay.</p>
    </div>
    <div class="card-accent">
      <h3>✅ Giải pháp: E-learning & Micro-learning</h3>
      <ul>
        <li><strong>Học siêu ngắn (2–3 phút):</strong> Video hướng dẫn từng thao tác nhỏ ngay trên điện thoại.</li>
        <li><strong>Kỹ năng cốt lõi:</strong> Đồng bộ dữ liệu, tìm kiếm/gắn thẻ tài liệu và nhận diện email lừa đảo (Phishing).</li>
        <li><strong>Hiệu quả:</strong> Học mọi lúc mọi nơi, không làm gián đoạn vận hành.</li>
      </ul>
    </div>
  </div>
  <div>
    <img src="./images/training_people.jpg" alt="Training users with micro-learning">
  </div>
</div>

---

## Case Study Tương Tác: Giải Cứu "Việt Global"

<div class="card" style="margin-bottom: 16px;">
  <h3>📌 Bối cảnh thực tế (30 giây thảo luận cùng cả lớp)</h3>
  <p>Thương hiệu thời trang <strong>Việt Global</strong> mở rộng ra 3 thành phố và bán sang Đông Nam Á. Doanh thu tại cửa hàng tốt, nhưng đang đối mặt <strong>2 khủng hoảng nghiêm trọng</strong>:</p>
</div>

<div class="grid-2">
  <div class="card-warn">
    <h3>🚨 Khủng hoảng 1: Giao tiếp đứt gãy</h3>
    <p>Các phòng ban ở 3 chi nhánh dùng nhóm chat cá nhân rời rạc → thất lạc file thiết kế, chậm tiến độ sản xuất.</p>
  </div>
  <div class="card-warn">
    <h3>🚨 Khủng hoảng 2: Rớt 70% đơn Online</h3>
    <p>Khách vào website chọn đồ rất nhiều nhưng <strong>bỏ giỏ hàng giữa chừng</strong> vì giao diện trên điện thoại rối rắm và bắt đăng ký tài khoản rườm rà.</p>
  </div>
</div>

---

## Lộ Trình 3 Bước Tái Cấu Trúc "Việt Global"

<div class="grid-3">
  <div class="card-accent">
    <h3>1. Chuẩn hóa Giao tiếp</h3>
    <p>Chuyển toàn bộ đội ngũ sang nền tảng hợp nhất (Lark/Teams), phân kênh theo dự án, lưu file đám mây và họp video ngắn định kỳ.</p>
  </div>
  <div class="card-accent">
    <h3>2. Tối ưu Mua sắm</h3>
    <p>Thiết kế lại giao diện di động tối giản (Mobile-first), cho phép mua không cần đăng ký tài khoản & thanh toán 1 chạm VietQR.</p>
  </div>
  <div class="card-accent">
    <h3>3. Thử nghiệm & Đào tạo</h3>
    <p>Chạy thử nghiệm (A/B Testing) đo tỷ lệ chốt đơn, đồng thời làm chuỗi video 2 phút hướng dẫn nhân viên vận hành hệ thống mới.</p>
  </div>
</div>

<div class="quote-box">
  💡 Bài học rút ra: Không mua công nghệ theo phong trào — phải bắt đầu từ "nỗi đau" thực tế của nhân viên và khách hàng.
</div>

---

## Mini-Game: Kiểm Tra Nhanh (4 Câu Hỏi)

<div class="grid-2">
  <div class="card">
    <h3>Câu 1: Mô hình "Bricks & Clicks" là gì?</h3>
    <p>A. Chỉ bán hàng qua livestream<br>B. Kết hợp cửa hàng vật lý & kênh online<br>C. Bán sỉ giữa các doanh nghiệp (B2B)</p>
  </div>
  <div class="card">
    <h3>Câu 2: Giỏ hàng nhớ được đồ bạn chọn nhờ đâu?</h3>
    <p>A. Firewall (Tường lửa)<br>B. Cookies<br>C. Bandwidth (Băng thông)</p>
  </div>
  <div class="card">
    <h3>Câu 3: Giao tiếp "bất đồng bộ" giúp ích gì nhất?</h3>
    <p>A. Bắt buộc mọi người online cùng lúc<br>B. Hợp tác xuyên múi giờ, giảm họp vô nghĩa<br>C. Thay thế hoàn toàn bảo mật dữ liệu</p>
  </div>
  <div class="card">
    <h3>Câu 4: Vì sao nên đào tạo bằng Micro-learning?</h3>
    <p>A. Ngắn gọn (2–3 phút), dễ áp dụng ngay<br>B. Tốn nhiều chi phí thuê hội trường hơn<br>C. Không cần cập nhật kiến thức mới</p>
  </div>
</div>

---

<!-- _class: cover -->
<!-- _paginate: false -->

<div class="badge">Tổng kết</div>

# Cảm Ơn Thầy/Cô & Các Bạn Đã Lắng Nghe!

<div class="quote-box" style="margin-top: 20px;">
  "Công nghệ là đòn bẩy giúp đi nhanh hơn, nhưng sự thấu hiểu con người mới là chìa khóa giúp giao tiếp chân thành và kinh doanh bền vững."
</div>

<p style="margin-top: 26px; font-size: 22px; color: #94A3B8;">
  💬 Mời thầy/cô và các bạn đặt câu hỏi thảo luận (Q&A)
</p>
