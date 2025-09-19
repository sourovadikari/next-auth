"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  User,
  LogOut,
  Settings,
  Search,
  Monitor,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const navigation = [
  { name: "Home", href: "/" },
  { name: "World", href: "/world" },
  { name: "Politics", href: "/politics" },
  { name: "Business", href: "/business" },
  { name: "Technology", href: "/technology" },
  { name: "Sports", href: "/sports" },
  { name: "Opinion", href: "/opinion" },
  { name: "Culture", href: "/culture" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // ✅ Client-safe date (prevents hydration mismatch)
  const [currentDate, setCurrentDate] = React.useState<string>("");

  React.useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const handleSignIn = () => signIn();
  const handleSignOut = () => signOut();

  // ✅ Close menu when a link is clicked
  const handleNavLinkClick = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-primary">
      <div className="border-b border-border">
        <div className="container max-w-screen-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + Date */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex flex-col items-center">
                <h1 className="text-xl md:text-4xl font-serif font-bold text-primary">
                  The Daily Herald
                </h1>
                {currentDate && (
                  <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                    {currentDate}
                  </p>
                )}
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Search */}
              <div className="relative">
                {searchOpen ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search news..."
                      className="w-64"
                      autoFocus
                      onBlur={() => setSearchOpen(false)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Subscribe */}
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 px-4"
              >
                Subscribe
              </Button>

              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 px-0 relative"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Auth */}
              {status === "loading" ? (
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback className="text-sm">
                          {session.user?.name?.charAt(0) ||
                            session.user?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center gap-2 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) ||
                            session.user?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        {session.user?.name && (
                          <p className="font-medium text-sm">
                            {session.user.name}
                          </p>
                        )}
                        {session.user?.email && (
                          <p className="text-xs text-muted-foreground truncate w-[180px]">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onSelect={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleSignIn}
                  size="sm"
                  variant="outline"
                  className="px-4"
                >
                  Sign in
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-9 w-9 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
              {session && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image || ""}
                    alt={session.user?.name || ""}
                  />
                  <AvatarFallback className="text-xs">
                    {session.user?.name?.charAt(0) ||
                      session.user?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-9 w-9 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="md:hidden mt-6">
              <Input
                placeholder="Search news..."
                className="w-full"
                onBlur={() => setSearchOpen(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative z-50 w-64 bg-background h-full shadow-lg p-6 space-y-4">
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <nav className="flex flex-col space-y-3">
              {navigation.map(({ name, href }) => (
                <Link
                  key={name}
                  href={href}
                  onClick={handleNavLinkClick} // ✅ now used
                  className="text-base font-medium text-primary hover:text-primary/80"
                >
                  {name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}