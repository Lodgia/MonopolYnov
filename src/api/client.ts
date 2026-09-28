const url = "http://localhost:8000";

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${url}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        let message = errorText;
        try {
            const parsed = JSON.parse(errorText);
            if (parsed && typeof parsed.error === "string") {
                message = parsed.error;
            }
        } catch {}

        throw new Error(message || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}
