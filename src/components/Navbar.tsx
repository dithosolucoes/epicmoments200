
import { Home, Image, Video, Link2, Camera, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: "/", label: "Página Inicial", icon: Home },
    { path: "/scan", label: "Scanner", icon: Camera },
    { path: "/manage/stamps", label: "Estampas", icon: Image },
    { path: "/manage/videos", label: "Vídeos", icon: Video },
    { path: "/manage/associations", label: "Associações", icon: Link2 },
  ];

  const NavLinks = () => (
    <>
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
            isActive(item.path)
              ? "bg-epic-blue/10 text-epic-blue"
              : "hover:bg-epic-blue/5 text-muted-foreground"
          )}
          onClick={() => setIsOpen(false)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-epic-blue">
            <Home className="h-5 w-5" />
            <span className="text-lg">Epic Moments</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-epic-blue">
                    <Home className="h-5 w-5" />
                    <span>Epic Moments</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
