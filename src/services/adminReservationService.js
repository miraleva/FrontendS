const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8083";

export async function getReservations() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const response = await fetch(
        `${API_BASE_URL}/api/reservations`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            `Rezervasyonlar alınamadı. HTTP kodu: ${response.status}`
        );
    }

    return response.json();
}