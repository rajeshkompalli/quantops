import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, FlaskConical, ShieldAlert, Sparkles, ScrollText } from 'lucide-react';
import { Activity } from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/backtesting', label: 'Backtesting', icon: LineChart },
    { to: '/dashboard/research', label: 'Research', icon: FlaskConical },
    { to: '/dashboard/risk', label: 'Risk', icon: ShieldAlert },
    { to: '/dashboard/intelligence', label: 'Market Intelligence', icon: Sparkles },
    { to: '/dashboard/trades', label: 'Trade Log', icon: ScrollText },
];

function Layout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            <aside className="w-64 border-r border-slate-800 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                    <Activity className="text-emerald-400" size={20} />
                    <h1 className="text-xl font-semibold tracking-tight">
                        <span className="text-white">Quant</span>
                        <span className="text-emerald-400">Ops</span>
                    </h1>
                </div>
                <nav className="flex flex-col gap-1">
                    {navItems.map(({ to, label, icon: Icon, end }) => {
                        const isActive = end
                            ? location.pathname === to
                            : location.pathname.startsWith(to);
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                    }`}
                            >
                                <Icon size={18} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;