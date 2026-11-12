import Link from "next/link";
import  {
  FiCpu, FiFacebook, FiInstagram, FiTwitter, FiYoutube,
  FiMail, FiPhone, FiMapPin,
} from "react-icons/fi";

const FOOTER_LINKS = {
  Shop: [
    { label: "Desktops",    href: "/products?category=desktop" },
    { label: "Laptops",     href: "/products?category=laptop" },
    { label: "Components",  href: "/products?category=components" },
    { label: "Peripherals", href: "/products?category=peripherals" },
    { label: "PC Builder",  href: "/pc-builder" },
  ],
  Support: [
    { label: "Track Order",     href: "/track-order" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "FAQs",            href: "/faq" },
    { label: "Contact Us",      href: "/contact" },
  ],
  Company: [
    { label: "About Us",       href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Warranty Policy", href: "/warranty" },
  ],
};


export default function Footer () {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 mt-16">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <FiCpu className="text-white text-xl" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                Tech<span className="gradient-text">Bazaar</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-4 max-w-xs">
              India&apos;s trusted destination for desktops, laptops, components,
              and custom PC builds. Quality tech, honest prices.
            </p>
            <div className="space-y-2 text-sm text-dark-400">
              <div className="flex items-center gap-2">
                <FiMapPin size={14} className="text-primary-400 shrink-0" />
                <span>123 Tech Street, Bengaluru, Karnataka 560001</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone size={14} className="text-primary-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail size={14} className="text-primary-400 shrink-0" />
                <span>support@techbazaar.in</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-dark-400 hover:text-primary-400 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} TechBazaar. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {[FiFacebook, FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-800 text-dark-400 hover:bg-primary-600 hover:text-white transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 text-dark-500 text-xs">
            <span className="badge-ghost">UPI</span>
            <span className="badge-ghost">Cards</span>
            <span className="badge-ghost">COD</span>
            <span className="badge-ghost">Razorpay Secured</span>
          </div>
        </div>
      </div>
    </footer>
  )
}