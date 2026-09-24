
window.WusoolApi = {
    baseUrl: "/api",

    async request(path, options = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    },

    get(path) {
        return this.request(path);
    },

    post(path, data) {
        return this.request(path, {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    put(path, data) {
        return this.request(path, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    },

    delete(path) {
        return this.request(path, {
            method: "DELETE"
        });
    }
};
