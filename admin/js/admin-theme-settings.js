"use strict";

WusoolUI.enqueue(async () => {
  if (!(await WusoolUI.guard())) return;
  const STORAGE_KEY = "wusoolPlatformTheme";
  const defaultTheme = {
    primaryColor: "#087f75",
    primaryDarkColor: "#075f59",
    secondaryColor: "#168bea",
    sidebarColor: "#0b2a43",
    backgroundColor: "#f8fbfb",
    textColor: "#0b2545",
    cardRadius: 16,
    buttonRadius: 10
  };
  const readTheme = async () => {
    try {
      return {
        ...defaultTheme,
        ...JSON.parse((await WusoolServices.rawRead(STORAGE_KEY)) || "{}")
      };
    } catch (error) {
      if (WusoolServices.mode === "api") throw error;
      return {
        ...defaultTheme
      };
    }
  };
  const controls = {
    primaryColor: document.getElementById("primaryColor"),
    sidebarColor: document.getElementById("sidebarColor"),
    backgroundColor: document.getElementById("backgroundColor"),
    cardRadius: document.getElementById("cardRadius")
  };
  const radiusValue = document.getElementById("radiusValue");
  const themePreview = document.getElementById("themePreview");
  const loadControls = async () => {
    const theme = await readTheme();
    controls.primaryColor.value = theme.primaryColor;
    controls.sidebarColor.value = theme.sidebarColor;
    controls.backgroundColor.value = theme.backgroundColor;
    controls.cardRadius.value = theme.cardRadius;
    await applyPreview();
  };
  const getThemeFromControls = async () => {
    const previous = await readTheme();
    return {
      ...previous,
      primaryColor: controls.primaryColor.value,
      sidebarColor: controls.sidebarColor.value,
      backgroundColor: controls.backgroundColor.value,
      cardRadius: Number(controls.cardRadius.value)
    };
  };
  const applyPreview = async () => {
    const theme = await getThemeFromControls();
    themePreview?.style.setProperty("--preview-primary", theme.primaryColor);
    themePreview?.style.setProperty("--preview-sidebar", theme.sidebarColor);
    themePreview?.style.setProperty("--preview-bg", theme.backgroundColor);
    themePreview?.style.setProperty("--preview-radius", `${theme.cardRadius}px`);
    if (radiusValue) {
      radiusValue.textContent = theme.cardRadius;
    }
  };
  Object.values(controls).forEach(control => {
    WusoolUI.listen(control, "input", applyPreview);
  });
  WusoolUI.listen(document.getElementById("resetTheme"), "click", async () => {
    controls.primaryColor.value = defaultTheme.primaryColor;
    controls.sidebarColor.value = defaultTheme.sidebarColor;
    controls.backgroundColor.value = defaultTheme.backgroundColor;
    controls.cardRadius.value = defaultTheme.cardRadius;
    await applyPreview();
  });
  WusoolUI.listen(document.getElementById("saveThemeDraft"), "click", async () => {
    await WusoolServices.rawWrite("wusoolThemeDraft", JSON.stringify(await getThemeFromControls()));
    WusoolAdmin?.toast?.("Theme draft saved for this session.");
  });
  WusoolUI.listen(document.getElementById("publishTheme"), "click", async () => {
    const theme = await getThemeFromControls();

    /* Theme Studio publish backup */
    await WusoolVersionService?.createVersion({
      area: "Theme Studio",
      description: "Published global theme changes"
    });
    await WusoolServices.rawWrite(STORAGE_KEY, JSON.stringify(theme));
    WusoolAdmin?.toast?.("Theme published to User, Organization and Visitor pages.");
  });
  await loadControls();
});
