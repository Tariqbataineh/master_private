# قاعدة بيانات وصول — SQL Server + EF Core 10

هذه الحزمة مبنية على المشروع المرفق `New folder.zip`، وعقود `openapi.json`، ووحدات البيانات الفعلية تحت `assets/services/`.

**المحتوى:** تصميم 50 جدولًا و88 علاقة، سكربت إنشاء SQL Server، ملفات C# للكيانات وDbContext، أمثلة استعلامات Eager Loading، إجراء حظر، واختبار SQL قابل للتشغيل. لم يتم تغيير الفرونت أو الـ3D. هذه طبقة بيانات وليست Backend مكتملًا؛ لا توجد Controllers أو endpoints منفّذة هنا.

## ابدأ من SSMS

1. اتصل بنسخة SQL Server عندك باستخدام SSMS.
2. افتح `sql/01_Create_WusoolDb.sql` وشغّله. ينشئ `WusoolDb` إذا لم تكن موجودة، ويتوقف إذا كانت الجداول موجودة. لا يمسح قاعدة أو سجلات.
3. اختياريًا شغّل `sql/02_Optional_Catalog_Seed.sql`: متطلبات الإتاحة الـ12 وباقات الاشتراك الثلاث الموجودة في الفرونت. أسعار الباقات من بيانات العرض الحالية، راجعها قبل الدفع الحقيقي. لا يضيف أي مستخدم أو شركة وهمية.
4. شغّل `sql/03_Block_Account.sql` لإنشاء إجراء الحظر.
5. شغّل `sql/04_Verify_Schema.sql`. يجرب العلاقات ورفض خدمة فرع آخر والتقييم المكرر والمدة غير المقبولة، ثم يرجع كل سجلات الاختبار بـROLLBACK.

## الربط مع مشروع MVC

أضف مشروع `src/Wusool.Data` إلى الـsolution تبعك واعمل Project Reference من مشروع MVC. يحتوي على FrameworkReference وEF Core/Identity 10.0.0. هذا إصدار أساس متطابق للحزم، وليس ادعاء أنه أحدث patch؛ حدّث الحزم معًا إلى patch مدعوم بعد التحقق عندك.

```csharp
using Microsoft.EntityFrameworkCore;
using Wusool.Data;
using Wusool.Data.Entities;

builder.Services.AddDbContext<WusoolDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Wusool"),
        sql => sql.EnableRetryOnFailure()));
builder.Services.AddScoped<WusoolQueries>();
builder.Services.AddScoped<AccountAccess>();
// إذا لم يكن Identity موجودًا أصلًا في MVC:
builder.Services.AddIdentity<ApplicationUser, Microsoft.AspNetCore.Identity.IdentityRole>()
    .AddEntityFrameworkStores<WusoolDbContext>()
    .AddDefaultTokenProviders();
```

مثال اتصال تطوير محلي لـSQL Server Express:

```json
{
  "ConnectionStrings": {
    "Wusool": "Server=.\\SQLEXPRESS;Database=WusoolDb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True"
  }
}
```

عدّل Server حسب instance عندك. `TrustServerCertificate=True` للتطوير المحلي فقط؛ بيئة الإنتاج تحتاج شهادة صحيحة. استخدم User Secrets أو متغير بيئة لكلمات مرور الاتصال، وليس ملفات الفرونت.

### لا تخلط طريقتي إنشاء قاعدة البيانات

- **SQL أولًا:** شغّل السكربتات أعلاه. لا تشغّل بعدها InitialCreate Migration على نفس الجداول. قبل اعتماد migrations مستقبلية، اعمل baseline مراجَع ومتطابق مع القاعدة.
- **Migrations أولًا:** على قاعدة فارغة منفصلة، نفّذ من جذر الحزمة:

```powershell
$env:WUSOOL_CONNECTION_STRING = 'Server=.\SQLEXPRESS;Database=WusoolEfDb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True'
dotnet restore src/Wusool.Data/Wusool.Data.csproj
dotnet build src/Wusool.Data/Wusool.Data.csproj
dotnet tool install --global dotnet-ef --version 10.0.0
dotnet ef migrations add InitialCreate --project src/Wusool.Data
dotnet ef database update --project src/Wusool.Data
```

في مسار migrations أضف singleton `SyncRevisions` (Id=1) من seeder في الـBackend، وادمج seed وإجراء الحظر ضمن migrations خاصة بك؛ السكربتات المرفقة محددة على WusoolDb. لا تستخدم EnsureCreated مع migrations.

## Eager Loading

`WusoolQueries.cs` يحتوي استعلامات للفروع العامة، تفاصيل الفرع، حجوزات المستخدم/المؤسسة، تفاصيل الحجز، التقييمات، الدعم والاشتراك.

