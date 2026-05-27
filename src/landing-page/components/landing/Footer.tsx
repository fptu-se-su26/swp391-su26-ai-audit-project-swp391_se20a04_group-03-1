import { Icon } from "./Icon";

/**
 * Footer — 4-column layout with brand info, products, legal links,
 * headquarters details, and system status indicator.
 */

const productLinks = ["Features", "Pricing", "Support", "Careers"];
const legalLinks = ["Terms", "Privacy Policy", "Contact"];

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-[64px] md:py-[120px] relative overflow-hidden border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-[24px] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 reveal">
          {/* Brand Column */}
          <div className="space-y-6">
            <a
              className="font-display-lg text-[20px] font-extrabold tracking-tight text-white flex items-center gap-2 group"
              href="#"
            >
              <Icon
                name="change_history"
                className="text-primary text-xl group-hover:rotate-180 transition-transform duration-500"
              />
              <span className="text-gradient font-bold">LogiPort</span>
            </a>
            <p className="font-body-md text-sm text-slate-400 font-light leading-relaxed">
              Elevate port transport management with comprehensive AI and
              advanced automation.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg glass-heavy flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer magnetic">
                <Icon name="share" className="text-sm" />
              </div>
              <div className="w-10 h-10 rounded-lg glass-heavy flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer magnetic">
                <Icon name="mail" className="text-sm" />
              </div>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-6">
            <h5 className="font-headline-md text-[10px] text-primary uppercase tracking-widest font-bold">
              Products
            </h5>
            <ul className="space-y-4">
              {productLinks.map((item) => (
                <li key={item}>
                  <a
                    className="font-body-md text-sm text-slate-400 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group inline-flex"
                    href="#"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h5 className="font-headline-md text-[10px] text-primary uppercase tracking-widest font-bold">
              Legal
            </h5>
            <ul className="space-y-4">
              {legalLinks.map((item) => (
                <li key={item}>
                  <a
                    className="font-body-md text-sm text-slate-400 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group inline-flex"
                    href="#"
                  >
                    <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters Column */}
          <div className="space-y-6">
            <h5 className="font-headline-md text-[10px] text-primary uppercase tracking-widest font-bold">
              Headquarters
            </h5>
            <p className="font-body-md text-sm text-slate-400 font-light leading-relaxed">
              12th Floor, Innovation Tower,
              <br />
              High-Tech Park, District 9,
              <br />
              Ho Chi Minh City.
            </p>
            <div className="mt-4 p-3 glass-heavy rounded-lg border-primary/20 inline-block hover:border-primary transition-colors cursor-pointer group">
              <p className="font-headline-md text-[10px] text-primary tracking-widest uppercase mb-1 font-bold">
                SYS.HOTLINE
              </p>
              <p className="font-display-lg text-lg text-white font-bold group-hover:text-primary transition-colors">
                1900 6868
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 text-center reveal flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-headline-md text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            © 2024 LogiPort Solutions.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-headline-md text-green-400 uppercase tracking-widest bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20 font-bold">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
