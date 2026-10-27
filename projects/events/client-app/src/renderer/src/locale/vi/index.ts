export const vi = {
   layouts: {
      venue: {
         app_title: 'Event Tools • Venue',
         event_label: 'Sự kiện',
         game_label: 'Trò chơi',
         no_events: 'Chưa có sự kiện được phân công',
         no_games: 'Chưa có trò chơi',
         refresh_assignments: 'Làm mới danh sách phân công',
         logout: 'Đăng xuất',
         modes: {
            guard: 'Cổng Check-in',
            operator: 'Điều khiển Game',
         },
         roles: {
            SUPER_ADMIN: 'Super Admin',
            ADMIN: 'Quản trị viên',
            FIELD_STAFF: 'Nhân viên hiện trường',
            GUARD: 'Bảo vệ / Kiểm soát',
         },
         game_status: {
            PENDING: 'Chờ cấu hình',
            READY: 'Sẵn sàng',
            LIVE: 'Đang diễn ra',
            FINISHED: 'Đã kết thúc',
         },
      },
   },
   features: {
      authorize: {
         login_form: {
            title: 'Chào mừng trở lại',
            description: 'Đăng nhập bằng tài khoản nhân sự hiện trường để vận hành sự kiện.',
            email_placeholder: 'Địa chỉ email',
            password_placeholder: 'Mật khẩu',
            loading_true: 'Đang đăng nhập...',
            loading_false: 'Đăng nhập',
         },
      },
      guard: {
         check_in: {
            empty_assignment_title: 'Chưa có trò chơi nào được phân công',
            empty_assignment_description:
               'Tài khoản của bạn hiện chưa được phân công vào trò chơi Lucky Draw nào. Vui lòng liên hệ Quản trị viên sự kiện hoặc nhấn Làm mới.',
            stats: {
               checked_in: 'Đã check-in',
               remaining: 'Chưa check-in',
               total: 'Tổng khách mời',
               rate: 'Tỷ lệ tham dự',
               refresh: 'Đồng bộ số liệu',
            },
            qr: {
               title: 'Quét mã QR Check-in',
               subtitle: 'Sử dụng máy quét cầm tay (USB) hoặc bật camera để quét vé mời QR của khách tham dự.',
               modes: {
                  scanner: 'Máy quét USB / Nhập mã',
                  camera: 'Camera trực tiếp',
               },
               scanner_input_label: 'Chuỗi mã QR (qr_code_payload)',
               scanner_placeholder: 'Đặt con trỏ tại đây và quét mã QR (hoặc dán mã QR)...',
               scanner_hint: 'Máy quét USB sẽ tự động điền mã và nhấn Enter để check-in ngay lập tức.',
               submit_scanning_false: 'Xác nhận Check-in',
               submit_scanning_true: 'Đang kiểm tra...',
               camera_start: 'Bật camera quét QR',
               camera_stop: 'Tắt camera',
               camera_starting: 'Đang kết nối camera...',
               camera_active_hint: 'Đưa mã QR của khách vào khung ngắm để tự động nhận diện.',
               camera_error: 'Không thể truy cập camera. Vui lòng kiểm tra quyền thiết bị hoặc dùng máy quét USB.',
            },
            manual: {
               title: 'Tra cứu & Check-in thủ công',
               subtitle: 'Tìm kiếm theo họ tên, mã vé, số điện thoại hoặc email khi khách quên mang mã QR.',
               search_placeholder: 'Nhập tên, mã vé, SĐT hoặc email...',
               searching: 'Đang tìm kiếm...',
               empty_prompt: 'Nhập từ khóa ở ô tìm kiếm để tra cứu danh sách khách tham dự.',
               no_results: 'Không tìm thấy khách tham dự nào khớp với từ khóa.',
               columns: {
                  attendant: 'Khách tham dự',
                  ticket: 'Mã vé',
                  company: 'Đơn vị / Phòng ban',
                  status: 'Trạng thái',
                  action: 'Thao tác',
               },
               badges: {
                  checked_in: 'Đã check-in',
                  pending: 'Chưa check-in',
               },
               check_in_btn: 'Check-in',
               checking_in_btn: 'Đang xử lý...',
            },
            feedback: {
               title: 'Kết quả Check-in gần nhất',
               empty: 'Chưa có lượt check-in nào trong phiên làm việc này.',
               success_title: 'CHECK-IN THÀNH CÔNG',
               already_title: 'KHÁCH ĐÃ CHECK-IN TRƯỚC ĐÓ',
               error_title: 'KHÔNG THỂ CHECK-IN',
               ticket_label: 'Mã vé',
               company_label: 'Đơn vị',
               contact_label: 'Liên hệ',
               time_label: 'Thời gian check-in',
               method_QR_SCAN: 'Quét mã QR',
               method_MANUAL_SEARCH: 'Tra cứu thủ công',
               recent_title: 'Lịch sử vừa kiểm soát',
            },
            toast: {
               check_in_success: 'Đã check-in thành công: {{name}} ({{ticket}})',
               already_checked_in: 'Khách {{name}} ({{ticket}}) đã check-in trước đó.',
            },
         },
      },
      operator: {
         placeholder: {
            badge: 'FIELD STAFF • LUCKY DRAW',
            title: 'Màn hình Điều khiển & Quay số Trực tiếp',
            description:
               'Không gian trình chiếu giải thưởng và quay số trúng thưởng trực tiếp dành cho Nhân viên hiện trường sẽ được triển khai ở giai đoạn tiếp theo.',
            selected_game: 'Trò chơi đang chọn',
            no_game: 'Chưa chọn trò chơi',
         },
      },
   },
   services: {
      account: {
         not_found: 'Không tìm thấy tài khoản.',
         login_failed: 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.',
         deactivated: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên.',
         access_denied: 'Truy cập bị từ chối: Ứng dụng này chỉ dành cho nhân sự hiện trường (Bảo vệ / Vận hành).',
      },
      user: {
         unauthenticated: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
         access_denied: 'Bạn không có quyền thực hiện thao tác này.',
      },
      admin_api: {
         network_error: 'Không thể kết nối tới máy chủ Admin API. Vui lòng kiểm tra kết nối mạng.',
         invalid_response: 'Phản hồi từ máy chủ không hợp lệ.',
      },
      game_lucky_draw: {
         game_not_found: 'Không tìm thấy trò chơi hoặc sự kiện tương ứng.',
         check_in: {
            missing_fields: 'Thiếu thông tin check-in (trò chơi, mã QR hoặc người tham dự).',
            game_not_assigned: 'Bạn chưa được phân công vào trò chơi này.',
            invalid_qr: 'Định dạng mã QR không hợp lệ.',
            qr_wrong_game: 'Mã QR này thuộc về một trò chơi khác.',
            attendant_not_found: 'Không tìm thấy khách tham dự tương ứng với mã này.',
         },
      },
   },
};

