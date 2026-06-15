/**
 * Gmail Service - خدمة إرسال البريد الإلكتروني عبر Gmail
 * تدعم إرسال التقارير والإشعارات
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface GmailAuthState {
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
}

let authClient: OAuth2Client | null = null;
let authState: GmailAuthState = { isAuthenticated: false };

/**
 * تهيئة عميل OAuth2 لـ Gmail
 */
export const initGmailAuth = (clientId: string, clientSecret: string, redirectUri: string) => {
  authClient = new OAuth2Client(clientId, clientSecret, redirectUri);
  return authClient;
};

/**
 * الحصول على رابط التفويض
 */
export const getAuthorizationUrl = (clientId: string, scopes: string[] = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]): string => {
  if (!authClient) {
    throw new Error('يجب تهيئة Gmail Auth أولاً');
  }

  return authClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

/**
 * معالجة رد الاتصال بعد المصادقة
 */
export const handleAuthCallback = async (code: string): Promise<GmailAuthState> => {
  if (!authClient) {
    throw new Error('يجب تهيئة Gmail Auth أولاً');
  }

  try {
    const { tokens } = await authClient.getToken(code);
    authClient.setCredentials(tokens);

    // حفظ الرموز في localStorage
    if (tokens.access_token) {
      localStorage.setItem('gmail_access_token', tokens.access_token);
    }
    if (tokens.refresh_token) {
      localStorage.setItem('gmail_refresh_token', tokens.refresh_token);
    }

    // الحصول على معلومات المستخدم
    const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
    const userInfo = await oauth2.userinfo.get();

    authState = {
      isAuthenticated: true,
      userEmail: userInfo.data.email || undefined,
      userName: userInfo.data.name || undefined
    };

    localStorage.setItem('gmail_auth_state', JSON.stringify(authState));
    return authState;
  } catch (error) {
    console.error('خطأ في المصادقة:', error);
    throw error;
  }
};

/**
 * استعادة جلسة المصادقة من localStorage
 */
export const restoreGmailSession = (): GmailAuthState => {
  const savedState = localStorage.getItem('gmail_auth_state');
  if (savedState) {
    try {
      authState = JSON.parse(savedState);
      const accessToken = localStorage.getItem('gmail_access_token');
      if (accessToken && authClient) {
        authClient.setCredentials({ access_token: accessToken });
      }
    } catch (error) {
      console.error('خطأ في استعادة الجلسة:', error);
    }
  }
  return authState;
};

/**
 * إرسال بريد إلكتروني عبر Gmail
 */
export const sendEmail = async (options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  if (!authClient || !authState.isAuthenticated) {
    return { success: false, error: 'يجب المصادقة أولاً' };
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    // بناء الرسالة
    let message = `To: ${options.to}\r\n`;
    message += `Subject: ${options.subject}\r\n`;
    message += `Content-Type: text/html; charset="UTF-8"\r\n`;
    message += `\r\n${options.body}`;

    // ترميز الرسالة
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    return {
      success: true,
      messageId: response.data.id || undefined
    };
  } catch (error: any) {
    console.error('خطأ في إرسال البريد:', error);
    return {
      success: false,
      error: error.message || 'فشل إرسال البريد'
    };
  }
};

/**
 * إرسال تقرير عبر البريد
 */
export const sendReportEmail = async (
  recipientEmail: string,
  reportTitle: string,
  reportContent: string,
  reportFile?: { filename: string; content: Buffer }
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2>${reportTitle}</h2>
        <div style="margin: 20px 0;">
          ${reportContent}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          تم إرسال هذا التقرير من نظام إدارة المختبر - My Lab LIMS
        </p>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: reportTitle,
    body: htmlBody,
    attachments: reportFile ? [reportFile] : undefined
  });
};

/**
 * تسجيل الخروج من Gmail
 */
export const signOutGmail = () => {
  authState = { isAuthenticated: false };
  localStorage.removeItem('gmail_auth_state');
  localStorage.removeItem('gmail_access_token');
  localStorage.removeItem('gmail_refresh_token');
};

/**
 * الحصول على حالة المصادقة الحالية
 */
export const getGmailAuthState = (): GmailAuthState => {
  return authState;
};
