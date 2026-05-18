'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import OpinionesTable from '@/components/admin/OpinionesTable'

export default function OpinionesPage() {
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch('/api/opiniones?admin=true&estado=pending'),
          fetch('/api/opiniones?admin=true&estado=approved'),
          fetch('/api/opiniones?admin=true&estado=rejected'),
        ])

        const [pending, approved, rejected] = await Promise.all([
          pendingRes.json(),
          approvedRes.json(),
          rejectedRes.json(),
        ])

        setCounts({
          pending: Array.isArray(pending) ? pending.length : 0,
          approved: Array.isArray(approved) ? approved.length : 0,
          rejected: Array.isArray(rejected) ? rejected.length : 0,
        })
      } catch (error) {
        console.error('Error fetching opinion counts:', error)
      }
    }

    fetchCounts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-rojo/10 p-2">
          <MessageSquare className="h-5 w-5 text-rojo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Opiniones</h1>
          <p className="text-sm text-muted-foreground">
            Moderá las reseñas de los clientes
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="gap-2">
            Pendientes
            {counts.pending > 0 && (
              <Badge className="bg-rojo/10 text-rojo hover:bg-rojo/20 text-xs px-1.5">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            Aprobadas
            {counts.approved > 0 && (
              <Badge className="bg-oliva/10 text-oliva hover:bg-oliva/20 text-xs px-1.5">
                {counts.approved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            Rechazadas
            {counts.rejected > 0 && (
              <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs px-1.5">
                {counts.rejected}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <OpinionesTable estado="pending" />
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <OpinionesTable estado="approved" />
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <OpinionesTable estado="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
