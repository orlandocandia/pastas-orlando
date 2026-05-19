'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import MateriaPrimaForm from '@/components/admin/MateriaPrimaForm'

export default function MateriaPrimaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [materiaPrima, setMateriaPrima] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id === 'nueva') {
      setLoading(false)
      return
    }

    async function fetchMateriaPrima() {
      try {
        const res = await fetch(`/api/materias-primas/${params.id}`)
        if (!res.ok) throw new Error('No encontrada')
        const data = await res.json()
        setMateriaPrima(data)
      } catch {
        router.push('/admin/materias-primas')
      } finally {
        setLoading(false)
      }
    }

    fetchMateriaPrima()
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
        <Link href="/admin/materias-primas">
          <Button variant="ghost" size="icon" className="hover:bg-mostaza/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-marron">
            {materiaPrima ? `Editar: ${materiaPrima.nombre}` : 'Nueva Materia Prima'}
          </h1>
        </div>
      </div>

      <MateriaPrimaForm
        materiaPrima={materiaPrima}
        onSuccess={() => router.push('/admin/materias-primas')}
      />
    </div>
  )
}
