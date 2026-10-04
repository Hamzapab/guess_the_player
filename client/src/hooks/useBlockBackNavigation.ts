import { useEffect, useRef } from "react";

export const useBlockBackNavigation = (onBackAttempt: () => void) => {
  const callbackRef = useRef(onBackAttempt);

  

  useEffect(() => {
    callbackRef.current = onBackAttempt;
  }, [onBackAttempt]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      callbackRef.current(); 
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};