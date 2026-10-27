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
            },
         },
         fixed_header: {
            search_placeholder: 'Tìm kiếm sự kiện, trò chơi, người tham dự...',
         },
      },
   },
   services: {
      account: {
         not_found: 'Không tìm thấy tài khoản.',
         login_failed: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn và thử lại.',
         deactivated: `Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với quản trị viên của bạn để được trợ giúp.`,
         access_denied: 'Truy cập bị từ chối: Cổng thông tin này chỉ dành cho Quản trị viên.',
      },
      company: {
         not_found: 'Không tìm thấy công ty.',
      },
      game: {
         get_staff_not_found: 'Không tìm thấy nhân viên cho trò chơi này.',
      },
      game_lucky_draw: {
         game_not_found: 'Không tìm thấy trò chơi hoặc sự kiện tương ứng.',
         prize: {
            not_found: 'Không tìm thấy giải thưởng cho trò chơi này.',
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
      },
      user: {
         not_found: 'Không tìm thấy người dùng.',
         unauthenticated: 'Người dùng chưa xác thực. Vui lòng đăng nhập để tiếp tục.',
         access_denied: 'Truy cập bị từ chối: Bạn không có quyền truy cập vào tài nguyên này.',
      },
   },
};
