import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const usuario = await db.usuario.findUnique({
          where: { email: credentials.email },
          include: {
            persona: true,
            roles: {
              include: {
                rol: {
                  include: {
                    permisos: {
                      include: { permiso: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (!usuario || !usuario.estado) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, usuario.password)

        if (!isValid) {
          return null
        }

        // Obtener roles y permisos
        const roles = usuario.roles.map((ur) => ur.rol.nombre)
        const permisos = usuario.roles.flatMap((ur) =>
          ur.rol.permisos.map((rp) => rp.permiso.nombre)
        )

        return {
          id: usuario.id.toString(),
          email: usuario.email,
          name: `${usuario.persona.nombre} ${usuario.persona.apellido}`,
          role: roles[0] || 'cliente',
          roles,
          permisos,
          imagen: usuario.imagen || usuario.persona.imagen,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role
        token.roles = (user as { roles: string[] }).roles
        token.permisos = (user as { permisos: string[] }).permisos
        token.id = user.id
        token.imagen = (user as { imagen?: string }).imagen
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
        ;(session.user as { roles?: string[] }).roles = token.roles as string[]
        ;(session.user as { permisos?: string[] }).permisos = token.permisos as string[]
        ;(session.user as { id?: string }).id = token.id as string
        ;(session.user as { imagen?: string }).imagen = token.imagen as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'pastas-orlando-secret-key-2026',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
