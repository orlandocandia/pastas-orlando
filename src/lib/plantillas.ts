/**
 * Utilidades para manejo de plantillas de notificación
 * Variables en formato {{nombre_variable}}
 */

/**
 * Extrae las variables de una plantilla de notificación
 * Las variables están en formato {{nombre_variable}}
 */
export function extraerVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1]
    if (variable && !variables.includes(variable)) {
      variables.push(variable)
    }
  }

  return variables
}

/**
 * Renderiza una plantilla reemplazando las variables con los valores proporcionados
 * Las variables en la plantilla están en formato {{nombre_variable}}
 */
export function renderPlantilla(
  template: string,
  variables: Record<string, string> = {}
): string {
  let rendered = template

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    rendered = rendered.replace(regex, value)
  }

  // Dejar las variables sin reemplazar tal cual (no las eliminamos)
  return rendered
}
