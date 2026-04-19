const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendVerificationEmail = async (to, token) => {
  console.log('[SMTP] USER:', JSON.stringify(process.env.SMTP_USER));
  console.log('[SMTP] PASS:', JSON.stringify(process.env.SMTP_PASS));

  const url = `${process.env.SERVER_URL}/api/auth/verify-email/${token}`;
  await transporter.sendMail({
    from: `"AI Mock Interview IT" <${process.env.SMTP_USER?.trim()}>`,
    to,
    subject: 'Xác nhận email đăng ký',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#4f46e5;margin-top:0">Xác nhận tài khoản</h2>
        <p>Cảm ơn bạn đã đăng ký <strong>AI Mock Interview IT</strong>.</p>
        <p>Click vào nút bên dưới để xác nhận email và kích hoạt tài khoản:</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;margin:8px 0">
          Xác nhận Email
        </a>
        <p style="color:#6b7280;font-size:13px;margin-top:20px">
          Link có hiệu lực trong <strong>24 giờ</strong>.<br/>
          Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
  console.log("HÀM GỬI EMAIL ĐANG ĐƯỢC GỌI!!!");
};

const sendResetPasswordEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `"AI Mock Interview IT" <${process.env.SMTP_USER?.trim()}>`,
    to,
    subject: 'Đặt lại mật khẩu',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#4f46e5;margin-top:0">Đặt lại mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Click vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;margin:8px 0">
          Đặt lại mật khẩu
        </a>
        <p style="color:#6b7280;font-size:13px;margin-top:20px">
          Link có hiệu lực trong <strong>10 phút</strong>.<br/>
          Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
