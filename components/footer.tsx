import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      className="bg-amber-950 text-amber-100 py-2 sm:py-4 border-t border-amber-800"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <motion.h3
            className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Mısır Cafe
          </motion.h3>
          {/* <p className="text-lg sm:text-xl text-amber-200 mb-6">
            Doğanın büyüsü ve kahvenin aromasının buluştuğu özel mekan
          </p> */}
          <div className="flex flex-col sm:flex-col items-center justify-center gap-4 text-sm">
            <div>
              <p>© 2026 Mısır Cafe. Tüm hakları saklıdır.</p>
            </div>
            <p>
              Designed by{" "}
              <motion.a
                href="mailto:enesseval@outlook.com"
                className="text-amber-300 hover:text-amber-200 transition-colors underline decoration-dotted"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                enesseval
              </motion.a>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
