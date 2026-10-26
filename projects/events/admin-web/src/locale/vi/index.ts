export const vi = {
   components: {
      not_found: {
         description: `Không có dữ liệu nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với các tiêu chí khác.`,
         retry: 'Thử lại',
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
      user: {
         not_found: 'Không tìm thấy người dùng.',
         unauthenticated: 'Người dùng chưa xác thực. Vui lòng đăng nhập để tiếp tục.',
         access_denied: 'Truy cập bị từ chối: Bạn không có quyền truy cập vào tài nguyên này.',
      },
   },
};
