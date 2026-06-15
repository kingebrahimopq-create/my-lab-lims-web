# My Lab LIMS Web Application

تطبيق ويب متكامل لإدارة معلومات المختبر (LIMS) يجمع بين وظائف مشروع `Laboratory-` وميزات الويب الحديثة، مع دعم قوي لتكامل خدمات Google (Gmail و Drive) والنشر التلقائي عبر GitHub Actions.

## نظرة عامة على المشروع

يهدف هذا المشروع إلى توفير نظام LIMS قوي ومرن يمكن الوصول إليه عبر الويب. تم دمج المكونات والخدمات الأساسية من مستودع `Laboratory-` لإنشاء تطبيق ويب غني بالميزات، مع التركيز على سهولة الاستخدام، الأمان، وإمكانيات المزامنة السحابية.

## الميزات الرئيسية

*   **إدارة المختبر**: دمج شامل لوظائف إدارة المختبر من مشروع `Laboratory-`.
*   **تطبيق ويب حديث**: مبني باستخدام React و Vite، مما يوفر تجربة مستخدم سريعة وتفاعلية.
*   **تكامل Google Drive**: مزامنة تلقائية للنسخ الاحتياطية للبيانات مع Google Drive، مما يضمن أمان البيانات وسهولة استعادتها.
*   **تكامل Gmail**: إمكانية إرسال التقارير والإشعارات عبر البريد الإلكتروني مباشرة من التطبيق.
*   **نشر تلقائي (CI/CD)**: استخدام GitHub Actions لأتمتة عملية البناء والنشر على GitHub Pages.
*   **واجهة مستخدم متعددة اللغات**: دعم للغة العربية والإنجليزية.

## هيكل المشروع

يتكون المشروع من المكونات الرئيسية التالية:

*   `src/`: يحتوي على الكود المصدري لتطبيق React.
    *   `src/components/`: مكونات React لواجهة المستخدم.
    *   `src/services/`: الخدمات المختلفة مثل `firebase-storage-service.ts` (للمصادقة والنسخ الاحتياطي عبر Firebase) و `google-drive-web-service.ts` (لتكامل Google Drive) و `gmail-service.ts` (لإرسال البريد الإلكتروني).
    *   `src/db/`: طبقة التفاعل مع قاعدة البيانات.
    *   `src/hooks/`: خطافات React مخصصة لإعادة استخدام المنطق.
    *   `src/types/`: تعريفات الأنواع لـ TypeScript.
*   `.github/workflows/`: يحتوي على ملفات سير عمل GitHub Actions للنشر.
*   `firebase-config.example.json`: مثال لملف تكوين Firebase (يجب إعادة تسميته إلى `firebase-config.json` وتعبئة بياناتك).
*   `google-api-config.example.json`: مثال لملف تكوين Google API (يجب إعادة تسميته إلى `google-api-config.json` وتعبئة بياناتك).

## البدء السريع

للبدء في تطوير المشروع محليًا، اتبع الخطوات التالية:

1.  **استنساخ المستودع**:
    ```bash
    git clone https://github.com/kingebrahimopq-create/my-lab-lims-web.git
    cd my-lab-lims-web
    ```

2.  **تثبيت التبعيات**:
    ```bash
    npm install
    ```

3.  **تكوين Firebase و Google API**:
    *   قم بإنشاء مشروع Firebase جديد وقم بتفعيل Google Authentication و Cloud Storage.
    *   قم بإنشاء مشروع Google Cloud وقم بتفعيل Google Drive API و Gmail API.
    *   أعد تسمية `firebase-config.example.json` إلى `firebase-config.json` واملأ بيانات التكوين الخاصة بك.
    *   أعد تسمية `google-api-config.example.json` إلى `google-api-config.json` واملأ بيانات التكوين الخاصة بك، بما في ذلك `clientId` و `clientSecret` و `redirectUri` (يجب أن يتطابق مع `http://localhost:5173/auth/callback` للتطوير المحلي).

