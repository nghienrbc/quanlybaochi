@echo off
echo Đang khởi động Metro Bundler...

REM Kiểm tra và dừng các process Metro đang chạy
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Xóa cache Metro
echo Đang xóa cache Metro...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

REM Khởi động Metro với cấu hình tối ưu
echo Khởi động Metro với cấu hình tối ưu...
npx react-native start --reset-cache --port 8081

pause 