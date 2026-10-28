import { LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';

import { ROUTE } from '@admin-web/routes/constants';

export const navItems = [
   { name: 'dashboard', icon: LayoutDashboard, href: '#', active: true },
   { name: 'guard', icon: ShieldCheck, href: ROUTE.GUARD.HOME, active: false },
   { name: 'operator', icon: Sparkles, href: ROUTE.OPERATOR.HOME, active: false },
];
