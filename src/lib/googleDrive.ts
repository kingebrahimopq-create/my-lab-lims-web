const CLIENT_ID = '313164369951-4f3a3sde194h9hnsskbg0jvdl8l2shk.apps.googleusercontent.com';
const API_KEY = 'AIzaSyC_r_T5m_HIy3CaU1y0iAqMc6rV6_qKPfk';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

class GoogleDriveService {
  private token: string | null = null;
  private initialized = false;

  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.initialized) {
        resolve(true);
        return;
      }

      const checkGapi = () => {
        if (typeof gapi !== 'undefined') {
          gapi.load('client:auth2', async () => {
            try {
              await gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                scope: SCOPES,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
              });
              this.initialized = true;
              resolve(true);
            } catch (error) {
              console.error('GAPI init error:', error);
              resolve(false);
            }
          });
        } else {
          setTimeout(checkGapi, 100);
        }
      };
      checkGapi();
    });
  }

  async signIn(): Promise<boolean> {
    try {
      await this.initialize();
      const auth = gapi.auth2.getAuthInstance();
      const user = await auth.signIn();
      this.token = user.getAuthResponse().access_token;
      localStorage.setItem('google_drive_token', this.token || '');
      return true;
    } catch (error) {
      console.error('Google sign in error:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      const auth = gapi.auth2.getAuthInstance();
      await auth.signOut();
      this.token = null;
      localStorage.removeItem('google_drive_token');
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }

  isSignedIn(): boolean {
    try {
      if (!this.initialized) {
        const token = localStorage.getItem('google_drive_token');
        return !!token;
      }
      const auth = gapi.auth2.getAuthInstance();
      return auth?.isSignedIn.get() || false;
    } catch {
      return false;
    }
  }

  async backupData(data: Record<string, unknown>): Promise<boolean> {
    try {
      if (!this.token) {
        const saved = localStorage.getItem('google_drive_token');
        if (!saved) return false;
        this.token = saved;
      }

      const fileName = `mylab_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileContent = JSON.stringify(data, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: ['appDataFolder'],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${this.token}` }),
        body: form,
      });

      return response.ok;
    } catch (error) {
      console.error('Backup error:', error);
      return false;
    }
  }

  async restoreData(): Promise<Record<string, unknown> | null> {
    try {
      if (!this.token) {
        const saved = localStorage.getItem('google_drive_token');
        if (!saved) return null;
        this.token = saved;
      }

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=modifiedTime desc&pageSize=1',
        {
          headers: new Headers({ Authorization: `Bearer ${this.token}` }),
        }
      );

      const data = await response.json();
      if (!data.files || data.files.length === 0) return null;

      const fileId = data.files[0].id;
      const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: new Headers({ Authorization: `Bearer ${this.token}` }),
        }
      );

      const fileData = await fileResponse.json();
      return fileData;
    } catch (error) {
      console.error('Restore error:', error);
      return null;
    }
  }

  async exportToDrive(content: string, fileName: string, mimeType: string): Promise<boolean> {
    try {
      if (!this.token) {
        const saved = localStorage.getItem('google_drive_token');
        if (!saved) return false;
        this.token = saved;
      }

      const blob = new Blob([content], { type: mimeType });
      const metadata = {
        name: fileName,
        mimeType: mimeType,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ Authorization: `Bearer ${this.token}` }),
        body: form,
      });

      return response.ok;
    } catch (error) {
      console.error('Export error:', error);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
