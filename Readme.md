#   3D Single Star Systems Simulation
Mô phỏng hệ đơn sao 3D sử dụng WebGL và Three.js.

------------------------------------------------------------
YÊU CẦU HỆ THỐNG
------------------------------------------------------------
- **Node.js**: Phiên bản 16.x trở lên ([https://nodejs.org](https://nodejs.org))
- **Trình duyệt**: Chrome, Firefox, hoặc Edge (có hỗ trợ WebGL)
Mô phỏng hệ mặt trời 3D sử dụng WebGL và Three.js.

------------------------------------------------------------
YÊU CẦU HỆ THỐNG
------------------------------------------------------------
- **Node.js**: Phiên bản 16.x trở lên ([https://nodejs.org](https://nodejs.org))
- **Trình duyệt**: Chrome, Firefox, hoặc Edge (có hỗ trợ WebGL)
- **Máy chủ web cục bộ**: sử dụng Vite hoặc live-server để chạy

------------------------------------------------------------
CẤU TRÚC THƯ MỤC DỰ ÁN
------------------------------------------------------------

```
project-folder/
│
├── index.html
├── main.js
│
├── images/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   ├── 4.jpg
│   ├── sun.jpg
│   ├── mercurymap.jpg
│   ├── mercurybump.jpg
│   └── ... (các texture khác)
│
├── asteroids/
│   └── asteroidPack.glb
│
├── mars/
│   ├── phobos.glb
│   └── deimos.glb
│
├── node_modules/
├── package.json
└── package-lock.json
```

------------------------------------------------------------
HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN
------------------------------------------------------------

1. **Cài đặt các thư viện cần thiết:**
   - Mở terminal tại thư mục dự án
   - Chạy lệnh sau:
     ```
     npm install
     ```

2. **Đảm bảo đầy đủ tài nguyên:**
   - Tất cả hình ảnh trong thư mục `images/`
   - Mô hình 3D:
     ```
     asteroids/asteroidPack.glb
     mars/phobos.glb
     mars/deimos.glb
     ```

3. **Khởi động máy chủ cục bộ:**
   - Chạy lệnh:
     ```
     npm run dev
     ```

4. **Mở trình duyệt và truy cập URL do Vite cung cấp**
   - Thường là: [http://localhost:5173](http://localhost:5173)

------------------------------------------------------------
GHI CHÚ
------------------------------------------------------------
- **Không mở file `index.html` trực tiếp bằng trình duyệt** (sẽ lỗi CORS).
- **Phải chạy qua máy chủ Vite hoặc công cụ tương tự.**

------------------------------------------------------------
- **Máy chủ web cục bộ**: sử dụng Vite hoặc live-server để chạy

------------------------------------------------------------
CẤU TRÚC THƯ MỤC DỰ ÁN
------------------------------------------------------------

```
project-folder/
│
├── index.html
├── main.js
│
├── images/
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   ├── 4.jpg
│   ├── sun.jpg
│   ├── mercurymap.jpg
│   ├── mercurybump.jpg
│   └── ... (các texture khác)
│
├── asteroids/
│   └── asteroidPack.glb
│
├── mars/
│   ├── phobos.glb
│   └── deimos.glb
│
├── node_modules/
├── package.json
└── package-lock.json
```

------------------------------------------------------------
HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN
------------------------------------------------------------

1. **Cài đặt các thư viện cần thiết:**
   - Mở terminal tại thư mục dự án
   - Chạy lệnh sau:
     ```
     npm install
     ```

2. **Đảm bảo đầy đủ tài nguyên:**
   - Tất cả hình ảnh trong thư mục `images/`
   - Mô hình 3D:
     ```
     asteroids/asteroidPack.glb
     mars/phobos.glb
     mars/deimos.glb
     ```

3. **Khởi động máy chủ cục bộ:**
   - Chạy lệnh:
     ```
     npm run dev
     ```

4. **Mở trình duyệt và truy cập URL do Vite cung cấp**
   - Thường là: [http://localhost:5173](http://localhost:5173)

------------------------------------------------------------
GHI CHÚ
------------------------------------------------------------
- **Không mở file `index.html` trực tiếp bằng trình duyệt** (sẽ lỗi CORS).
- **Phải chạy qua máy chủ Vite hoặc công cụ tương tự.**

------------------------------------------------------------
