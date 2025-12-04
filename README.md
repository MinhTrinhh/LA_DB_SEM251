đã giải quyết xong vấn đề flyway dùng dependency nó hijack kết nối, tự động connect vào master mà bỏ qua customized datbase -> bỏ dependency phải chạy mssql trước khi chạy backend
spring-boot ver 4.0.0 như loèn nên down xuống xài 3.4.0 để có thể sử dụng flyway

hiện tại vẫn xài hibernate cho login nên tạm để đó để tao sửa sau

recommend xài gui (azure) để xem database changes 
flyway.baseline = false mặc định (dùng khi tạo project mới) cái bảng nào mà flyway tụi bây không tạo mà tự có thì nó sẽ báo lỗi

user là tên bảng mặc định nên né bằng [user] để xài được

backend log lưu vào trong folder ./logs

init schema text nằm trong backend


file .env frontend recaptcha
# API Configuration
VITE_API_BASE_URL=http://localhost:20001

# reCAPTCHA (get from https://www.google.com/recaptcha/admin/create)
VITE_RECAPTCHA_SITE_KEY=6Le3sR0sAAAAAJ008sfkK8P4Otkj4ZMKctk8AnXB




ĐÃ SỬA LỖI REFER TO USER THAY VÀO ĐÓ REFER TO PROFILE 
TẠO THÊM TÍNH NĂNG QUÉT QR (TÀI KHOẢN CỦA TAO)
BÂY GIỜ CODE RẤT DƠ VẪN ĐANG XÀI HIBERNATE VẪN LỚN TÍNH NĂNG, PHẦN NÀO THẰNG NÀO LÀM THÌ CLEAN CODE PHẦN ĐÓ
