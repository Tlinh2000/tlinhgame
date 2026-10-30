@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto neednode
node -e "const p=process.versions.node.split('.').map(Number);process.exit(p[0]===24 && (p[1]>22 || (p[1]===22 && p[2]>=1))?0:1)"
if errorlevel 1 goto neednode
echo Đang chuẩn bị TlinhGame. Lần đầu cần kết nối Internet để tải thư viện.
call npm ci
if errorlevel 1 goto failed
echo.
echo Khi thấy thông báo Vite sẵn sàng, mở http://localhost:5173
echo Giữ cửa sổ này mở trong lúc sử dụng.
call npm run dev
if errorlevel 1 goto failed
pause
exit /b 0
:neednode
echo Cần cài Node.js 24 LTS, phiên bản từ 24.22.1.
echo Xem file BAT_DAU_O_DAY.html, mục Chạy trên máy Windows.
pause
exit /b 1
:failed
echo.
echo Chạy chưa thành công. Chụp phần thông báo lỗi trong cửa sổ này và gửi lại.
pause
exit /b 1
