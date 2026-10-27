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
   const safeFullName = escapeHtml(context.fullName);
   const safeTicketCode = escapeHtml(context.ticketCode);
   const safeQrPayload = escapeHtml(context.qrCodePayload);
   const safeEventName = escapeHtml(context.eventName);
   const safeGameName = escapeHtml(context.gameName);
   const safeLocation = context.locationName ? escapeHtml(context.locationName) : null;
   const formattedStartTime = context.startTime ? escapeHtml(new Date(context.startTime).toLocaleString('vi-VN')) : null;
   const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(context.qrCodePayload)}`;

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
                  Xin chào <strong>${safeFullName}</strong>,
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
      `Xin chào ${context.fullName},`,
      `Sự kiện: ${context.eventName} - ${context.gameName}`,
      `Mã vé của bạn: ${context.ticketCode}`,
      `Mã QR Check-In: ${context.qrCodePayload}`,
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

