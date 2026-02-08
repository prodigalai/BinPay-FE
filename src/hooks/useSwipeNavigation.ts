import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const allRoutes = [
  { path: "/dashboard", roles: undefined },
  { path: "/players", roles: undefined },
  { path: "/deposits", roles: ["admin", "manager"] },
  { path: "/staff", roles: ["admin"] },
  { path: "/disputes", roles: undefined },
];

interface UseSwipeNavigationOptions {
  threshold?: number;
  enabled?: boolean;
}

// Haptic feedback utility
function triggerHapticFeedback(type: "light" | "medium" | "heavy" = "medium") {
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 25,
      heavy: 50,
    };
    navigator.vibrate(patterns[type]);
  }
}

export function useSwipeNavigation({ threshold = 80, enabled = true }: UseSwipeNavigationOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const getAvailableRoutes = useCallback(() => {
    return allRoutes.filter((route) => {
      if (!route.roles) return true;
      return user?.role && route.roles.includes(user.role);
    });
  }, [user?.role]);

  const handleSwipe = useCallback(() => {
    const availableRoutes = getAvailableRoutes();
    const currentIndex = availableRoutes.findIndex((r) => r.path === location.pathname);
    
    if (currentIndex === -1) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const verticalDistance = Math.abs(touchStartY.current - touchEndX.current);
    const isHorizontalSwipe = Math.abs(swipeDistance) > verticalDistance;

    if (!isHorizontalSwipe) return;

    if (swipeDistance > threshold) {
      // Swipe left - go to next page
      const nextIndex = currentIndex + 1;
      if (nextIndex < availableRoutes.length) {
        triggerHapticFeedback("medium");
        navigate(availableRoutes[nextIndex].path);
      } else {
        // End of navigation - light feedback
        triggerHapticFeedback("light");
      }
    } else if (swipeDistance < -threshold) {
      // Swipe right - go to previous page
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        triggerHapticFeedback("medium");
        navigate(availableRoutes[prevIndex].path);
      } else {
        // Start of navigation - light feedback
        triggerHapticFeedback("light");
      }
    }
  }, [getAvailableRoutes, location.pathname, navigate, threshold]);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX;
      handleSwipe();
    };

    // Only add listeners on mobile
    if (window.innerWidth < 768) {
      document.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleSwipe]);

  return null;
}
