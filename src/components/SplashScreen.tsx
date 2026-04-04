import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "kai_splash_seen";

const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  const [show, setShow] = useState(() => {
    return !sessionStorage.getItem(SESSION_KEY);
  });

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem(SESSION_KEY, "1");
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Logo mark */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative"
              >
                <div className="h-20 w-20 rounded-2xl bg-background flex items-center justify-center shadow-2xl">
                  <span className="text-3xl font-black text-foreground tracking-tighter">K</span>
                </div>
                {/* Subtle glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-background/30"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                className="text-center"
              >
                <h1 className="text-2xl font-bold text-background tracking-tight">
                  Kurdistan AI
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="mt-2 text-xs text-background/60 font-medium"
                >
                  یەکەمین گۆڤاری ژیریی دەستکرد بە کوردی
                </motion.p>
              </motion.div>

              {/* Loading bar */}
              <motion.div
                className="w-32 h-[2px] bg-background/10 rounded-full overflow-hidden mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="h-full bg-background/50 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, delay: 0.7, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default SplashScreen;
