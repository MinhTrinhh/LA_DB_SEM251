import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, LogOut, User, Building2, Ticket, ChevronDown } from "lucide-react";

const Header = () => {
  const { isAuthenticated, authData, logout } = useAuth();

  // Check if user has organizer role
  const isOrganizer = authData?.roles?.some(role => role === 'ROLE_ORGANIZER');

  return (
    <header className="sticky top-0 z-50 glass glass-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              EVENT<span className="text-primary">EASE</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Events
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/my-tickets" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                  My Tickets
                </Link>
                {isOrganizer ? (
                  <Link to="/organizer" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                    Organize
                  </Link>
                ) : (
                  <Link to="/organizer/profile" className="text-foreground/80 hover:text-cta transition-colors font-medium flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Become Organizer
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{authData?.email}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/participant/profile" className="cursor-pointer flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Participant Profile
                      </Link>
                    </DropdownMenuItem>
                    {isOrganizer ? (
                      <DropdownMenuItem asChild>
                        <Link to="/organizer/profile" className="cursor-pointer flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          Organizer Profile
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link to="/organizer/profile" className="cursor-pointer flex items-center text-cta">
                          <Building2 className="w-4 h-4 mr-2" />
                          Become Organizer
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/my-tickets" className="cursor-pointer flex items-center">
                        <Ticket className="w-4 h-4 mr-2" />
                        My Tickets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="cta" size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
