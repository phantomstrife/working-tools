import { LayoutDashboard, Users, Calendar, Gamepad2 } from 'lucide-react';

export const navItems = [
   { name: 'dashboard', icon: LayoutDashboard, href: '#', active: true },
   { name: 'company', icon: Calendar, href: '#', active: false },
   { name: 'event', icon: Calendar, href: '#', active: false },
   { name: 'game', icon: Gamepad2, href: '#', active: false },
   { name: 'account', icon: Users, href: '#', active: false },
];
