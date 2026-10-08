"use strict";

WusoolUI.enqueue(async () => {
  window.WusoolFeatureStore = (() => {
    const prefix = "wusoolAdminFeature:";
    const read = async (name, fallback) => {
      try {
        return JSON.parse((await WusoolServices.rawRead(prefix + name)) || JSON.stringify(fallback));
      } catch (error) {
        if (WusoolServices.mode === "api") throw error;
        return fallback;
      }
    };
    const write = async (name, value) => {
      await WusoolServices.rawWrite(prefix + name, JSON.stringify(value));
      return value;
    };
    const remove = async name => {
      await WusoolServices.rawRemove(prefix + name);
    };
    const id = (prefixName = "item") => `${prefixName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return {
      read,
      write,
      remove,
      id
    };
  })();
});
