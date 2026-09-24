
"use strict";

window.WusoolFeatureStore = (() => {
    const prefix = "wusoolAdminFeature:";

    const read = (name, fallback) => {
        try {
            return JSON.parse(
                localStorage.getItem(prefix + name) ||
                JSON.stringify(fallback)
            );
        } catch {
            return fallback;
        }
    };

    const write = (name, value) => {
        localStorage.setItem(
            prefix + name,
            JSON.stringify(value)
        );

        return value;
    };

    const remove = (name) => {
        localStorage.removeItem(prefix + name);
    };

    const id = (prefixName = "item") =>
        `${prefixName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return {
        read,
        write,
        remove,
        id
    };
})();
