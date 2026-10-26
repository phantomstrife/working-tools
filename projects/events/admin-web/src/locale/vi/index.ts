export const vi = {
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
      },
   },
};
