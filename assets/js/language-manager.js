'use strict';
window.WusoolLanguage = { get current(){return window.WusoolPreferences?.language||'en';}, load(lang){return window.WusoolPreferences?.setLanguage(lang);}, init(){window.WusoolPreferences?.refresh();} };
