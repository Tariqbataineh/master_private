WusoolUI.enqueue(async () => {
  function setArabic() {
    WusoolLanguage.load("ar");
  }
  async function setEnglish() {
    await WusoolServices.rawWrite("language", "en");
    location.reload();
  }
});
