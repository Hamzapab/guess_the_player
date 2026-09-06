import { useUser  , useAuth , useClerk} from "@clerk/clerk-react";
import { useState, useRef, useEffect } from "react";
import { User, LogOut , Settings } from "lucide-react";
import LanguageDropdown from "../components/LanguageToggle";
import logo from "../assets/logo.png";
import { useTranslation } from 'react-i18next';


const UserProfile = () => {
  const { user } = useUser();
  const {t} = useTranslation();
  const { i18n } = useTranslation();
  const { signOut } = useAuth();
  const { openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dropSide = i18n.language === 'en' || i18n.language === 'fr'  ? 'right-0' : 'left-0'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    openUserProfile();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full overflow-hidden bg-[#192233] flex items-center justify-center shrink-0 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? "User avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-[#92A4C9]" />
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${dropSide}  mt-2 w-48 rounded-md bg-[#192233] shadow-lg py-1 z-50 border border-white/10`}>
          <p className="px-4 py-2 text-sm text-white truncate">
            {user?.fullName ?? user?.username ?? "User"}
          </p>
          <div className="border-t border-white/10" />
          <button
            type="button"
            onClick={handleOpenProfile}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#92A4C9] hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            {t("auth.profile")}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#92A4C9] hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t("auth.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

// Header
export const Header = () => {
  const { t } = useTranslation();
   const { isSignedIn } = useUser();

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
          {isSignedIn && <UserProfile />}
        </div>
      </div>
    </div>
  )
}