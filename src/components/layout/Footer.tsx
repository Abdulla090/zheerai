import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-lg font-bold text-primary">ZHEERAI</span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              کۆمەڵگای زیرەکی دەستکرد لە کوردستان. شوێنێک بۆ پیشاندان، فێربوون، و هاوکاری.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">بەستەرەکان</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/projects" className="hover:text-primary transition-colors">پڕۆژەکان</Link></li>
              <li><Link to="/qa" className="hover:text-primary transition-colors">پرسیار و وەڵام</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">بڵاوکراوەکان</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">کۆمەڵگا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">دەربارەی ئێمە</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">یاسا و مەرجەکان</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">پەیوەندی</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">سۆشیال میدیا</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">تویتەر</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">گیتهەب</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">تێلیگرام</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ZHEERAI. هەموو مافەکان پارێزراون.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
