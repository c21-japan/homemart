import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)
const COOKIE_NAME = 'admin_session'

const PUBLIC_PATHS = ['/admin/login', '/admin/forbidden']

type PermissionRule = {
  prefix: string
  feature: string
  permission: string
}

const PERMISSION_RULES: PermissionRule[] = [
  { prefix: '/admin/users/new', feature: 'USERS', permission: 'CREATE' },
  { prefix: '/admin/users/', feature: 'USERS', permission: 'EDIT' },
  { prefix: '/admin/users', feature: 'USERS', permission: 'VIEW' },
  { prefix: '/admin/settings/users', feature: 'SETTINGS', permission: 'VIEW' },
  { prefix: '/admin/settings', feature: 'SETTINGS', permission: 'VIEW' },
  { prefix: '/admin/customers/new', feature: 'CUSTOMERS', permission: 'CREATE' },
  { prefix: '/admin/customers/', feature: 'CUSTOMERS', permission: 'VIEW' },
  { prefix: '/admin/customers', feature: 'CUSTOMERS', permission: 'VIEW' },
  { prefix: '/admin/properties/new', feature: 'PROPERTIES', permission: 'CREATE' },
  { prefix: '/admin/properties/', feature: 'PROPERTIES', permission: 'VIEW' },
  { prefix: '/admin/properties-list', feature: 'PROPERTIES', permission: 'VIEW' },
  { prefix: '/admin/properties', feature: 'PROPERTIES', permission: 'VIEW' },
  { prefix: '/admin/leads/new', feature: 'LEADS', permission: 'CREATE' },
  { prefix: '/admin/leads/', feature: 'LEADS', permission: 'VIEW' },
  { prefix: '/admin/leads', feature: 'LEADS', permission: 'VIEW' },
  { prefix: '/admin/inquiries', feature: 'INQUIRIES', permission: 'VIEW' },
  { prefix: '/admin/documents/upload', feature: 'DOCUMENTS', permission: 'CREATE' },
  { prefix: '/admin/documents', feature: 'DOCUMENTS', permission: 'VIEW' },
  { prefix: '/admin/internal-applications/new', feature: 'INTERNAL_APPLICATIONS', permission: 'CREATE' },
  { prefix: '/admin/internal-applications/forms', feature: 'INTERNAL_APPLICATIONS', permission: 'CREATE' },
  { prefix: '/admin/internal-applications/', feature: 'INTERNAL_APPLICATIONS', permission: 'VIEW' },
  { prefix: '/admin/internal-applications', feature: 'INTERNAL_APPLICATIONS', permission: 'VIEW' },
  { prefix: '/admin/attendance/new', feature: 'ATTENDANCE', permission: 'CREATE' },
  { prefix: '/admin/attendance', feature: 'ATTENDANCE', permission: 'VIEW' },
  { prefix: '/admin/part-time-attendance/form', feature: 'PART_TIME_ATTENDANCE', permission: 'CREATE' },
  { prefix: '/admin/part-time-attendance/shift-request', feature: 'PART_TIME_ATTENDANCE', permission: 'CREATE' },
  { prefix: '/admin/part-time-attendance/reports', feature: 'PART_TIME_ATTENDANCE', permission: 'VIEW' },
  { prefix: '/admin/part-time-attendance', feature: 'PART_TIME_ATTENDANCE', permission: 'VIEW' },
  { prefix: '/admin/flyers/designs/new', feature: 'FLYERS', permission: 'CREATE' },
  { prefix: '/admin/flyers/distributions/new', feature: 'FLYERS', permission: 'CREATE' },
  { prefix: '/admin/flyers/inquiries/new', feature: 'FLYERS', permission: 'CREATE' },
  { prefix: '/admin/flyers/designs', feature: 'FLYERS', permission: 'VIEW' },
  { prefix: '/admin/flyers/distributions', feature: 'FLYERS', permission: 'VIEW' },
  { prefix: '/admin/flyers/inquiries', feature: 'FLYERS', permission: 'VIEW' },
  { prefix: '/admin/flyers/analysis', feature: 'FLYERS', permission: 'VIEW' },
  { prefix: '/admin/flyers', feature: 'FLYERS', permission: 'VIEW' },
  { prefix: '/admin/reform-projects', feature: 'REFORM_PROJECTS', permission: 'VIEW' },
  { prefix: '/admin/reform-workers', feature: 'REFORM_WORKERS', permission: 'VIEW' },
  { prefix: '/admin/team-performance', feature: 'TEAM_PERFORMANCE', permission: 'VIEW' },
  { prefix: '/admin/career-path', feature: 'CAREER_PATH', permission: 'VIEW' },
  { prefix: '/admin/media', feature: 'MEDIA', permission: 'VIEW' },
  { prefix: '/admin/accounting', feature: 'REPORTS', permission: 'VIEW' },
  { prefix: '/admin/reports', feature: 'REPORTS', permission: 'VIEW' },
  { prefix: '/admin/search', feature: 'DASHBOARD', permission: 'VIEW' },
  { prefix: '/admin/register', feature: 'USERS', permission: 'CREATE' },
  { prefix: '/admin/dashboard', feature: 'DASHBOARD', permission: 'VIEW' },
  { prefix: '/admin', feature: 'DASHBOARD', permission: 'VIEW' }
]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    const permissions = payload.permissions as Record<string, string[]> | undefined
    const rule = PERMISSION_RULES.find((r) => pathname.startsWith(r.prefix))

    if (rule) {
      const featurePermissions = permissions?.[rule.feature] || []
      if (!featurePermissions.includes(rule.permission)) {
        const url = new URL('/admin/forbidden', request.url)
        url.searchParams.set('feature', rule.feature)
        url.searchParams.set('permission', rule.permission)
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
