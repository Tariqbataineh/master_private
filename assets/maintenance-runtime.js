"use strict";

WusoolUI.enqueue(async () => {
  await (async () => {
    let settings = {};
    try {
      settings = JSON.parse((await WusoolServices.rawRead("wusoolMaintenanceSettings")) || "{}");
    } catch (error) {
      if (WusoolServices.mode === "api") throw error;
      settings = {};
    }
    const path = window.location.pathname.replace(/\\/g, "/");
    const portal = path.includes("/user/html/") ? "user" : path.includes("/org/html/") ? "organization" : path.includes("/visitor/html/") ? "visitor" : "admin";
    if (portal !== "admin" && settings[portal]?.enabled) {
      WusoolUI.ready(() => {
        WusoolUI.html(document.body, `
                <main class="min-vh-100 d-flex align-items-center justify-content-center p-4">
                    <section class="text-center" style="max-width: 620px;">
                        <div style="font-size: 4rem;">🛠️</div>
                        <h1>Wusool is under maintenance</h1>
                        <p>
                            ${settings[portal].message || "This portal is temporarily unavailable."}
                        </p>
                    </section>
                </main>
            `);
      });
    }
  })();
});
