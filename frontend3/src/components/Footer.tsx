import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const Footer = () => {
  return (
    <footer className="glass glass-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                EVENT<span className="text-primary">EASE</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Discover amazing events and create unforgettable experiences
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-bold mb-4">Discover</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Popular Events
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Organize */}
          <div>
            <h3 className="font-bold mb-4">Organize</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/organize" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/organize" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  My Events
                </Link>
              </li>
              <li>
                <Link to="/organize" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-muted-foreground text-sm">
            © 2025 EventEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
