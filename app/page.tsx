"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/utils/supabase/image";
import Footer from "@/components/footer";
import { SpecialMenu } from "@/types/special-menu.type";
import { getSpecialMenus } from "@/utils/supabase/functions/ui.functions";
import { toast } from "sonner";

export default function HomePage() {
  const [specialMenu, setSpecialMenu] = useState<SpecialMenu[]>([]);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const getSpecialMenu = async () => {
      try {
        const result = await getSpecialMenus();
        if (!result) {
          toast.error("Menü alınamadı");
          return;
        }
        setSpecialMenu(result);
      } catch (error) {
        toast.error("Menü alınamadı");
      }
    };
    getSpecialMenu();
  }, []);

  // Sonsuz kaydırma efekti (sadece dragging değilken çalışır)
  useAnimationFrame((t, delta) => {
    if (!isDragging) {
      const moveBy = (delta / 1000) * 60; // hız (px/sn)
      let currentX = x.get() - moveBy;

      // içerik genişliği kadar resetle (sonsuz loop efekti)
      if (currentX <= -specialMenu.length * 280) {
        currentX = 0;
      }

      x.set(currentX);
    }
  });

  return (
    <div className="min-h-screen bg-white/50">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[100vh] flex items-center justify-center px-4 overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/yeni.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <motion.div className="relative z-10 text-center text-white max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 font-serif leading-tight">
            Mısır Cafe
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 leading-relaxed px-4">
            Piramidin gölgesinde müzik ve nargilenin büyülü dansı, kahvenin
            sıcaklığında buluşan ruhlar
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 sm:px-8 py-3"
            >
              <Link href="/menu">Menümüzü İnceleyin</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white px-6 sm:px-8 py-3 bg-transparent"
            >
              <Link href="/live-music">Canlı Müzik</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-4 sm:px-6 py-3 bg-white/5 backdrop-blur-sm flex items-center gap-2 transition-all duration-300"
            >
              <Link
                href="https://www.instagram.com/misircafe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Menü */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-800 mb-3 sm:mb-4 font-serif">
              Özel Menümüz
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Özenle seçilmiş kahve çekirdekleri ve ev yapımı lezzetlerimizle
              unutulmaz bir deneyim yaşayın
            </p>
          </div>

          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-8 cursor-grab active:cursor-grabbing"
              style={{ x }}
              drag="x"
              dragConstraints={{ left: -1000, right: 0 }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            >
              {[...specialMenu, ...specialMenu].map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex-shrink-0 border-amber-200 border-2 rounded-2xl"
                >
                  <div className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-0 shadow-lg rounded-t-2xl overflow-hidden w-64 h-64">
                    <Image
                      alt={item.name}
                      src={getOptimizedImageUrl(item.image_url, 256)}
                      width={256}
                      height={256}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4 w-fit max-w-[256px] flex flex-col gap-2">
                    {/* İsim + Fiyat */}
                    <div className="flex justify-between items-center">
                      <p className="text-amber-900 font-semibold max-w-8/12 leading-snug">
                        {item.name}
                      </p>
                      <span className="text-amber-700 font-bold text-lg shrink-0">
                        {item.price}₺
                      </span>
                    </div>

                    {/* Açıklama */}
                    {item.description && (
                      <p className="text-gray-600 text-sm leading-snug line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <motion.section
        id="contact"
        className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#f5e6c8] to-[#eadbc2] text-black"
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-6">
            Bize Ulaşın
          </h2>
          <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl mt-16">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d765.024779456248!2d32.85413657590099!3d39.91679802222887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34faa24408aa7%3A0xe6db11dd6d3b6fc5!2zTcSxc8SxciBDYWZl!5e0!3m2!1str!2str!4v1755368607626!5m2!1str!2str"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mısır Cafe Konum"
            />
          </div>
          <motion.div
            className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <MapPin className="min-w-5 min-h-5" />
              <span className="text-black">
                Meşrutiyet, Karanfil Sk. No:34/A, 06420 Çankaya/Ankara
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="text-black">+90 506 021 84 18</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              <span className="text-black">misircafe2002@gmail.com</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-black">08:00 - 24:00</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
