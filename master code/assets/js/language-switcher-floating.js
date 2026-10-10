WusoolUI.enqueue(async () => {
  WusoolUI.ready(async () => {
    const box = document.createElement('div');
    box.className = 'language-switcher-floating';
    WusoolUI.html(
      box,
      `
 <select id="languageSelect" aria-label="Language">
 <option value="en">English</option>
 <option value="ar">العربية</option>
 </select>`,
    );
    document.body.appendChild(box);
    const select = document.getElementById('languageSelect');
    select.value = (await WusoolServices.rawRead('language')) || 'en';
    select.onchange = async () => {
      if (window.WusoolLanguage) {
        if (select.value === 'ar') WusoolLanguage.load('ar');
        else {
          await WusoolServices.rawWrite('language', 'en');
          location.reload();
        }
      }
    };
  });
});
