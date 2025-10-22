import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;


export const LoginPopup = (): JSX.Element => {
    const location = useLocation();
    const navigate = useNavigate();
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // Handle referral code from URL or localStorage
        const params = new URLSearchParams(location.search);
        const rawCode = params.get('referralCode');

        if (rawCode?.trim()) {
            localStorage.setItem("referralCode", rawCode);
            setReferralCode(rawCode);
            // Clean URL
            params.delete('referralCode');
            window.history.replaceState(null, '', `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
        } else {
            setReferralCode(localStorage.getItem("referralCode"));
        }

        // Check auth status
        const token = localStorage.getItem("authToken");
        const user = localStorage.getItem("user");

        if (token) setAuthToken(token);
        if (user) {
            try {
                const userData = JSON.parse(user);
                setIsGuest(userData.loginType === 'guest');
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, [location.search]);

    const handleLogin = async (loginType: 'google' | 'apple', user: any) => {
        try {
            const headers = {
                "Content-Type": "application/json",
                ...(authToken ? { "authentication": authToken } : {})
            };

            const body = {
                loginType,
                socialId: user.uid,
                ...(referralCode ? { referralCode } : {}),
            };

            const response = await fetch(`${apiUrl}/login`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // On success
            localStorage.removeItem("referralCode");
            setReferralCode(null);

            // const newToken = data.data.token;
            const newToken = `${data.data.tokenType} ${data.data.token}`;
            localStorage.setItem("authToken", newToken);

            // Fetch updated user data
            const userResponse = await fetch(`${apiUrl}/`, {
                headers: {
                    "authentication": newToken,
                    "Content-Type": "application/json",
                },
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                localStorage.setItem("user", JSON.stringify(userData.data));
            }

            navigate("/"); // Redirect after successful login

        } catch (error) {
            console.error("Login error:", error);
            if (error instanceof Error) {
                alert(error.message || `${loginType} login failed`);
            } else {
                alert(`${loginType} login failed`);
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            if (result?.user) await handleLogin('google', result.user);
        } catch (error) {
            console.error("Google login error:", error);
            alert("Google login failed");
        }
    };

    const handleAppleLogin = async () => {
        try {
            const provider = new OAuthProvider("apple.com");
            provider.addScope("email");
            provider.addScope("name");
            const result = await signInWithPopup(auth, provider);
            if (result?.user) await handleLogin('apple', result.user);
        } catch (error) {
            console.error("Apple login error:", error);
            alert("Apple login failed");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
            style={{
                backgroundImage: "url('/Survival_BG.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',

            }}
        >
            <Card className="flex flex-col w-full max-w-[650px] h-[600px] sm:h-[800px] items-center justify-center gap-4 sm:gap-6 px-4 sm:px-5 py-6 sm:py-8 relative bg-ludo-color-01 rounded-[25px] border-4 border-solid border-indigo-900 mx-4">
                <CardContent className="p-0 flex flex-col items-center w-full gap-5 sm:gap-6 h-full justify-center">
                    <div className="inline-flex items-center flex-col gap-2 sm:gap-3 mt-0 sm:mt-2">
                        <img className="w-44 sm:w-64 h-auto object-contain" alt="Bows Logo" src="/survival_icon.png" />
                    </div>

                    {referralCode && (
                        <div className="text-sm sm:text-base font-semibold text-center text-white bg-indigo-800 px-4 py-2 rounded-xl">
                            Referral Code Applied: <span className="text-yellow-400">{referralCode}</span>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-3 sm:gap-4 px-2 sm:px-[30px] py-0 w-full">
                        <h1 className="w-full font-['Poppins',Helvetica] font-medium text-text-v1-1 text-[16px] sm:text-[20px] text-center">
                            Play, Earn, Conquer
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            <img src="/BOWS_Coin.png" alt="Bows coin" className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="font-bold text-[#ffbe47] text-[16px] sm:text-[20px] text-center">
                                Earn $CORE COINS
                            </span>
                        </div>

                        <p className="text-text-v1-1 font-medium text-[16px] sm:text-[20px] text-center mt-1">
                            {isGuest ? "Upgrade your guest account" : "Sign in to continue your Ludo journey"}
                        </p>

                        <div className="flex flex-col gap-2 sm:gap-3 w-full mt-2">
                            <Button
                                onClick={handleGoogleLogin}
                                className="h-[56px] sm:h-[75px] bg-white hover:bg-gray-300 shadow hover:shadow-lg flex items-center justify-center gap-2 rounded-[15px] border border-gray-300"
                            >
                                <img src="/google-logo.png" alt="Google Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-black font-medium text-[18px] sm:text-[24px] text-center">
                                    Continue with Google
                                </span>
                            </Button>

                            {/* <Button
                                onClick={handleAppleLogin}
                                className="h-[56px] sm:h-[75px] bg-black hover:bg-[#1a1a1a] shadow hover:shadow-lg flex items-center justify-center gap-2 rounded-[15px]"
                            >
                                <img src="/apple-logo.png" alt="Apple Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-white font-medium text-[18px] sm:text-[24px] text-center">
                                    Continue with Apple
                                </span>
                            </Button> */}
                        </div>
                        <p className="font-normal text-text-v1-1 text-[12px] sm:text-[16px] text-center mt-1">
                            <span className="font-medium">By continuing, you agree to our </span>
                            <Button variant="link" className="p-0 h-auto font-medium underline text-[12px] sm:text-[16px]">
                                Terms of Service
                            </Button>
                            <span className="font-medium"> and </span>
                            <Button variant="link" className="p-0 h-auto font-medium underline text-[12px] sm:text-[16px]">
                                Privacy Policy
                            </Button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};