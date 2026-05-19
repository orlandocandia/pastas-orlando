'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Loader2, LogOut, LayoutDashboard, Package, MessageSquare, BarChart3, Users, UserCircle, Leaf, PackageOpen, UtensilsCrossed, FolderTree, Tag, Ruler, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Productos',
    href: '/admin/productos',
    icon: Package,
  },
]

const stockItems = [
  {
    title: 'Materias Primas',
    href: '/admin/materias-primas',
    icon: Leaf,
  },
  {
    title: 'Insumos',
    href: '/admin/insumos',
    icon: PackageOpen,
  },
  {
    title: 'Productos Terminados',
    href: '/admin/productos-terminados',
    icon: UtensilsCrossed,
  },
]

const configItems = [
  {
    title: 'Categorías',
    href: '/admin/categorias',
    icon: FolderTree,
  },
  {
    title: 'Marcas',
    href: '/admin/marcas',
    icon: Tag,
  },
  {
    title: 'Unidades de Medida',
    href: '/admin/unidades-medida',
    icon: Ruler,
  },
]

const otherItems = [
  {
    title: 'Personas',
    href: '/admin/personas',
    icon: UserCircle,
  },
  {
    title: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    title: 'Opiniones',
    href: '/admin/opiniones',
    icon: MessageSquare,
  },
  {
    title: 'Estadísticas',
    href: '/admin/estadisticas',
    icon: BarChart3,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [stockOpen, setStockOpen] = useState(true)
  const [configOpen, setConfigOpen] = useState(false)

  const isStockActive = stockItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isConfigActive = configItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-crema">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-mostaza mx-auto" />
          <p className="mt-2 text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="p-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg bg-mostaza/20 flex items-center justify-center p-1 shrink-0">
              <Image
                src="/images/logo.png"
                alt="Pastas Orlando"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-sidebar-foreground truncate">
                Pastas Orlando
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Administración
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Stock & Producción */}
          <SidebarGroup>
            <SidebarGroupContent>
              <button
                onClick={() => setStockOpen(!stockOpen)}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider hover:text-sidebar-foreground"
              >
                <Package className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">Stock & Producción</span>
                {stockOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              {stockOpen && (
                <SidebarMenu>
                  {stockItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Configuración */}
          <SidebarGroup>
            <SidebarGroupContent>
              <button
                onClick={() => setConfigOpen(!configOpen)}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider hover:text-sidebar-foreground ${isConfigActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/60'}`}
              >
                <FolderTree className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">Configuración</span>
                {configOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              {configOpen && (
                <SidebarMenu>
                  {configItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Other items */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {otherItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {session.user?.name}
                </span>
                <span className="text-xs text-sidebar-foreground/60 truncate">
                  {session.user?.email}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground hidden sm:block">
            {session.user?.name}
          </span>
        </header>
        <div className="flex-1 p-4 md:p-6 bg-crema overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
