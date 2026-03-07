"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from "lucide-react";
import Header from "@/components/header";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/utils/supabase/image";
import Footer from "@/components/footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCategoriesWithItems,
  getMenu,
  getSpecialMenus,
} from "@/utils/supabase/functions/ui.functions";
import { toast } from "sonner";
import { MenuCategory } from "@/types/ui.types";
import { SpecialMenu } from "@/types/special-menu.type";

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("menu");
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [specialMenu, setSpecialMenu] = useState<SpecialMenu[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const result = await getCategoriesWithItems();
        if (!result) {
          toast.error("Menü alınamadı");
          return;
        }
        setMenu(result);
      } catch (error) {
        toast.error("Menü alınamadı");
      }
    };

    const fetchSpecialMenu = async () => {
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

    fetchMenu();
    fetchSpecialMenu();
  }, []);

  console.log(menu);

  if (!menu || menu.length === 0 || !specialMenu || specialMenu.length === 0)
    return null;

  // ✅ Arama
  const searchInCategories = (menus: MenuCategory[]) => {
    if (!searchTerm.trim()) return menus;

    return menus
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  };

  // ✅ Kategori filtreleme
  const filterByCategory = (menus: MenuCategory[]) => {
    if (selectedCategory === "all") return menus;
    return menus.filter((cat) => cat.id === selectedCategory);
  };

  // ✅ Gösterilecek kategoriler
  const displayCategories = filterByCategory(searchInCategories(menu));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 mt-40">
        {/* Başlık */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-800 mb-3 sm:mb-4 font-serif">
            Menümüz
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Özenle hazırlanmış lezzetlerimizi keşfedin
          </p>
        </motion.div>

        {/* Arama */}
        {activeTab === "menu" && (
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Menüde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm border-amber-200 focus:border-amber-400 h-12"
              />
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-auto w-10/12 md:w-5/12 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 shadow-lg">
            <div className="grid grid-cols-2 w-full gap-2 bg-transparent">
              <TabsTrigger
                value="menu"
                className="w-full justify-center cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white hover:bg-amber-200 transition-all duration-300 font-semibold"
              >
                Menü
              </TabsTrigger>
              <TabsTrigger
                value="advantage-menu"
                className="w-full justify-center cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white hover:bg-amber-200 transition-all duration-300 font-semibold"
              >
                Avantajlı Menüler
              </TabsTrigger>
            </div>
          </TabsList>

          {/* AnimatePresence */}
          <div className="relative min-h-[400px] mt-6">
            <AnimatePresence mode="wait">
              {activeTab === "menu" && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Category Buttons */}
                  <div className="px-2 py-5 max-w-11/12 md:max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory("all")}
                      className={`cursor-pointer transition-colors bg-gradient-to-r border ${
                        selectedCategory === "all"
                          ? "from-amber-500 to-orange-500 text-white border-transparent"
                          : "from-amber-100 to-orange-100 border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      TÜM MENÜ
                    </Button>
                    {menu.map((cat) => (
                      <Button
                        variant="outline"
                        size="sm"
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`cursor-pointer transition-colors bg-gradient-to-r border ${
                          selectedCategory === cat.id
                            ? "from-amber-500 to-orange-500 text-white border-transparent"
                            : "from-amber-100 to-orange-100 border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        <p className="text-xs md:text-sm">
                          {cat.title.toLocaleUpperCase("tr-TR")}
                        </p>
                      </Button>
                    ))}
                  </div>

                  {/* Category Sections */}
                  <div className="p-2 max-w-[1200px] mx-auto">
                    {displayCategories.map((category, categoryIndex) => (
                      <motion.div
                        id={category.id}
                        key={category.id}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-12"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: categoryIndex * 0.1,
                        }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                      >
                        {/* Category Header */}
                        <div className="relative h-48 sm:h-64 overflow-hidden">
                          <motion.div
                            className="relative w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Image
                              src={getOptimizedImageUrl(category.image_url, 800)}
                              alt={category.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <motion.div
                            className="absolute bottom-6 left-6 text-white"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                          >
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                              {category.title}
                            </h2>
                            <p className="text-sm sm:text-base opacity-90">
                              {category.description}
                            </p>
                          </motion.div>
                        </div>

                        {/* Items */}
                        <div className="p-6 sm:p-8">
                          <div className="grid gap-3 sm:gap-4">
                            {category.items
                              .filter((item) => item.is_active === true)
                              .map((item, index) => (
                                <motion.div
                                  key={item.id}
                                  className="flex justify-between items-start py-3 border-b border-amber-100 last:border-b-0"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.05,
                                  }}
                                  viewport={{ once: true }}
                                  whileHover={{
                                    x: 5,
                                    backgroundColor: "rgba(251, 191, 36, 0.05)",
                                  }}
                                >
                                  <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-amber-800 text-base sm:text-lg">
                                        {item.name}
                                      </h3>
                                      {item.is_popular && (
                                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 flex items-center">
                                          <Star className="w-3 h-3 mr-1" />
                                          Popüler
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                      {item.description}
                                    </p>
                                  </div>
                                  <motion.div
                                    className="text-right"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <span className="text-xl font-bold text-amber-700">
                                      {item.price
                                        ? `${item.price}₺`
                                        : "Fiyat için sorunuz"}
                                    </span>
                                  </motion.div>
                                </motion.div>
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Avantajlı Menüler */}
              {activeTab === "advantage-menu" && (
                <motion.div
                  key="advantage"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="w-full grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 p-4"
                >
                  {specialMenu
                    .filter((s) => s.is_active === true)
                    .map((menu, index) => (
                      <motion.div
                        className="col-span-1 w-full relative rounded-xl overflow-hidden shadow-xl bg-white border border-amber-200"
                        key={index}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                          transition: { duration: 0.3 },
                          boxShadow:
                            "0 25px 50px -12px rgba(251, 191, 36, 0.25)",
                        }}
                        viewport={{ once: true }}
                      >
                        {/* Resim */}
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.25 }}
                          className="relative overflow-hidden rounded-t-xl bg-white"
                        >
                          <Image
                            src={getOptimizedImageUrl(menu.image_url, 600)}
                            alt={menu.name}
                            width={600}
                            height={800}
                            className="w-full h-56 sm:h-64 object-contain bg-white"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                            priority={index === 0}
                          />
                        </motion.div>

                        {/* İçerik */}
                        <div className="p-4 sm:p-5 bg-white border-t border-amber-200">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-amber-900 font-semibold leading-snug">
                              {menu.name}
                            </p>
                            <span className="text-amber-700 font-bold text-lg shrink-0">
                              {menu.price}₺
                            </span>
                          </div>
                          {/* Açıklama */}
                          <p className="text-gray-600 text-sm break-words">
                            {menu.description || "Açıklama eklenmedi"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
