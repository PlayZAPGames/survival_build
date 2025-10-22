import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { LoginPopup } from "../src/screens/LoginPopup/LoginPopup";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode
const apiUrl = import.meta.env.VITE_API_URL;

function HomeRedirect() {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    console.log("token:", token);
    

    const handleTelegramLogin = async (decoded:any) => {
      try {
        // 1. Call guest login API
        const resp = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loginType: "telegram",
            socialId: String(decoded.data.tg_Id), // from token
          }),
        });

        if (!resp.ok) throw new Error("Guest login failed");
        const data = await resp.json();

        // 2. Save returned JWT
        const authToken = `${data.data.tokenType} ${data.data.token}`;
        localStorage.setItem("authToken", authToken);

        // 3. Update profile with username + image
        await fetch(`${apiUrl}/user`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authentication: `${authToken}`,
          },
          body: JSON.stringify({
            username: decoded.data.user_name || "Guest",
          }),
        }).catch(console.error);

      } catch (err) {
        console.error("Guest login error:", err);
      }
    };

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token:", decoded);

        handleTelegramLogin(decoded);

        // Clean URL
        searchParams.delete("token");
        const newUrl = searchParams.toString()
          ? `${window.location.pathname}?${searchParams.toString()}`
          : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }

    // Redirect after short delay (allow async calls)
    const timer = setTimeout(() => {
      window.location.href = "/build/bow.html";
    }, 800);

    return () => clearTimeout(timer);
  }, [location.search]);

  return null;
}

function ReferralRedirect() {
  const location = useLocation();
  
  useEffect(() => {
    // Extract referral code from URL
    const searchParams = new URLSearchParams(location.search);
    const referralCode = searchParams.get('referralCode');
    
    if (referralCode) {
      // Store in localStorage
      localStorage.setItem("referralCode", referralCode);
      
      // Clean the URL by removing the referralCode parameter
      searchParams.delete('referralCode');
      const newUrl = searchParams.toString() 
        ? `${window.location.pathname}?${searchParams.toString()}`
        : window.location.pathname;
      
      window.history.replaceState(null, '', newUrl);
    }
    
    // Redirect to main page
    window.location.href = '/build/bow.html';
  }, [location.search]);
  
  return null; // or a loading spinner
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPopup />} />
        <Route path="/referral" element={<ReferralRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;