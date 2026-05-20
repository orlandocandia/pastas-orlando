'use client'

import { Settings, CreditCard, ListChecks } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FormaPagoManager from '@/components/admin/FormaPagoManager'
import EstadoGeneralManager from '@/components/admin/EstadoGeneralManager'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-marron/10 p-2">
          <Settings className="h-5 w-5 text-marron" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-marron">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Administra las formas de pago y estados generales del sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="formas-pago" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="formas-pago" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Formas de Pago
          </TabsTrigger>
          <TabsTrigger value="estados-generales" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Estados Generales
          </TabsTrigger>
        </TabsList>
        <TabsContent value="formas-pago" className="mt-4">
          <FormaPagoManager />
        </TabsContent>
        <TabsContent value="estados-generales" className="mt-4">
          <EstadoGeneralManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
