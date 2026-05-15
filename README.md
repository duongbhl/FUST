# FUST - Triển khai NodeBB

Dự án này sử dụng cấu hình Docker Compose ở thư mục gốc, bao gồm cả thiết lập NodeBB. Chỉ cần git clone và test nó!

## 🚀 Khởi động nhanh

### 1. Khởi tạo thư mục
Đảm bảo các thư mục lưu trữ dữ liệu cần thiết đã tồn tại:
```bash
mkdir -p .docker/public/uploads .docker/database/mongo/data .docker/config .docker/build .docker/database/redis .docker/database/postgresql/data
```

### 2. Khởi động dịch vụ

Chạy lệnh sau tại thư mục gốc để khởi động NodeBB cùng với MongoDB:

```bash
sudo docker compose --profile mongo up
```

> [!NOTE]
> Chúng tôi sử dụng tính năng `include` hiện đại của Docker Compose để quản lý cấu hình ở các thư mục con một cách liền mạch.

### 3. Truy cập NodeBB

NodeBB sẽ khả dụng tại `http://localhost:4567`.

1. Tài khoản quản trị: `admin` - `Admin123!`
2. Thiết lập MongoDB: sử dụng cấu hình mặc định. Nhấn nút **Test Database** để kiểm tra kết nối cơ sở dữ liệu, sau đó nhấn **Install** để cài đặt NodeBB. Sau khi cài đặt hoàn tất, khởi động lại server bằng lệnh:

```bash
sudo docker compose --profile mongo down && sudo docker compose --profile mongo up
```

### 🛡️ Lưu ý về lưu trữ (NTFS / Ổ đĩa ngoài)

Nếu bạn chạy dự án trên phân vùng NTFS (thường gặp với ổ cứng ngoài), MongoDB có thể gặp lỗi `Operation not permitted`.

Để khắc phục, file `docker-compose.yml` ở thư mục gốc được cấu hình sử dụng **Docker Named Volumes** cho các cơ sở dữ liệu (`mongo`, `redis`, `postgres`), trong khi vẫn giữ `uploads` và `config` dưới dạng bind mount để dễ dàng truy cập.

---

## 📚 Tài liệu

Để biết thêm chi tiết về cách quản lý dashboard, tài khoản, cũng như hiểu mô hình dữ liệu MongoDB, hãy xem [Hướng dẫn quản lý NodeBB](NODEBB_GUIDE.md).