```csharp
var booking = await db.Bookings
    .AsNoTracking()
    .Include(b => b.Branch)
        .ThenInclude(branch => branch.Organization)
    .Include(b => b.Service)
    .Include(b => b.JourneyHistory)
    .SingleOrDefaultAsync(b => b.Id == bookingId, cancellationToken);
```

هذا مثال للعلاقات فقط. استخدم الطرق المقيدة بالصلاحيات في WusoolQueries في endpoints الحقيقية؛ لا تنسخ المثال المجرد كـendpoint عامًا.

- Include للعلاقة المباشرة وThenInclude للعلاقة الأعمق.
- AsNoTracking لقراءة البيانات فقط.
- AsSplitQuery لبعض التفاصيل ذات عدة collections لتقليل تضاعف الصفوف؛ يظل Eager Loading.
- لا يوجد Lazy Loading ولا AutoInclude شامل.
- لا تعمل Include لكل جداول المشروع. قوائم الصفحات تستخدم pagination وترتيبًا ثابتًا.
- النتائج الداخلية Entity graphs وليست DTOs جاهزة للإرسال: **لا تسلسل ApplicationUser مباشرة** لأنها تحتوي حقول Identity الحساسة. اعمل mapping إلى DTOs في العقد الأصلي.
- أي بيانات تفصيلية كبيرة، مثل رسائل الدعم، تحتاج pagination خاصًا؛ المثال يحدّ أحدث مجموعة تحميل إلى 100 رسالة حسب ترتيبه، وليس محادثة كاملة بلا حد.

## الحظر

`dbo.BlockAccount` يتطلب admin نشطًا وreason وexpectedRevision، يمنع حظر admin، ويحدّث SecurityStamp ويلغي DeviceSessions وAccessChallenges ويسجل AuditEvent.

المنع الفعلي من تسجيل الدخول يعتمد على الـBackend:
1. تحقّق من كلمة المرور باستخدام Identity/UserManager، لا SQL ولا hashes الفرونت.
2. افحص AccountAccess.CanSignInAsync قبل إنشاء session/cookie، وأعد ACCOUNT_BLOCKED عند الحظر.
3. افحص حالة الحساب والجلسة مع كل طلب محمي، وليس عند login فقط؛ الجلسة القديمة يجب أن تُرفض فورًا.
4. استخرج actorId من هوية السيرفر الموثوقة فقط. لا تثق بـuserId أوorganizationId القادم في body.
5. حافظ على السماح للحساب المؤسسي pending بالوصول لصفحة حالة التسجيل، مع منع عملياته غير المصرح بها؛ هذا مطابق للفرونت الحالي.

الـprocedure والـguards إضافات بيانات جاهزة للدمج؛ لا توجد صفحة login/backend متصل ومختبر end-to-end داخل هذه الحزمة.

## ما يلزم حتى يمشي الموقع بقاعدة حقيقية

نفّذ endpoints الموجودة في `reference/openapi.json`، وراجع `docs/ENDPOINT_MAP.md` و`docs/BACKEND_RULES.md`.

لا تغيّر `assets/api-config.js` إلى api الآن. بعد تنفيذ واختبار endpoints، اضبط mode إلى api وbaseUrl إلى /api. فعّل ticketServicesApiEnabled فقط بعد GET/PUT خدمات الفروع. عطّل demoSubscription/demoBranchAnalysis/demoBranchPublication في نشر الإنتاج.

لم يتم تحويل بيانات localStorage الحالية تلقائيًا. لا توجد بيانات حساباتك الحقيقية داخل ZIP؛ إذا أردت نقلها، يلزم export من المتصفح ثم import تحقق من IDs والملكية والمرفقات، مع إعادة تعيين كلمات المرور.

## حدود التحقق هنا

تم توليد SQL وC# من نفس manifest وفحص تطابق الأعمدة والمفاتيح والعلاقات والتغطية لـ340 حقلًا من 14 DTO، وفحص syntax لـ49 ملف C# و50 جملة CREATE TABLE. هذه الفحوص ليست compile أو تنفيذًا على SQL Server. **لم يتوفر SQL Server أو .NET SDK في بيئة الإنشاء، لذا لم يتم تنفيذ SQL أو compile أو اختبار EF translation هنا.** شغّل خطوات restore/build/verify أعلاه قبل الاعتماد النهائي. لا يوجد ادعاء «صفر أخطاء» أو أن الحزمة جعلت الفرونت Backend حقيقيًا تلقائيًا.

المراجع الرسمية: Microsoft Learn — EF Core Eager Loading، Single vs Split Queries، ASP.NET Core Identity. الروابط في SOURCES.md.
