import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-lg font-bold text-primary">Kurdistan AI</span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              یەکەمین و گەورەترین گۆڤاری ژیریی دەستکرد بە زمانی کوردی سۆرانی.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">بەستەرەکان</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-primary transition-colors">بابەتەکان</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">دەربارەی ئێمە</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">کۆمەڵگا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">دەربارەی ئێمە</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">پرۆفایل</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">چوونەژوورەوە</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">سۆشیال میدیا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://t.me/zheer_saz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">تێلیگرامی ژیر ساز</a></li>
              <li><a href="https://t.me/KurdistanAI01" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">تێلیگرامی Kurdistan AI</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kurdistan AI. هەموو مافەکان پارێزراون.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
