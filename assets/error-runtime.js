
"use strict";

(() => {
    const KEY = "wusoolRuntimeErrors";

    const read = () => {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch {
            return [];
        }
    };

    const push = (entry) => {
        const items = read();

        items.unshift({
            id: `error-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date().toISOString(),
            ...entry
        });

        localStorage.setItem(
            KEY,
            JSON.stringify(items.slice(0, 100))
        );
    };

    window.addEventListener("error", (event) => {
        push({
            type: "JavaScript",
            message: event.message || "Unknown error",
            source: event.filename || window.location.pathname,
            line: event.lineno || 0
        });
    });

    window.addEventListener("unhandledrejection", (event) => {
        push({
            type: "Promise",
            message: String(event.reason || "Unhandled promise rejection"),
            source: window.location.pathname,
            line: 0
        });
    });

    window.WusoolErrorRuntime = {
        KEY,
        read,
        push
    };
})();
