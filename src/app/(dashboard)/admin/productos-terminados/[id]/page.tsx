'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import ProductoTerminadoForm from '@/components/admin/ProductoTerminadoForm'

export default function ProductoTerminadoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id === 'nuevo') {
      setLoading(false)
      return
    }

    async function fetchProducto() {
      try {
        const res = await fetch(`/api/productos-terminados/${params.id}`)
        if (!res.ok) throw new Error('No encontrado')
        const data = await res.json()
        setProducto(data)
      } catch {
        router.push('/admin/productos-terminados')
      } finally {
        setLoading(false)
      }
    }

    fetchProducto()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mostaza" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/productos-terminados">
          <Button variant="ghost" size="icon" className="hover:bg-mostaza/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-marron">
            {producto ? `Editar: ${producto.nombre}` : 'Nuevo Producto Terminado'}
          </h1>
        </div>
      </div>

      <ProductoTerminadoForm
        productoTerminado={producto}
        onSuccess={() => router.push('/admin/productos-terminados')}
      />
    </div>
  )
}
