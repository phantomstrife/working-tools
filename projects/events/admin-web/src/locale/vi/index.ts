export const vi = {
   components: {
      datatable: {
         total_count: '{{count}} bản ghi',
         selected_count: 'Đã chọn {{count}}',
         search_placeholder: 'Tìm kiếm...',
         all_records: 'Tất cả bản ghi',
         no_record: 'Không có bản ghi nào',
         sumary: 'Hiển thị {{start}} đến {{end}} trong tổng số {{total}} bản ghi',
         per_page: 'Bản ghi trên mỗi trang',
         page: 'Trang {{current}} / {{total}}',
      },
      not_found: {
         description: `Không có dữ liệu nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với các tiêu chí khác.`,
         retry: 'Thử lại',
      },
   },
   features: {
      authorize: {
         login_form: {
            title: 'Đăng nhập vào Bảng điều khiển',
            description: `Đăng nhập bằng tài khoản của bạn để tiếp tục. Nếu bạn gặp sự cố khi đăng nhập, vui lòng liên hệ với quản trị viên của bạn để được trợ giúp.`,
            email_placeholder: 'Email',
            password_placeholder: 'Mật khẩu',
            loading_true: 'Đang đăng nhập...',
            loading_false: 'Đăng nhập',
         },
      },
      company: {
         info_card: {
            industry: 'Ngành nghề',
            tax_code: 'Mã số thuế',
            not_specified: 'Chưa cập nhật',
            update: 'Cập nhật',
            contact_person: 'Người liên hệ',
            contact_email: 'Email liên hệ',
            contact_phone: 'Số điện thoại liên hệ',
            contact_address: 'Địa chỉ',
         },
         edit_form: {
            title: 'Cập nhật thông tin công ty',
            fields: {
               name: {
                  label: 'Tên công ty',
                  placeholder: 'Ví dụ: Công ty Cổ phần Acme',
               },
               tax_code: {
                  label: 'Mã số thuế',
                  placeholder: 'Ví dụ: 0101234567',
               },
               industry: {
                  label: 'Ngành nghề',
                  placeholder: 'Ví dụ: Công nghệ / Tài chính',
               },
               status: {
                  label: 'Trạng thái công ty',
                  managed_by_admin: 'Quản lý bởi Quản trị viên hệ thống',
               },
               contact_person: {
                  label: 'Người liên hệ',
                  placeholder: 'Họ và tên đầy đủ',
               },
               contact_email: {
                  label: 'Email liên hệ',
                  placeholder: 'contact@company.com',
               },
               contact_phone: {
                  label: 'Số điện thoại liên hệ',
                  placeholder: '+84 90 123 4567',
               },
               logo_url: {
                  label: 'Đường dẫn Logo',
                  placeholder: 'https://example.com/logo.webp',
               },
               address: {
                  label: 'Địa chỉ công ty',
                  placeholder: 'Số nhà, tên đường, tòa nhà, thành phố...',
               },
            },
            actions: {
               cancel: 'Hủy',
               saving_false: 'Lưu thay đổi',
               saving_true: 'Đang lưu...',
            },
            toast: {
               update_success: 'Cập nhật thông tin công ty thành công.',
               update_error: 'Không thể cập nhật thông tin công ty.',
            },
         },
      },
      event: {
         game_selector: {
            event_label: 'Chọn sự kiện',
            event_count: '{{count}} sự kiện',
            event_placeholder: 'Chọn một sự kiện...',
            game_label: 'Chọn trò chơi',
            game_count: 'Tìm thấy {{count}} trò chơi',
            game_placeholder: 'Chọn một trò chơi...',
            actions: {
               create: 'Tạo mới',
               edit: 'Chỉnh sửa',
               delete: 'Xóa',
               cancel: 'Hủy',
               delete_event_confirm: 'Xóa sự kiện',
               delete_game_confirm: 'Xóa trò chơi',
               deleting: 'Đang xóa...',
            },
            modals: {
               create_event_title: 'Tạo sự kiện mới',
               create_event_description: 'Thiết lập thông tin cơ bản, thời gian và địa điểm tổ chức sự kiện.',
               edit_event_title: 'Cập nhật sự kiện',
               edit_event_description: 'Chỉnh sửa thông tin, trạng thái và địa điểm của sự kiện.',
               delete_event_title: 'Xác nhận xóa sự kiện',
               delete_event_description: 'Hành động này sẽ xóa toàn bộ trò chơi và dữ liệu thuộc sự kiện này.',
               delete_event_message: 'Bạn có chắc chắn muốn xóa sự kiện "{{name}}" không?',
               create_game_title: 'Tạo trò chơi mới',
               create_game_description: 'Khởi tạo trò chơi tương tác mới thuộc sự kiện của công ty.',
               edit_game_title: 'Cập nhật trò chơi',
               edit_game_description: 'Chỉnh sửa tên, trạng thái hoặc mô tả của trò chơi.',
               delete_game_title: 'Xác nhận xóa trò chơi',
               delete_game_description: 'Hành động này không thể hoàn tác.',
               delete_game_message: 'Bạn có chắc chắn muốn xóa trò chơi "{{name}}" khỏi sự kiện này không?',
            },
            toast: {
               delete_event_success: 'Đã xóa sự kiện thành công.',
               delete_game_success: 'Đã xóa trò chơi thành công.',
            },
         },
         event_form: {
            fields: {
               name: {
                  label: 'Tên sự kiện',
                  placeholder: 'Ví dụ: Year End Party 2026',
               },
               slug: {
                  label: 'Đường dẫn định danh (Slug)',
                  placeholder: 'year-end-party-2026',
               },
               status: {
                  label: 'Trạng thái sự kiện',
               },
               location_name: {
                  label: 'Tên địa điểm',
                  placeholder: 'Ví dụ: Trung tâm Hội nghị White Palace',
               },
               start_time: {
                  label: 'Thời gian bắt đầu',
               },
               end_time: {
                  label: 'Thời gian kết thúc',
               },
               location_address: {
                  label: 'Địa chỉ chi tiết',
                  placeholder: 'Số nhà, đường, quận/huyện, tỉnh/thành phố...',
               },
               banner_url: {
                  label: 'Đường dẫn ảnh Banner',
                  placeholder: 'https://example.com/banner.webp',
               },
               description: {
                  label: 'Mô tả sự kiện',
                  placeholder: 'Thông tin giới thiệu ngắn gọn về chương trình...',
               },
            },
            statuses: {
               DRAFT: 'Bản nháp (DRAFT)',
               UPCOMING: 'Sắp diễn ra (UPCOMING)',
               ONGOING: 'Đang diễn ra (ONGOING)',
               COMPLETED: 'Đã hoàn thành (COMPLETED)',
               CANCELLED: 'Đã hủy (CANCELLED)',
            },
            actions: {
               cancel: 'Hủy',
               create_saving_false: 'Tạo sự kiện',
               create_saving_true: 'Đang tạo...',
               edit_saving_false: 'Lưu thay đổi',
               edit_saving_true: 'Đang lưu...',
            },
            toast: {
               create_success: 'Tạo sự kiện mới thành công.',
               edit_success: 'Cập nhật sự kiện thành công.',
            },
         },
         game_form: {
            fields: {
               event_id: {
                  label: 'Thuộc sự kiện',
                  placeholder: 'Chọn một sự kiện...',
               },
               name: {
                  label: 'Tên trò chơi',
                  placeholder: 'Ví dụ: Quay số may mắn Đêm Gala',
               },
               game_type: {
                  label: 'Loại trò chơi',
               },
               status: {
                  label: 'Trạng thái trò chơi',
               },
               description: {
                  label: 'Mô tả trò chơi',
                  placeholder: 'Ghi chú thể lệ hoặc mô tả ngắn về trò chơi...',
               },
            },
            game_types: {
               LUCKY_DRAW: 'Quay số trúng thưởng (LUCKY DRAW)',
            },
            statuses: {
               PENDING: 'Chờ cấu hình (PENDING)',
               READY: 'Sẵn sàng (READY)',
               LIVE: 'Đang diễn ra (LIVE)',
               FINISHED: 'Đã kết thúc (FINISHED)',
            },
            actions: {
               cancel: 'Hủy',
               create_saving_false: 'Tạo trò chơi',
               create_saving_true: 'Đang tạo...',
               edit_saving_false: 'Lưu thay đổi',
               edit_saving_true: 'Đang lưu...',
            },
            toast: {
               create_success: 'Tạo trò chơi mới thành công.',
               edit_success: 'Cập nhật trò chơi thành công.',
            },
         },
         overview: {
            title: 'Tổng quan về sự kiện và trò chơi',
            description: 'Bạn có thể chọn một sự kiện và trò chơi từ danh sách bên trên.',
         },
      },
      game_luck_draw: {
         overview: {
            prize: 'Giải thưởng',
            staff: 'Nhân viên',
         },
      },
      lucky_draw: {
         attendants_panel: {
            title: 'Quản lý người tham dự',
            actions: {
               import_csv: 'Nhập CSV',
               send_emails: 'Gửi Email',
               send_emails_selected: 'Gửi Email ({{count}})',
               sending_emails: 'Đang gửi Email...',
               export_winners: 'Xuất DS trúng thưởng',
               exporting_winners: 'Đang xuất...',
               create: 'Tạo mới',
               cancel: 'Hủy',
               delete_confirm: 'Xóa người tham dự',
               deleting: 'Đang xóa...',
            },
            toolbar: {
               search_placeholder: 'Tìm theo tên, số điện thoại, email hoặc mã vé...',
               filters: {
                  all: 'Tất cả người tham dự',
                  checkin_group: 'Trạng thái Check-In',
                  checked_in: 'Đã Check-In',
                  not_checked_in: 'Chưa Check-In',
                  winner_group: 'Trạng thái trúng thưởng',
                  winner: 'Đã trúng thưởng',
                  not_winner: 'Chưa trúng thưởng',
                  email_group: 'Trạng thái Email',
                  email_sent: 'Đã gửi Email',
                  email_pending: 'Chưa gửi / Lỗi',
               },
            },
            table: {
               headers: {
                  full_name: 'Họ và tên',
                  phone: 'Số điện thoại',
                  email: 'Email',
                  ticket_code: 'Mã vé',
                  email_status: 'Email',
                  checked_in: 'Check-In',
                  has_won: 'Trúng thưởng',
                  actions: 'Thao tác',
               },
               badges: {
                  checked_in: 'Đã Check-In',
                  pending: 'Chờ',
                  winner: 'Trúng thưởng',
                  no: 'Chưa',
                  email_NOT_SENT: 'Chưa gửi',
                  email_SENDING: 'Đang gửi...',
                  email_SENT: 'Đã gửi',
                  email_FAILED: 'Thất bại',
               },
            },
            modals: {
               create_title: 'Thêm người tham dự mới',
               create_description: 'Nhập thông tin người tham dự. Mã QR Check-In sẽ được tự động khởi tạo.',
               edit_title: 'Cập nhật người tham dự',
               edit_description: 'Chỉnh sửa thông tin chi tiết của người tham dự.',
               import_title: 'Nhập danh sách người tham dự từ CSV',
               import_description: 'Tải lên tệp CSV để thêm mới hoặc cập nhật người tham dự theo mã vé.',
               delete_title: 'Xác nhận xóa người tham dự',
               delete_description: 'Hành động này không thể hoàn tác.',
               delete_message:
                  'Bạn có chắc chắn muốn xóa người tham dự "{{name}}" (Mã vé: {{ticket}}) khỏi trò chơi này không?',
            },
            toast: {
               delete_success: 'Đã xóa người tham dự thành công.',
               export_success: 'Đã xuất danh sách trúng thưởng ({{count}} kết quả).',
               email_batch_success: 'Đã gửi thành công {{sent}}/{{total}} email qua {{provider}}.',
               email_batch_partial:
                  'Đã gửi {{sent}}/{{total}} email ({{failed}} thất bại) qua {{provider}}.',
               select_attendants_first: 'Vui lòng chọn ít nhất một người tham dự trong bảng để gửi email.',
            },
         },
         attendant_form: {
            fields: {
               full_name: {
                  label: 'Họ và tên',
                  placeholder: 'Ví dụ: Nguyễn Văn A',
               },
               ticket_code: {
                  label: 'Mã vé',
                  placeholder: 'Ví dụ: VIP-001',
               },
               email: {
                  label: 'Email',
                  placeholder: 'guest@company.com',
               },
               phone: {
                  label: 'Số điện thoại',
                  placeholder: '0901234567',
               },
               company_name: {
                  label: 'Công ty / Tổ chức',
                  placeholder: 'Ví dụ: Acme Corp',
               },
               department: {
                  label: 'Phòng ban',
                  placeholder: 'Ví dụ: Kỹ thuật',
               },
               qr_code_payload: {
                  label: 'Mã định danh QR (Tự động tạo)',
               },
            },
            actions: {
               cancel: 'Hủy',
               create_saving_false: 'Tạo người tham dự',
               create_saving_true: 'Đang tạo...',
               edit_saving_false: 'Lưu thay đổi',
               edit_saving_true: 'Đang lưu...',
            },
            toast: {
               create_success: 'Tạo người tham dự mới thành công.',
               edit_success: 'Cập nhật thông tin người tham dự thành công.',
            },
         },
         attendant_import: {
            guide_prefix: 'Các cột bắt buộc:',
            guide_optional: 'Tùy chọn',
            dropzone: {
               title: 'Nhấn để chọn hoặc kéo thả tệp CSV vào đây',
               subtitle: 'Hỗ trợ định dạng .csv (UTF-8). Các cột mở rộng sẽ được lưu vào custom_metadata.',
            },
            file: {
               rows_detected: '{{count}} dòng dữ liệu',
            },
            preview: {
               title: 'Xem trước ({{count}} dòng đầu tiên)',
            },
            summary: {
               result: 'Kết quả: Thêm mới {{inserted}}, Cập nhật {{updated}}, Bỏ qua {{skipped}} dòng lỗi.',
               row_prefix: 'Dòng {{row}}',
               reasons: {
                  missing_required_fields: 'Thiếu họ tên (full_name) hoặc mã vé (ticket_code)',
                  invalid_email: 'Định dạng email không hợp lệ',
                  duplicate_in_file: 'Trùng mã vé trong cùng tệp CSV',
               },
            },
            actions: {
               download_template: 'Tải CSV mẫu',
               change_file: 'Chọn tệp khác',
               close: 'Đóng',
               importing_false: 'Tiến hành nhập CSV',
               importing_true: 'Đang nhập dữ liệu...',
            },
            toast: {
               invalid_file_type: 'Vui lòng chọn tệp có định dạng .csv hợp lệ.',
               empty_file: 'Tệp CSV trống hoặc không có dữ liệu hợp lệ.',
               import_success: 'Nhập CSV hoàn tất: {{inserted}} thêm mới, {{updated}} cập nhật.',
            },
         },
         prize_panel: {
            title: 'Cấu hình giải thưởng',
            actions: {
               create: 'Tạo giải thưởng',
               cancel: 'Hủy',
               delete_confirm: 'Xóa giải thưởng',
               deleting: 'Đang xóa...',
            },
            toolbar: {
               search_placeholder: 'Tìm kiếm giải thưởng...',
               filters: {
                  stock_group: 'Tình trạng số lượng',
                  in_stock: 'Còn giải',
                  depleted: 'Đã hết',
               },
            },
            table: {
               tier_label: 'Hạng #{{tier}}',
               headers: {
                  tier: 'Hạng giải',
                  prize: 'Giải thưởng',
                  stock: 'Số lượng',
                  status: 'Trạng thái',
                  actions: 'Thao tác',
               },
               badges: {
                  IN_STOCK: 'Còn giải',
                  LOW_STOCK: 'Sắp hết',
                  DEPLETED: 'Đã hết',
               },
            },
            modals: {
               create_title: 'Tạo giải thưởng mới',
               create_description: 'Thiết lập hạng giải và số lượng phần thưởng cho chương trình.',
               edit_title: 'Cập nhật giải thưởng',
               edit_description: 'Chỉnh sửa thông tin và số lượng giải thưởng.',
               delete_title: 'Xác nhận xóa giải thưởng',
               delete_description: 'Hành động này không thể hoàn tác.',
               delete_message: 'Bạn có chắc chắn muốn xóa giải thưởng "{{name}}" khỏi trò chơi này không?',
            },
            toast: {
               delete_success: 'Đã xóa giải thưởng thành công.',
            },
         },
         prize_form: {
            fields: {
               name: {
                  label: 'Tên giải thưởng',
                  placeholder: 'Ví dụ: Giải Nhất - iPhone 16 Pro',
               },
               tier_order: {
                  label: 'Thứ tự hạng giải',
                  placeholder: '1',
               },
               total_quantity: {
                  label: 'Tổng số lượng',
                  placeholder: '1',
               },
               remaining_quantity: {
                  label: 'Số lượng còn lại',
                  placeholder: '1',
               },
               image_url: {
                  label: 'Đường dẫn hình ảnh',
                  placeholder: 'https://example.com/prize.webp',
               },
               description: {
                  label: 'Mô tả giải thưởng',
                  placeholder: 'Thông tin chi tiết về phần thưởng...',
               },
            },
            actions: {
               cancel: 'Hủy',
               create_saving_false: 'Tạo giải thưởng',
               create_saving_true: 'Đang tạo...',
               edit_saving_false: 'Lưu thay đổi',
               edit_saving_true: 'Đang lưu...',
            },
            toast: {
               create_success: 'Tạo giải thưởng mới thành công.',
               edit_success: 'Cập nhật giải thưởng thành công.',
            },
         },
         staff_panel: {
            title: 'Nhân sự phụ trách',
            actions: {
               assign: 'Phân công',
               cancel: 'Hủy',
               unassign_confirm: 'Gỡ phân công',
               unassigning: 'Đang gỡ...',
            },
            toolbar: {
               search_placeholder: 'Tìm theo tên, email hoặc số điện thoại...',
               filters: {
                  role_group: 'Vai trò nhân sự',
                  field_staff: 'Nhân viên hiện trường',
                  guard: 'Bảo vệ / Kiểm soát',
               },
            },
            table: {
               inactive: 'Ngưng hoạt động',
               headers: {
                  staff_member: 'Nhân viên',
                  role: 'Vai trò',
                  actions: 'Thao tác',
               },
               roles: {
                  FIELD_STAFF: 'FIELD STAFF',
                  GUARD: 'GUARD',
                  ADMIN: 'ADMIN',
                  SUPER_ADMIN: 'SUPER ADMIN',
               },
            },
            modals: {
               assign_title: 'Phân công nhân sự vào trò chơi',
               assign_description: 'Chọn nhân viên thuộc công ty để cấp quyền vận hành trò chơi này.',
               edit_title: 'Cập nhật thông tin nhân sự',
               edit_description: 'Chỉnh sửa thông tin, vai trò hoặc trạng thái hoạt động của nhân viên.',
               unassign_title: 'Xác nhận gỡ phân công',
               unassign_description: 'Nhân viên sẽ không còn quyền thao tác trên trò chơi này.',
               unassign_message:
                  'Bạn có chắc chắn muốn gỡ phân công nhân viên "{{name}}" ({{email}}) khỏi trò chơi này không?',
            },
            toast: {
               unassign_success: 'Đã gỡ phân công nhân sự thành công.',
            },
         },
         staff_form: {
            empty_candidates:
               'Hiện không còn nhân sự nào khả dụng để phân công (tất cả nhân viên hiện trường/bảo vệ của công ty đã được gán hoặc chưa được tạo).',
            fields: {
               account: {
                  label: 'Chọn nhân viên',
                  placeholder: 'Chọn một nhân viên trong công ty...',
                  loading: 'Đang tải danh sách nhân viên...',
               },
               full_name: {
                  label: 'Họ và tên',
                  placeholder: 'Nguyễn Văn B',
               },
               email: {
                  label: 'Email tài khoản',
               },
               phone: {
                  label: 'Số điện thoại',
                  placeholder: '0901234567',
               },
               role: {
                  label: 'Vai trò',
               },
               status: {
                  label: 'Trạng thái hoạt động',
               },
            },
            roles: {
               FIELD_STAFF: 'Nhân viên hiện trường (FIELD STAFF)',
               GUARD: 'Bảo vệ / Kiểm soát (GUARD)',
               ADMIN: 'Quản trị viên (ADMIN)',
               SUPER_ADMIN: 'Quản trị hệ thống (SUPER ADMIN)',
            },
            statuses: {
               ACTIVE: 'Đang hoạt động',
               INACTIVE: 'Ngưng hoạt động',
            },
            actions: {
               cancel: 'Hủy',
               assign_saving_false: 'Phân công',
               assign_saving_true: 'Đang phân công...',
               edit_saving_false: 'Lưu thay đổi',
               edit_saving_true: 'Đang lưu...',
            },
            toast: {
               assign_success: 'Phân công nhân sự vào trò chơi thành công.',
               edit_success: 'Cập nhật thông tin nhân sự thành công.',
            },
         },
      },
      guard: {
         check_in: {
            loading_assignments: 'Đang tải danh sách trò chơi được phân công...',
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
               subtitle:
                  'Sử dụng máy quét cầm tay (USB) hoặc bật camera để quét vé mời QR của khách tham dự.',
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
               camera_error:
                  'Không thể truy cập camera. Vui lòng kiểm tra quyền thiết bị hoặc dùng máy quét USB.',
            },
            manual: {
               title: 'Tra cứu & Check-in thủ công',
               subtitle:
                  'Tìm kiếm theo họ tên, mã vé, số điện thoại hoặc email khi khách quên mang mã QR.',
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
         board: {
            winners_title: 'Người trúng giải',
            close_winners_shortcut: 'Đóng (W)',
            no_winners: 'Chưa có người trúng giải',
            congrats: 'Chúc mừng người chiến thắng',
            searching_winner: 'Đang tìm kiếm người may mắn...',
            select_prize: 'Vui lòng chọn giải thưởng',
            prize_exhausted: 'Đã hết giải thưởng',
            ready: 'Sẵn sàng',
            all_awarded: 'Đã trao hết',
            remaining_count: 'Còn lại {{remaining}}/{{total}}',
         },
         controls: {
            title: 'Bảng Điều Khiển Quay Số',
            realtime_connected: 'Đã kết nối Realtime Check-in',
            operator_ready: 'Sẵn sàng vận hành',
            sync: 'Đồng bộ',
            syncing: 'Đang tải...',
            sync_tooltip: 'Tải lại danh sách khách check-in & giải thưởng',
            minimize: 'Thu gọn',
            minimize_tooltip: 'Thu gọn bảng điều khiển',
            expand_tooltip: 'Mở rộng bảng điều khiển',
            operator_pill: 'Điều khiển',
            switch_to_dashboard: 'Bảng điều khiển',
            switch_to_guard: 'Cổng Check-in',
            logout: 'Đăng xuất',
            event_label: 'Sự kiện',
            event_placeholder: '-- Chọn sự kiện --',
            game_label: 'Trò chơi',
            game_placeholder: '-- Chọn trò chơi --',
            prize_label: 'Giải thưởng đang quay',
            prize_placeholder: '-- Chọn giải thưởng --',
            show_winners: 'Hiện DS trúng (W)',
            hide_winners: 'Ẩn DS trúng (W)',
            telemetry: {
               checked_in: 'Đã Check-in',
               eligible: 'Hợp lệ',
               drawn: 'Đã trao',
            },
            draw_mode_label: 'Chế độ quay',
            modes: {
               auto: 'Tự động',
               manual: 'Thủ công',
               instant: 'Tức thì',
            },
            start_draw: 'Bắt đầu quay số',
            preparing_draw: 'Đang lấy kết quả...',
            spinning_reels: 'Đang quay số...',
            prize_completed: 'Đã trao hết giải này',
            stop_next_reel: 'Dừng ô tiếp theo ({{stopped}}/{{total}}) · Space',
            redraw_absent: 'Quay lại ({{ticket}} vắng mặt)',
            draw_short: 'Quay số',
            preparing_short: 'Đang xử lý...',
            spinning_short: 'Đang quay...',
            stop_short: 'Dừng',
            shortcuts_hint:
               'Phím tắt: [Space] Dừng ô số • [W] DS trúng giải • [H] Ẩn/hiện bảng điều khiển',
         },
         placeholder: {
            badge: 'FIELD STAFF • EVENT GAME',
            title: 'Giao diện trò chơi chưa được hỗ trợ',
            description: 'Loại trò chơi này sẽ được bổ sung giao diện trình chiếu ở phiên bản tiếp theo.',
            selected_game: 'Trò chơi đang chọn',
            no_game: 'Chưa chọn trò chơi',
         },
      },
   },
   layouts: {
      admin: {
         navigation: {
            title: 'Menu Chính',
            items: {
               dashboard: 'Bảng điều khiển',
               company: 'Công ty',
               event: 'Sự kiện',
               game: 'Trò chơi',
               account: 'Tài khoản',
               guard: 'Cổng Check-in',
               operator: 'Điều khiển Game',
            },
         },
         fixed_header: {
            search_placeholder: 'Tìm kiếm sự kiện, trò chơi, người tham dự...',
         },
      },
      venue: {
         app_title: 'Event Tools • Venue',
         event_label: 'Sự kiện',
         game_label: 'Trò chơi',
         no_events: 'Chưa có sự kiện được phân công',
         no_games: 'Chưa có trò chơi',
         refresh_assignments: 'Làm mới danh sách phân công',
         logout: 'Đăng xuất',
         modes: {
            dashboard: 'Bảng điều khiển',
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
   services: {
      account: {
         not_found: 'Không tìm thấy tài khoản.',
         login_failed: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn và thử lại.',
         deactivated: `Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với quản trị viên của bạn để được trợ giúp.`,
         access_denied: 'Truy cập bị từ chối: Bạn không có quyền truy cập vào cổng thông tin này.',
      },
      company: {
         not_found: 'Không tìm thấy công ty.',
      },
      event: {
         not_found: 'Không tìm thấy sự kiện.',
         missing_name: 'Vui lòng nhập tên sự kiện.',
         missing_slug: 'Vui lòng nhập đường dẫn định danh (slug) cho sự kiện.',
         duplicate_slug: 'Đường dẫn (slug) này đã tồn tại. Vui lòng sử dụng một slug khác.',
         create_failed: 'Không thể tạo sự kiện mới.',
         save_failed: 'Không thể lưu thông tin sự kiện.',
         delete_failed: 'Không thể xóa sự kiện.',
      },
      game: {
         missing_name: 'Vui lòng nhập tên trò chơi.',
         missing_event: 'Vui lòng chọn sự kiện cho trò chơi.',
         create_failed: 'Không thể tạo trò chơi mới.',
         save_failed: 'Không thể lưu thông tin trò chơi.',
         delete_failed: 'Không thể xóa trò chơi.',
         get_staff_not_found: 'Không tìm thấy nhân viên cho trò chơi này.',
         staff_already_assigned: 'Nhân viên này đã được phân công vào trò chơi.',
         staff_assign_failed: 'Không thể phân công nhân viên vào trò chơi.',
         staff_missing_name: 'Vui lòng nhập họ và tên nhân viên.',
         staff_update_failed: 'Không thể cập nhật thông tin nhân viên.',
      },
      game_lucky_draw: {
         game_not_found: 'Không tìm thấy trò chơi hoặc sự kiện tương ứng.',
         prize: {
            not_found: 'Không tìm thấy giải thưởng cho trò chơi này.',
            missing_name: 'Vui lòng nhập tên giải thưởng.',
            invalid_quantity: 'Số lượng giải thưởng không hợp lệ.',
            save_failed: 'Không thể lưu thông tin giải thưởng.',
         },
         attendant: {
            not_found: 'Không tìm thấy người tham dự.',
            missing_required_fields: 'Vui lòng nhập đầy đủ Họ tên và Mã vé.',
            duplicate_ticket_code: 'Mã vé này đã tồn tại trong trò chơi. Vui lòng sử dụng mã vé khác.',
            save_failed: 'Không thể lưu thông tin người tham dự.',
            csv_empty: 'Tệp CSV trống hoặc không có dòng dữ liệu nào.',
            csv_missing_headers: 'Tệp CSV thiếu cột bắt buộc: full_name và ticket_code.',
            no_selection: 'Vui lòng chọn ít nhất một người tham dự để gửi email.',
         },
         check_in: {
            missing_fields: 'Thiếu thông tin check-in (trò chơi, mã QR hoặc người tham dự).',
            game_not_assigned: 'Bạn chưa được phân công vào trò chơi này.',
            invalid_qr: 'Mã QR không hợp lệ.',
            qr_wrong_game: 'Mã QR này thuộc về trò chơi khác.',
            attendant_not_found: 'Không tìm thấy người tham dự tương ứng.',
            failed: 'Không thể thực hiện check-in. Vui lòng thử lại.',
         },
         draw: {
            missing_fields: 'Thiếu thông tin trò chơi hoặc giải thưởng để quay số.',
            game_not_assigned: 'Bạn chưa được phân công vận hành trò chơi này.',
            winner_not_found: 'Không tìm thấy lượt trúng thưởng cần hủy.',
            prize_depleted: 'Giải thưởng này đã được trao hết.',
            no_eligible_attendants: 'Không còn khách tham dự đủ điều kiện (đã check-in) để quay số.',
            draw_conflict: 'Có xung đột dữ liệu khi lưu kết quả quay số. Vui lòng thử lại.',
            failed: 'Không thể thực hiện quay số. Vui lòng thử lại.',
         },
      },
      user: {
         not_found: 'Không tìm thấy người dùng.',
         unauthenticated: 'Người dùng chưa xác thực. Vui lòng đăng nhập để tiếp tục.',
         access_denied: 'Truy cập bị từ chối: Bạn không có quyền truy cập vào tài nguyên này.',
      },
   },
};
