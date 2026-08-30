import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import LanguageDropdown from "../components/LanguageToggle";
import logo from "../assets/logo.png";
import lovedbyfan from "../assets/lovedbyfan.png";
import { useTranslation } from 'react-i18next';

// Header
const Header = () => {
  const { t } = useTranslation();

  return (
    <div className=" bg-[#101622]  text-white">
      <div className="container flex justify-between mx-auto py-2">
        <div className="flex  items-center gap-2">
          <img src={logo} alt="logo" />
          <h1>{t("header.title")}</h1>
        </div>
        <div className="flex  items-center gap-4 text-xs ">
          <LanguageDropdown/>
          <p>{t("header.leaderboard")}</p>
          <button className="bg-blue-500 py-1 px-4 rounded-md text-xs cursor-pointer">
            {t("header.guest")}
          </button>
        </div>
      </div>
    </div>
  )
}

const HeroPage = () => {
  const { t } = useTranslation();

  return (
    <div className=" min-w-0 text-center mt-20 md:flex-1 md:mt-0 md:ps-4 md:text-start">
      <div>
        <h2 className="text-5xl font-bold text-white mb-5">
          <span>{t("hero.testYour")}</span> <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#135BEC] to-[#22D3EE]">
            {t("hero.footballIQ")}
          </span>
        </h2>
        <p className="text-[#92A4C9] mb-5 font-light">
          {t("hero.description")}
        </p>
        <img className="w-80 mx-auto md:mx-0" src={lovedbyfan} alt="loved by fan" />
      </div>
    </div>
  )
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { t } = useTranslation();

  return (
    <div id="hero" className="flex flex-col  h-dvh  bg-top">
      <Header />
      <div className="container flex-1  flex flex-col gap-6 items-center md:justify-around md:flex-row md:gap-8  mx-auto">
        <HeroPage />
        <div className="flex-1  min-w-0 rounded">
          <div className="rounded-lg shadow-md p-6 py-8 max-w-100 mx-auto text-white bg-[#192233]">
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
                  {t("auth.noAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:underline"
                  >
                    {t("auth.signUp")}
                  </button>
                </p>
              ) : (
                <p className="text-sm">
                  {t("auth.haveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:underline"
                  >
                    {t("auth.signIn")}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