4.  **تشغيل التطبيق**:
    ```bash
    npm run dev
    ```
    سيتم تشغيل التطبيق على `http://localhost:5173`.

## تكامل Google Drive و Gmail

تم تصميم التكامل مع Google Drive و Gmail ليكون مرنًا وقابلاً للتوسيع. يعتمد على مكتبات `firebase` و `googleapis` لإدارة المصادقة والتفاعل مع واجهات برمجة التطبيقات.

### Google Drive (النسخ الاحتياطي)

*   **المصادقة**: يتم التعامل معها عبر `firebase-storage-service.ts` و `google-drive-web-service.ts` باستخدام Google OAuth2.
*   **النسخ الاحتياطي التلقائي**: يمكن تكوين التطبيق لرفع نسخ احتياطية من بيانات LIMS إلى Google Drive على فترات منتظمة.
*   **استعادة البيانات**: يمكن للمستخدمين استعراض واستعادة النسخ الاحتياطية السابقة من Google Drive.

### Gmail (إرسال التقارير)

*   **المصادقة**: يتم التعامل معها عبر `gmail-service.ts` باستخدام Google OAuth2.
*   **إرسال البريد الإلكتروني**: توفر الخدمة وظائف لإرسال رسائل البريد الإلكتروني، بما في ذلك التقارير المنسقة مع إمكانية إرفاق الملفات.

## النشر باستخدام GitHub Actions

يستخدم المشروع GitHub Actions لأتمتة عملية النشر على GitHub Pages. يتم تعريف سير العمل في ملف `.github/workflows/deploy.yml`.

عند كل عملية `push` إلى الفرع `main` (أو `master`)، أو عند التشغيل اليدوي لسير العمل، يقوم GitHub Actions بالخطوات التالية:

1.  **Checkout**: استنساخ كود المستودع.
2.  **Setup Node.js**: إعداد بيئة Node.js.
3.  **Install dependencies**: تثبيت التبعيات باستخدام `npm install`.
4.  **Build**: بناء التطبيق للإنتاج باستخدام `npm run build`.
    *   **ملاحظة**: يتم تمرير مفاتيح API الخاصة بـ Firebase و Google كمتغيرات بيئة سرية (secrets) إلى عملية البناء لضمان الأمان. يجب عليك إعداد هذه الأسرار في إعدادات مستودع GitHub الخاص بك.
5.  **Fix SPA routing**: نسخ `index.html` إلى `404.html` لدعم التوجيه في تطبيقات الصفحة الواحدة (SPA) على GitHub Pages.
6.  **Deploy to gh-pages**: نشر التطبيق المبني إلى GitHub Pages.

### إعداد أسرار GitHub (GitHub Secrets)

لتمكين النشر التلقائي وتكامل Google، يجب عليك إضافة الأسرار التالية إلى مستودع GitHub الخاص بك (Settings -> Secrets and variables -> Actions -> New repository secret):

*   `VITE_FIREBASE_API_KEY`
*   `VITE_FIREBASE_AUTH_DOMAIN`
*   `VITE_FIREBASE_PROJECT_ID`
*   `VITE_FIREBASE_STORAGE_BUCKET`
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`
*   `VITE_FIREBASE_APP_ID`
*   `VITE_GOOGLE_CLIENT_ID`
*   `VITE_GOOGLE_API_KEY`
*   `GITHUB_TOKEN` (يتم توفيره تلقائيًا بواسطة GitHub Actions، ولكن قد تحتاج إلى إعداده يدويًا إذا واجهت مشكلات)

## المساهمة

نرحب بالمساهمات في هذا المشروع. يرجى قراءة `CONTRIBUTING.md` (إذا كان متاحًا) للحصول على إرشادات حول كيفية المساهمة.

## الترخيص

هذا المشروع مرخص بموجب ترخيص MIT. انظر ملف `LICENSE` لمزيد من التفاصيل.

---

**المؤلف**: Manus AI
**التاريخ**: 15 يونيو 2026
