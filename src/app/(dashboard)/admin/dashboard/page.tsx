'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Package, MessageSquare, Phone, ArrowRight, UserCircle, Users, Leaf, PackageOpen, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  productosActivos: number
  opinionesPendientes: number
  interaccionesWhatsApp: number
  totalPersonas: number
  totalUsuarios: number
  totalMateriasPrimas: number
  totalInsumos: number
  totalProductosTerminados: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    productosActivos: 0,
    opinionesPendientes: 0,
    interaccionesWhatsApp: 0,
    totalPersonas: 0,
    totalUsuarios: 0,
    totalMateriasPrimas: 0,
    totalInsumos: 0,
    totalProductosTerminados: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productosRes, opinionesRes, contactoRes, personasRes, usuariosRes, mpRes, insRes, ptRes] = await Promise.all([
          fetch('/api/productos?stock=false'),
          fetch('/api/opiniones?admin=true&estado=pending'),
          fetch('/api/contacto?dias=30'),
          fetch('/api/personas?limite=1'),
          fetch('/api/usuarios'),
          fetch('/api/materias-primas?limite=1'),
          fetch('/api/insumos?limite=1'),
          fetch('/api/productos-terminados?limite=1'),
        ])

        const productos = await productosRes.json()
        const opiniones = await opinionesRes.json()
        const contacto = await contactoRes.json()
        const personasData = await personasRes.json()
        const usuariosData = await usuariosRes.json()
        const mpData = await mpRes.json()
        const insData = await insRes.json()
        const ptData = await ptRes.json()

        setStats({
          productosActivos: Array.isArray(productos)
            ? productos.filter((p: { stock: boolean }) => p.stock).length
            : 0,
          opinionesPendientes: Array.isArray(opiniones) ? opiniones.length : 0,
          interaccionesWhatsApp: contacto?.estadisticas?.total || 0,
          totalPersonas: personasData?.total || 0,
          totalUsuarios: Array.isArray(usuariosData) ? usuariosData.length : 0,
          totalMateriasPrimas: mpData?.total || 0,
          totalInsumos: insData?.total || 0,
          totalProductosTerminados: ptData?.total || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const metricCards = [
    {
      title: 'Productos Activos',
      value: stats.productosActivos,
      icon: Package,
      color: 'bg-mostaza/10 text-mostaza',
      href: '/admin/productos',
    },
    {
      title: 'Materias Primas',
      value: stats.totalMateriasPrimas,
      icon: Leaf,
      color: 'bg-oliva/10 text-oliva',
      href: '/admin/materias-primas',
    },
    {
      title: 'Insumos',
      value: stats.totalInsumos,
      icon: PackageOpen,
      color: 'bg-mostaza/10 text-mostaza',
      href: '/admin/insumos',
    },
    {
      title: 'Productos Terminados',
      value: stats.totalProductosTerminados,
      icon: UtensilsCrossed,
      color: 'bg-rojo/10 text-rojo',
      href: '/admin/productos-terminados',
    },
    {
      title: 'Opiniones Pendientes',
      value: stats.opinionesPendientes,
      icon: MessageSquare,
      color: 'bg-rojo/10 text-rojo',
      href: '/admin/opiniones',
    },
    {
      title: 'Interacciones WhatsApp',
      value: stats.interaccionesWhatsApp,
      icon: Phone,
      color: 'bg-whatsapp/10 text-whatsapp',
      href: '/admin/estadisticas',
    },
    {
      title: 'Total Personas',
      value: stats.totalPersonas,
      icon: UserCircle,
      color: 'bg-marron/10 text-marron',
      href: '/admin/personas',
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'bg-oliva/10 text-oliva',
      href: '/admin/usuarios',
    },
  ]

  const firstName = session?.user?.name?.split(' ')[0] || 'Admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-marron">
          ¡Hola, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al panel de administración de Pastas Orlando
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="hover:shadow-lg transition-shadow border-marron/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <div className="text-3xl font-bold text-marron">
                    {card.value}
                  </div>
                )}
                <Link href={card.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 -ml-2 text-xs text-muted-foreground hover:text-marron"
                  >
                    Ver detalles
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="border-marron/5">
          <CardHeader>
            <CardTitle className="text-lg text-marron">Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/admin/materias-primas">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-marron/10 hover:border-oliva hover:bg-oliva/5"
                >
                  <Leaf className="mr-3 h-5 w-5 text-oliva" />
                  <div className="text-left">
                    <div className="font-medium text-marron">Materias Primas</div>
                    <div className="text-xs text-muted-foreground">Gestionar stock de materias primas</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/insumos">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-marron/10 hover:border-mostaza hover:bg-mostaza/5"
                >
                  <PackageOpen className="mr-3 h-5 w-5 text-mostaza" />
                  <div className="text-left">
                    <div className="font-medium text-marron">Insumos</div>
                    <div className="text-xs text-muted-foreground">Envases, bandejas, bolsas</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/productos-terminados">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-marron/10 hover:border-rojo hover:bg-rojo/5"
                >
                  <UtensilsCrossed className="mr-3 h-5 w-5 text-rojo" />
                  <div className="text-left">
                    <div className="font-medium text-marron">Productos Terminados</div>
                    <div className="text-xs text-muted-foreground">Pastas para producción y venta</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/productos">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-marron/10 hover:border-mostaza hover:bg-mostaza/5"
                >
                  <Package className="mr-3 h-5 w-5 text-mostaza" />
                  <div className="text-left">
                    <div className="font-medium text-marron">Catálogo Landing</div>
                    <div className="text-xs text-muted-foreground">Productos visibles al público</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/opiniones">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-marron/10 hover:border-mostaza hover:bg-mostaza/5"
                >
                  <MessageSquare className="mr-3 h-5 w-5 text-rojo" />
                  <div className="text-left">
                    <div className="font-medium text-marron">Moderar Opiniones</div>
                    <div className="text-xs text-muted-foreground">Aprobar o rechazar reseñas</div>
                  </div>
                </Button>
              </Link>
              <Link href="/admin/estadisticas">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-marron/10 hover:border-mostaza hover:bg-mostaza/5"
                >
                  <Phone className="mr-3 h-5 w-5 text-whatsapp" />
                  <div className="text-left">
                    <div className="font-medium text-marron">Estadísticas WhatsApp</div>
                    <div className="text-xs text-muted-foreground">Ver interacciones y datos</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
