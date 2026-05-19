'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Loader2, LogOut, LayoutDashboard, Package, MessageSquare, BarChart3, Users, UserCircle, Leaf, PackageOpen, UtensilsCrossed, FolderTree, Tag, Ruler, ChevronDown, ChevronRight, ShoppingCart, ClipboardList, ArrowLeftRight, Settings, Receipt, CalendarCheck, BookOpen, Factory, Shield, FileBarChart, KeyRound, FileSearch, MonitorSmartphone } from 'lucide-react'
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
  {
    title: 'Recetas',
    href: '/admin/recetas',
    icon: BookOpen,
  },
  {
    title: 'Producción',
    href: '/admin/produccion',
    icon: Factory,
  },
]

const comprasItems = [
  {
    title: 'Compras',
    href: '/admin/compras',
    icon: ShoppingCart,
  },
  {
    title: 'Pedidos a Proveedores',
    href: '/admin/pedidos-proveedores',
    icon: ClipboardList,
  },
]

const ventasItems = [
  {
    title: 'Pedidos de Clientes',
    href: '/admin/pedidos-clientes',
    icon: ClipboardList,
  },
  {
    title: 'Ventas',
    href: '/admin/ventas',
    icon: Receipt,
  },
  {
    title: 'Reservas de Clientes',
    href: '/admin/reservas-clientes',
    icon: CalendarCheck,
  },
]

const stockMovimientoItems = [
  {
    title: 'Movimientos',
    href: '/admin/stock-movements',
    icon: ArrowLeftRight,
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
  {
    title: 'General',
    href: '/admin/configuracion',
    icon: Settings,
  },
]

const auditoriaItems = [
  {
    title: 'Auditoría',
    href: '/admin/auditoria',
    icon: Shield,
  },
  {
    title: 'Reportes',
    href: '/admin/reportes',
    icon: FileBarChart,
  },
]

const seguridadItems = [
  {
    title: 'Permisos',
    href: '/admin/usuarios/permisos',
    icon: Shield,
  },
  {
    title: 'Mi 2FA',
    href: '/admin/perfil/2fa',
    icon: KeyRound,
  },
  {
    title: 'Logs de Acceso',
    href: '/admin/seguridad/logs-acceso',
    icon: FileSearch,
  },
  {
    title: 'Sesiones',
    href: '/admin/seguridad/sesiones',
    icon: MonitorSmartphone,
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
  const [comprasOpen, setComprasOpen] = useState(false)
  const [ventasOpen, setVentasOpen] = useState(false)
  const [stockMovOpen, setStockMovOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [auditoriaOpen, setAuditoriaOpen] = useState(false)
  const [seguridadOpen, setSeguridadOpen] = useState(false)

  const isStockActive = stockItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isComprasActive = comprasItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isVentasActive = ventasItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isStockMovActive = stockMovimientoItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isConfigActive = configItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isAuditoriaActive = auditoriaItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
  const isSeguridadActive = seguridadItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Toggle section handler
  const toggleSection = (section: 'stock' | 'compras' | 'ventas' | 'stockMov' | 'config' | 'auditoria' | 'seguridad', currentOpen: boolean) => {
    switch (section) {
      case 'stock': setStockOpen(!currentOpen); break
      case 'compras': setComprasOpen(!currentOpen); break
      case 'ventas': setVentasOpen(!currentOpen); break
      case 'stockMov': setStockMovOpen(!currentOpen); break
      case 'config': setConfigOpen(!currentOpen); break
      case 'auditoria': setAuditoriaOpen(!currentOpen); break
      case 'seguridad': setSeguridadOpen(!currentOpen); break
    }
  }

  // Auto-open active sections based on current pathname
  const effectiveStockOpen = stockOpen || isStockActive
  const effectiveComprasOpen = comprasOpen || isComprasActive
  const effectiveVentasOpen = ventasOpen || isVentasActive
  const effectiveStockMovOpen = stockMovOpen || isStockMovActive
  const effectiveConfigOpen = configOpen || isConfigActive
  const effectiveAuditoriaOpen = auditoriaOpen || isAuditoriaActive
  const effectiveSeguridadOpen = seguridadOpen || isSeguridadActive

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

  const renderCollapsibleSection = (
    title: string,
    icon: React.ReactNode,
    items: typeof stockItems,
    isOpen: boolean,
    onToggle: () => void,
    isActive: boolean
  ) => (
    <SidebarGroup>
      <SidebarGroupContent>
        <button
          onClick={onToggle}
          className={`flex w-full items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider hover:text-sidebar-foreground ${isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/60'}`}
        >
          {icon}
          <span className="flex-1 text-left">{title}</span>
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        {isOpen && (
          <SidebarMenu>
            {items.map((item) => (
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
  )

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
          {/* Main nav */}
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
          {renderCollapsibleSection(
            'Stock & Producción',
            <Package className="h-3.5 w-3.5" />,
            stockItems,
            effectiveStockOpen,
            () => toggleSection('stock', stockOpen),
            isStockActive
          )}

          {/* Compras */}
          {renderCollapsibleSection(
            'Compras',
            <ShoppingCart className="h-3.5 w-3.5" />,
            comprasItems,
            effectiveComprasOpen,
            () => toggleSection('compras', comprasOpen),
            isComprasActive
          )}

          {/* Ventas */}
          {renderCollapsibleSection(
            'Ventas',
            <Receipt className="h-3.5 w-3.5" />,
            ventasItems,
            effectiveVentasOpen,
            () => toggleSection('ventas', ventasOpen),
            isVentasActive
          )}

          {/* Stock Movements */}
          {renderCollapsibleSection(
            'Stock',
            <ArrowLeftRight className="h-3.5 w-3.5" />,
            stockMovimientoItems,
            effectiveStockMovOpen,
            () => toggleSection('stockMov', stockMovOpen),
            isStockMovActive
          )}

          {/* Configuración */}
          {renderCollapsibleSection(
            'Configuración',
            <Settings className="h-3.5 w-3.5" />,
            configItems,
            effectiveConfigOpen,
            () => toggleSection('config', configOpen),
            isConfigActive
          )}

          <SidebarSeparator />

          {/* Auditoría & Reportes */}
          {renderCollapsibleSection(
            'Auditoría & Reportes',
            <Shield className="h-3.5 w-3.5" />,
            auditoriaItems,
            effectiveAuditoriaOpen,
            () => toggleSection('auditoria', auditoriaOpen),
            isAuditoriaActive
          )}

          {/* Seguridad */}
          {renderCollapsibleSection(
            'Seguridad',
            <KeyRound className="h-3.5 w-3.5" />,
            seguridadItems,
            effectiveSeguridadOpen,
            () => toggleSection('seguridad', seguridadOpen),
            isSeguridadActive
          )}

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
