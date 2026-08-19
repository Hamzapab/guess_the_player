import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h1>

        {isLogin ? (
          <SignIn
            appearance={{
              theme: 'simple',
              elements: {
                footerAction: "hidden",
              },
            }}
          />
        ) : (
          <SignUp
            appearance={{
              theme: 'simple',
              elements: {
                footerAction: "hidden",
              },
            }}
          />
        )}

        <div className="text-center mt-4">
          {isLogin ? (
            <p className="text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Auth;