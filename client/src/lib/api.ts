import axios from "axios";

// ============================================
// AXIOS INSTANCE — API Communication Layer
// ============================================
// Ek configured axios instance banate hain jo:
// 1. Base URL set karta hai (har request mein manually nahi likhna padta)
// 2. Har request mein JWT token automatically attach karta hai
// 3. Token expire hone pe automatically refresh karta hai

// Backend ka URL — environment variable se aata hai
// NEXT_PUBLIC_ prefix zaroori hai Next.js mein — iske bina client-side pe accessible nahi hoga
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Axios instance create karo with default config
const api = axios.create({
  baseURL: API_URL,                            // Sab requests is URL se shuru hongi
  headers: { "Content-Type": "application/json" }, // Default: JSON data bhej rahe hain
});

// ============================================
// REQUEST INTERCEPTOR — Har outgoing request pe chalta hai
// ============================================
// Kaam: localStorage se access token uthao aur request header mein daalo
// Yeh "Authorization: Bearer <token>" header add karta hai
//
// Kyun? Backend ka JwtAuthGuard har protected route pe token check karta hai
// Agar header mein token na ho → 401 Unauthorized
api.interceptors.request.use(
  (config) => {
    // localStorage se token uthao
    // localStorage = browser ki permanent storage (tab band hone pe bhi rehta hai)
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Authorization header mein Bearer token set karo
      // "Bearer" = token type (JWT standard hai)
      // Backend ka jwt.strategy.ts ExtractJwt.fromAuthHeaderAsBearerToken() se isko read karta hai
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Modified config return karo — ab request jayegi with token
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR — Har incoming response pe chalta hai
// ============================================
// Kaam: Agar 401 error aaye (token expired) toh:
// 1. Refresh token use karke naya access token lo
// 2. Failed request ko naye token ke saath dobara bhejo
// 3. User ko pata bhi nahi chalta ke token expire hua tha!
//
// Yeh "silent refresh" pattern hai — Slack/Discord yahi use karte hain
// Isliye tum days tak login rahte ho bina dobara password daale
api.interceptors.response.use(
  (response) => response, // Success? As-is return karo

  async (error) => {
    const originalRequest = error.config;

    // Check karo:
    // 1. Kya error 401 hai? (Unauthorized = token expired ya invalid)
    // 2. Kya yeh request pehle retry nahi hui? (_retry flag se track karte hain)
    //    Bina is check ke infinite loop ban sakta hai:
    //    401 → refresh → 401 → refresh → 401... (agar refresh token bhi expired ho)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark karo ke yeh retry hai

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Refresh token nahi hai → user ko login page pe bhejo
          throw new Error("No refresh token");
        }

        // Backend se naya access token maango
        // Direct axios use karte hain (api instance nahi) — warna interceptor loop mein fas jayega
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Naya token save karo
        localStorage.setItem("accessToken", data.accessToken);

        // Original request ko naye token ke saath dobara bhejo
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh bhi fail? → Sab tokens hata do, login page pe bhejo
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Redirect to login (agar already login page pe nahi hain)
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
