"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiPackage,
  FiLogOut,
  FiSettings,
  FiCpu,
} from "react-icons/fi";
import { cn, getInitials } from "../../lib/utils";
import { userCartCount } from "@/hooks/userCartCount";

const NAV_LINKS = [
  { label: "Desktops", href: "/products?category=desktop" },
  { label: "Laptops", href: "/products?category=laptop" },
  { label: "Components", href: "/products?category=components" },
  { label: "Peripherals", href: "/products?category=peripherals" },
  { label: "PC Builder", href: "/pc-builder", highlight: true },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: session } = useSession();
  const cartCount = userCartCount();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-dark-950/90 backdrop-blur-lg border-b border-dark-800 shadow-lg"
          : "bg-dark-950/60 backdrop-blur-md border-b border-transparent",
      )}
    >
      {/* Top strip */}
      <div className="hidden md:block bg-primary-950/50 border-b border-dark-800/50">
        <div className="container-custom flex items-center justify-between py-1.5 text-xs text-dark-400">
          <p>
            🚚 Free shipping on orders above ₹5,000 | 💳 UPI / Cards / COD
            Available
          </p>
          <div className="flex gap-4">
            <Link
              href={"/track-order"}
              className="hover:text-primary-400 transition"
            >
              Track Order
            </Link>
            <Link href="/help" className="hover:text-primary-400 transition">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <FiCpu className="text-white text-xl" />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
              Tech<span className="gradient-text">Bazaar</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  link.highlight
                    ? "text-accent-400 hover:bg-accent-500/10"
                    : "text-dark-300 hover:text-white hover:bg-dark-800",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for laptops, GPUs, keyboards..."
              className="w-full px-4 py-2.5 pr-10 bg-dark-800/80 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-primary-400"
            >
              <FiSearch size={18} />
            </button>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800"
            >
              <FiSearch size={20} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800 transition"
            >
              <FiShoppingCart size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-accent-500 text-white text-[10px] font-bold rounded-full"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 pl-2 rounded-lg hover:bg-dark-800 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(session.user.name || "U")
                    )}
                  </div>
                  <FiChevronDown
                    className="hidden md:block text-dark-400"
                    size={14}
                  />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 card z-50 py-2 origin-top-right"
                      >
                        <div className="px-4 py-2 border-b border-dark-700/50">
                          <p className="text-sm font-semibold text-white truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:bg-dark-700/50 hover:text-white transition"
                        >
                          <FiUser size={16} /> My Dashboard
                        </Link>
                        <Link
                          href="/dashboard/orders"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:bg-dark-700/50 hover:text-white transition"
                        >
                          <FiPackage size={16} /> My Orders
                        </Link>
                        {session.user.role === "admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:bg-dark-700/50 hover:text-white transition"
                          >
                            <FiSettings size={16} /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                        >
                          <FiLogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary py-2! px-4! text-sm hidden md:inline-flex"
              >
                Sign In
              </Link>
            )}
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-dark-300 hover:text-white rounded-lg hover:bg-dark-800"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSearch}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-3">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-dark-900 border-t border-dark-800"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium",
                    link.highlight ? "text-accent-400" : "text-dark-300",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!session && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-2 justify-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
