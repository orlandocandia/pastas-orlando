'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Productos', href: '#productos' },
  { label: 'Cómo pedir', href: '#como-pedir' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Opiniones', href: '#opiniones' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Determine active section based on scroll position
      const sections = navLinks.map((link) => link.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-crema/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 sm:h-20">
          {/* Desktop Navigation - centered */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '')
              const isActive = activeSection === sectionId
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative px-4 py-2 rounded-md text-base font-semibold transition-colors duration-200
                    ${isActive ? 'text-mostaza' : scrolled ? 'text-marron' : 'text-white'}
                    hover:text-mostaza
                  `}
                >
                  {link.label}
                  {/* Active underline */}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-mostaza rounded-full transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                  {/* Hover underline - expands from center */}
                  <span className="nav-link-underline absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-mostaza/60 rounded-full w-0 transition-all duration-300" />
                </a>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center justify-end w-full">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-colors ${
                    scrolled
                      ? 'text-marron hover:text-mostaza'
                      : 'text-white hover:text-mostaza'
                  }`}
                  aria-label="Abrir menú"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-crema w-72">
                <SheetTitle className="text-marron font-bold text-xl px-4 pt-2">
                  Menú
                </SheetTitle>
                <div className="flex flex-col gap-1 px-4 mt-4">
                  {navLinks.map((link) => {
                    const sectionId = link.href.replace('#', '')
                    const isActive = activeSection === sectionId
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`px-4 py-3 rounded-md font-semibold transition-colors hover:bg-mostaza/10 hover:text-mostaza
                          ${isActive ? 'text-mostaza bg-mostaza/5' : 'text-marron'}
                        `}
                      >
                        {link.label}
                      </a>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
