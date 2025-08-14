# Hướng dẫn khắc phục sự cố Metro Bundler

## Vấn đề: Metro bật lên rồi bị tắt ngay

### Nguyên nhân có thể:
1. **Port bị chiếm**: Port 8081 đã được sử dụng bởi process khác
2. **Cache bị lỗi**: Cache Metro bị corrupt
3. **Cấu hình không đúng**: Metro config có vấn đề
4. **Node modules bị lỗi**: Dependencies không tương thích

### Giải pháp:

#### 1. Sử dụng script tự động (Khuyến nghị)
```bash
# Windows
start-metro.bat

# PowerShell
.\start-metro.ps1
```

#### 2. Khởi động thủ công
```bash
# Xóa cache và khởi động lại
npx react-native start --reset-cache

# Hoặc
npm run start-clean
```

#### 3. Kiểm tra port
```bash
# Kiểm tra port 8081 có đang được sử dụng không
netstat -ano | findstr :8081

# Nếu có, dừng process đó
taskkill /PID <PID> /F
```

#### 4. Xóa cache thủ công
```bash
# Xóa cache Metro
rm -rf node_modules/.cache
rm -rf /tmp/metro-*

# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

#### 5. Kiểm tra cấu hình
- Đảm bảo `metro.config.js` đúng cú pháp
- Kiểm tra `babel.config.js` có tương thích
- Xác nhận React Native version tương thích

### Cấu hình đã được tối ưu:
- ✅ Metro config với error handling
- ✅ Babel config tối ưu
- ✅ Scripts khởi động tự động
- ✅ Cache configuration
- ✅ Port management

### Lệnh khởi động nhanh:
```bash
npm run start          # Khởi động với reset cache
npm run start-clean    # Khởi động sạch hoàn toàn
npm run start-port     # Khởi động với port cụ thể
```

### Nếu vẫn gặp vấn đề:
1. Kiểm tra log lỗi trong terminal
2. Thử khởi động với `--verbose` flag
3. Kiểm tra Node.js version (khuyến nghị 18+)
4. Xóa và cài lại toàn bộ dependencies 