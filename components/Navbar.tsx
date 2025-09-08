"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, User, LogOut, Settings, Search, Monitor, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

const navigation = [
  { name: "Home", href: "/" },
  { name: "World", href: "/world" },
  { name: "Politics", href: "/politics" },
  { name: "Business", href: "/business" },
  { name: "Technology", href: "/technology" },
  { name: "Sports", href: "/sports" },
  { name: "Opinion", href: "/opinion" },
  { name: "Culture", href: "/culture" },
]

export function Navbar() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status || "loading"

  const { setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  const handleSignIn = () => {
    signIn()
  }

  const handleSignOut = () => {
    signOut()
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Close menu when a navigation link is clicked
  const handleNavLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-primary">
      <div className="border-b border-border">
        <div className="container max-w-screen-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex flex-col items-center">
                <h1 className="text-xl md:text-4xl font-serif font-bold text-primary">The Daily Herald</h1>
                <p className="text-xs text-muted-foreground mt-1 hidden md:block">{currentDate}</p>
              </Link>
            </div>

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
                    <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Subscribe button */}
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 px-4">
                Subscribe
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
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

              {status === "loading" ? (
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="text-sm">
                          {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user?.name && <p className="font-medium text-sm">{session.user.name}</p>}
                        {session.user?.email && (
                          <p className="w-[180px] truncate text-xs text-muted-foreground">{session.user.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onSelect={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleSignIn} size="sm" variant="outline" className="px-4 bg-transparent">
                  Sign in
                </Button>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(!searchOpen)} className="h-9 w-9 p-0">
                <Search className="h-4 w-4" />
              </Button>
              {session && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback className="text-xs">
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              {/* Custom Mobile Menu Button */}
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
          </div>

          {searchOpen && (
            <div className="md:hidden mt-6">
              <Input placeholder="Search news..." className="w-full" onBlur={() => setSearchOpen(false)} autoFocus />
            </div>
          )}
        </div>
      </div>

      {/* Custom Mobile Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <Link href="/" onClick={handleNavLinkClick} className="flex items-center">
              <h2 className="text-xl font-serif font-bold text-primary">The Daily Herald</h2>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-3 flex flex-col justify-between">
            {/* NAVIGATION LINKS (TOP) */}
            <nav className="flex flex-col space-y-1 mb-6">
              {navigation.map(({ name, href }) => (
                <Link
                  key={name}
                  href={href}
                  onClick={() => {
                    handleNavLinkClick()
                    setIsMenuOpen(false)
                  }}
                  className="block rounded px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                >
                  {name}
                </Link>
              ))}
            </nav>

            {/* THEME BUTTONS (MIDDLE) */}
            <div className="mb-6 border-t border-b border-border py-4 px-3">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Theme</p>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTheme("light")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-start"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTheme("dark")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-start"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTheme("system")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-start"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>

            {/* USER ACTIONS (BOTTOM) */}
            <div>
              {status === "loading" ? (
                <div className="flex items-center space-x-3 mb-6 pb-6 border-t border-border animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex flex-col space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                </div>
              ) : session ? (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      {session.user?.name && <p className="font-medium text-sm">{session.user.name}</p>}
                      {session.user?.email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-muted"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded text-red-600 hover:bg-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    handleSignIn()
                    setIsMenuOpen(false)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
