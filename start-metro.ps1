# Script khởi động Metro ổn định
Write-Host "Đang khởi động Metro Bundler..." -ForegroundColor Green

# Kiểm tra và dừng các process Metro đang chạy
$metroProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.CommandLine -like "*metro*"}
if ($metroProcesses) {
    Write-Host "Đang dừng các process Metro cũ..." -ForegroundColor Yellow
    $metroProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Xóa cache Metro
Write-Host "Đang xóa cache Metro..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force
}

# Khởi động Metro với cấu hình tối ưu
Write-Host "Khởi động Metro với cấu hình tối ưu..." -ForegroundColor Green
try {
    # Sử dụng npx để đảm bảo sử dụng phiên bản đúng
    npx react-native start --reset-cache --port 8081
} catch {
    Write-Host "Lỗi khi khởi động Metro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Thử khởi động với cấu hình mặc định..." -ForegroundColor Yellow
    npx react-native start
} 