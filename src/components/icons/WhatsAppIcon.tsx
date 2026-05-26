interface WhatsAppIconProps {
  className?: string
}

/**
 * Ícono SVG de WhatsApp.
 * Círculo verde (#25D366) con el logo oficial de WhatsApp
 * (burbuja de chat con teléfono blanco).
 */
export function WhatsAppIcon({ className = 'w-12 h-12' }: WhatsAppIconProps) {
  return (
    <div
      className={`${className} bg-[#25D366] rounded-full shadow-md flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all duration-300`}
    >
      <svg
        viewBox="0 0 32 32"
        className="w-[60%] h-[60%]"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z" />
      </svg>
    </div>
  )
}
