import type * as Types from './type';

const escapeHtml = (input: string): string => {
   return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
};

export const buildAttendantTicketEmail = (context: Types.TemplateContext) => {
   const trimmedSalutation = context.salutation?.trim() || '';
   const greetingName = [trimmedSalutation, context.fullName.trim()].filter(Boolean).join(' ');
   const safeGreetingName = escapeHtml(greetingName);
   const safeSalutation = trimmedSalutation ? escapeHtml(trimmedSalutation) : '—';
   const safeFullName = escapeHtml(context.fullName);
   const safeTicketCode = escapeHtml(context.ticketCode);
   const safeQrPayload = escapeHtml(context.qrCodePayload);
   const safeEventName = escapeHtml(context.eventName);
   const safeGameName = escapeHtml(context.gameName);
   const safeLocation = context.locationName ? escapeHtml(context.locationName) : null;
   const formattedStartTime = context.startTime
      ? escapeHtml(new Date(context.startTime).toLocaleString('vi-VN'))
      : null;
   const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(context.qrCodePayload)}`;

   const hasVerificationLinks = Boolean(context.confirmUrl && context.editUrl);
   const safeConfirmUrl = context.confirmUrl ? escapeHtml(context.confirmUrl) : '';
   const safeEditUrl = context.editUrl ? escapeHtml(context.editUrl) : '';
   const safeCitizenId = context.citizenId?.trim() ? escapeHtml(context.citizenId.trim()) : '—';
   const safeEmail = context.email?.trim() ? escapeHtml(context.email.trim()) : '—';
   const safePhone = context.phone?.trim() ? escapeHtml(context.phone.trim()) : '—';

   const verificationSectionHtml = hasVerificationLinks
      ? `<div style="padding:16px;background-color:#fefce8;border:1px solid #fff085;border-radius:8px;margin-bottom:20px;">
                  <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#404040;text-align:center;">
                     Vui lòng kiểm tra thông tin tham dự của bạn. Nhấn Xác nhận nếu thông tin đã chính xác, hoặc Thay đổi để chỉnh sửa.
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border:1px solid #e5e5e5;border-radius:6px;margin-bottom:14px;font-size:13px;color:#171717;">
                     <tr>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;color:#737373;width:40%;">Danh xưng</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;font-weight:700;text-align:right;">${safeSalutation}</td>
                     </tr>
                     <tr>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;color:#737373;width:40%;">Họ và tên</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;font-weight:700;text-align:right;">${safeFullName}</td>
                     </tr>
                     <tr>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;color:#737373;">CCCD / CMND</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;font-weight:700;text-align:right;">${safeCitizenId}</td>
                     </tr>
                     <tr>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;color:#737373;">Email</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f5f5f5;font-weight:700;text-align:right;word-break:break-all;">${safeEmail}</td>
                     </tr>
                     <tr>
                        <td style="padding:8px 12px;color:#737373;">Số điện thoại</td>
                        <td style="padding:8px 12px;font-weight:700;text-align:right;">${safePhone}</td>
                     </tr>
                  </table>
                  <div style="text-align:center;">
                     <a href="${safeConfirmUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:4px 6px;padding:10px 20px;background-color:#171717;color:#ffffff;border:1px solid #171717;text-decoration:none;font-size:14px;font-weight:700;border-radius:6px;">
                        Xác nhận
                     </a>
                     <a href="${safeEditUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:4px 6px;padding:10px 20px;background-color:#ffffff;color:#171717;border:1px solid #d4d4d4;text-decoration:none;font-size:14px;font-weight:700;border-radius:6px;">
                        Thay đổi
                     </a>
                  </div>
               </div>`
      : '';

   const subject = `[${context.eventName}] Vé tham dự & Mã QR Check-In (${context.ticketCode})`;

   const html = `
<!DOCTYPE html>
<html lang="vi">
   <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(subject)}</title>
   </head>
   <body style="margin:0;padding:24px;background-color:#f5f5f5;font-family:Arial,sans-serif;color:#171717;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
         <tr>
            <td style="padding:24px;background-color:#171717;color:#ffffff;">
               <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#a1a1a1;">${safeEventName}</div>
               <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;">${safeGameName}</h1>
            </td>
         </tr>
         <tr>
            <td style="padding:24px;">
               <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  Kính gửi <strong>${safeGreetingName}</strong>,
               </p>
               <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#525252;">
                  Dưới đây là thông tin vé tham dự và mã QR dùng để Check-In tham gia chương trình quay số trúng thưởng của bạn:
               </p>

               <div style="padding:16px;background-color:#f5f5f5;border:1px solid #e5e5e5;border-radius:8px;text-align:center;margin-bottom:20px;">
                  <div style="font-size:11px;text-transform:uppercase;color:#737373;font-weight:700;">Mã vé tham dự</div>
                  <div style="margin-top:4px;font-size:22px;font-weight:700;letter-spacing:1px;color:#171717;">${safeTicketCode}</div>
                  <div style="margin-top:16px;">
                     <img src="${qrImageUrl}" alt="QR Code" width="180" height="180" style="display:inline-block;border:1px solid #e5e5e5;border-radius:8px;background:#ffffff;padding:8px;" />
                  </div>
                  <div style="margin-top:10px;font-size:11px;font-family:monospace;color:#737373;word-break:break-all;">
                     ${safeQrPayload}
                  </div>
               </div>

               ${verificationSectionHtml}

               ${
                  safeLocation || formattedStartTime
                     ? `<div style="font-size:13px;line-height:1.6;color:#404040;border-top:1px solid #e5e5e5;padding-top:16px;">
                        ${safeLocation ? `<div><strong>Địa điểm:</strong> ${safeLocation}</div>` : ''}
                        ${formattedStartTime ? `<div><strong>Thời gian:</strong> ${formattedStartTime}</div>` : ''}
                     </div>`
                     : ''
               }
            </td>
         </tr>
      </table>
   </body>
</html>`.trim();

   const text = [
      `Kính gửi ${greetingName},`,
      `Sự kiện: ${context.eventName} - ${context.gameName}`,
      `Mã vé của bạn: ${context.ticketCode}`,
      `Mã QR Check-In: ${context.qrCodePayload}`,
      hasVerificationLinks
         ? 'Vui lòng kiểm tra thông tin tham dự của bạn. Nhấn Xác nhận nếu thông tin đã chính xác, hoặc Thay đổi để chỉnh sửa.'
         : '',
      hasVerificationLinks ? `Danh xưng: ${trimmedSalutation || '—'}` : '',
      hasVerificationLinks ? `Họ và tên: ${context.fullName}` : '',
      hasVerificationLinks ? `CCCD / CMND: ${context.citizenId?.trim() || '—'}` : '',
      hasVerificationLinks ? `Email: ${context.email?.trim() || '—'}` : '',
      hasVerificationLinks ? `Số điện thoại: ${context.phone?.trim() || '—'}` : '',
      hasVerificationLinks ? `Xác nhận: ${context.confirmUrl}` : '',
      hasVerificationLinks ? `Thay đổi: ${context.editUrl}` : '',
      context.locationName ? `Địa điểm: ${context.locationName}` : '',
      context.startTime ? `Thời gian: ${new Date(context.startTime).toLocaleString('vi-VN')}` : '',
   ]
      .filter(Boolean)
      .join('\n');

   return {
      subject,
      html,
      text,
   };
};
