/**
 * Google Drive Web Service - خدمة المزامنة مع Google Drive للويب
 * تدعم رفع واستعادة النسخ الاحتياطية
 */

export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
  mimeType: string;
}

export interface DriveAuthState {
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  accessToken?: string;
}

let authState: DriveAuthState = { isAuthenticated: false };
let gapiLoaded = false;

/**
 * تحميل مكتبة Google API
 */
export const loadGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client:auth2', () => {
        gapiLoaded = true;
        resolve();
      });
    };
    script.onerror = () => reject(new Error('فشل تحميل Google API'));
    document.head.appendChild(script);
  });
};

/**
 * تهيئة Google Drive API
 */
export const initGoogleDrive = async (
  clientId: string,
  apiKey: string,
  discoveryDocs: string[] = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
): Promise<void> => {
  try {
    await loadGoogleAPI();

    await gapi.client.init({
      apiKey: apiKey,
      clientId: clientId,
      discoveryDocs: discoveryDocs,
      scope: 'https://www.googleapis.com/auth/drive.file'
    });

    // استعادة الجلسة إن وجدت
    const savedState = localStorage.getItem('drive_auth_state');
    if (savedState) {
      authState = JSON.parse(savedState);
    }
  } catch (error) {
    console.error('خطأ في تهيئة Google Drive:', error);
    throw error;
  }
};

/**
 * تسجيل الدخول إلى Google Drive
 */
export const signInToDrive = async (): Promise<DriveAuthState> => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    if (!auth2.isSignedIn.get()) {
      await auth2.signIn();
    }

    const user = auth2.currentUser.get();
    const profile = user.getBasicProfile();
    const authResponse = user.getAuthResponse();

    authState = {
      isAuthenticated: true,
      userEmail: profile.getEmail(),
      userName: profile.getName(),
      userAvatar: profile.getImageUrl(),
      accessToken: authResponse.id_token
    };

    localStorage.setItem('drive_auth_state', JSON.stringify(authState));
    return authState;
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    throw error;
  }
};

/**
 * تسجيل الخروج من Google Drive
 */
export const signOutFromDrive = async (): Promise<void> => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    await auth2.signOut();
    authState = { isAuthenticated: false };
    localStorage.removeItem('drive_auth_state');
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    throw error;
  }
};

/**
 * رفع ملف إلى Google Drive
 */
export const uploadFileToDrive = async (
  fileName: string,
  fileContent: string,
  mimeType: string = 'application/json',
  folderId?: string
): Promise<{ success: boolean; fileId?: string; error?: string }> => {
  if (!authState.isAuthenticated) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' };
  }

  try {
    const metadata: any = {
      name: fileName,
      mimeType: mimeType
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const file = new Blob([fileContent], { type: mimeType });
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const vcpToken = import.meta.env.VITE_GOOGLE_VCP_TOKEN;
    const headers: any = {
      Authorization: `Bearer ${authState.accessToken}`
    };
    
    if (vcpToken && vcpToken !== 'YOUR_VCP_TOKEN_HERE') {
      headers['X-VCP-Token'] = vcpToken;
    }

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: headers,
      body: form
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, fileId: result.id };
  } catch (error: any) {
    console.error('خطأ في رفع الملف:', error);
    return { success: false, error: error.message };
  }
};

/**
 * قائمة الملفات في Google Drive
 */
export const listDriveFiles = async (
  query: string = "name contains 'MyLab_Backup' and mimeType='application/json'",
  pageSize: number = 10
): Promise<DriveFile[]> => {
  if (!authState.isAuthenticated) {
    return [];
  }

  try {
    const response = await gapi.client.drive.files.list({
      q: query,
      spaces: 'drive',
      pageSize: pageSize,
      fields: 'files(id, name, createdTime, modifiedTime, size, mimeType)',
      orderBy: 'modifiedTime desc'
    });

    return response.result.files || [];
  } catch (error) {
    console.error('خطأ في استرجاع قائمة الملفات:', error);
    return [];
  }
};

/**
 * تنزيل ملف من Google Drive
 */
export const downloadFileFromDrive = async (fileId: string): Promise<any> => {
  if (!authState.isAuthenticated) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return response.result;
  } catch (error) {
    console.error('خطأ في تنزيل الملف:', error);
    throw error;
  }
};

/**
 * حذف ملف من Google Drive
 */
export const deleteFileFromDrive = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
  if (!authState.isAuthenticated) {
    return { success: false, error: 'يجب تسجيل الدخول أولاً' };
  }

  try {
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    return { success: true };
  } catch (error: any) {
    console.error('خطأ في حذف الملف:', error);
    return { success: false, error: error.message };
  }
};

/**
 * المزامنة التلقائية للنسخ الاحتياطية
 */
export const autoSyncBackups = async (
  dataProvider: () => any,
  intervalMs: number = 300000
): Promise<() => void> => {
  if (!authState.isAuthenticated) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const syncInterval = setInterval(async () => {
    try {
      const data = dataProvider();
      const fileName = `MyLab_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      await uploadFileToDrive(fileName, JSON.stringify(data, null, 2));
      localStorage.setItem('drive_last_sync', new Date().toISOString());
    } catch (error) {
      console.error('خطأ في المزامنة التلقائية:', error);
    }
  }, intervalMs);

  return () => clearInterval(syncInterval);
};

/**
 * الحصول على حالة المصادقة الحالية
 */
export const getDriveAuthState = (): DriveAuthState => {
  return authState;
};

/**
 * استعادة جلسة المصادقة من localStorage
 */
export const restoreDriveSession = (): DriveAuthState => {
  const savedState = localStorage.getItem('drive_auth_state');
  if (savedState) {
    try {
      authState = JSON.parse(savedState);
    } catch (error) {
      console.error('خطأ في استعادة الجلسة:', error);
    }
  }
  return authState;
};
