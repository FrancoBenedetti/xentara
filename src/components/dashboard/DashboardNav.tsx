'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Hub } from '@/app/dashboard/actions';
import ThemeToggle from './ThemeToggle';
import styles from '@/app/dashboard/dashboard.module.css';
import { createClient } from '@/utils/supabase/client';

interface DashboardNavProps {
  hubs: Hub[];
  isStaff?: boolean;
}

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const DesktopNavItem = ({ href, icon, label, disabled, children }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (disabled) {
    return (
      <li style={{ marginBottom: '1.5rem', opacity: 0.3, cursor: 'not-allowed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <span>{icon}</span> {label}
        </div>
      </li>
    );
  }

  return (
    <li style={{ marginBottom: '1.5rem' }}>
      <Link 
        href={href} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          color: isActive ? 'var(--indigo)' : 'inherit', 
          fontWeight: 700, 
          fontSize: '0.9rem',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          marginBottom: children ? '0.75rem' : 0
        }}
      >
        <span style={{ color: isActive ? 'var(--indigo)' : 'var(--text-muted)' }}>{icon}</span> {label}
      </Link>
      {children}
    </li>
  );
};

const MobileNavItem = ({ href, icon, label, disabled }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (disabled) return null;

  return (
    <Link 
      href={href} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        gap: '0.25rem', 
        color: isActive ? 'var(--indigo)' : 'var(--text-muted)', 
        fontWeight: 800, 
        fontSize: '0.75rem',
        textDecoration: 'none',
        padding: '0.5rem',
        flex: 1
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span> 
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </Link>
  );
};

export default function DashboardNav({ hubs, isStaff }: DashboardNavProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em', margin: 0 }}>XENTARA</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--indigo)', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '0.1em' }}>STUDIO V1.0</p>
          </div>
          <ThemeToggle />
        </div>
        
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <DesktopNavItem href="/dashboard" icon="⬢" label="Hubs" />
            <DesktopNavItem href="/dashboard/taxonomy" icon="✦" label="Taxonomy" />
            <DesktopNavItem href="/dashboard/history" icon="◷" label="Publications" />
            <DesktopNavItem href="/dashboard/boards" icon="⬡" label="Boards (Locked)" disabled />
            <DesktopNavItem href="/dashboard/settings" icon="⚙" label="Settings" />
          </ul>
        </nav>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Your Collectives</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {hubs.map((hub) => {
              const hubBase = `/dashboard/hubs/${hub.slug}`;
              return (
                <DesktopNavItem 
                  key={hub.id}
                  href={hubBase} 
                  icon="⬢" 
                  label={hub.name}
                >
                  <ul style={{ listStyle: 'none', paddingLeft: '1.5rem', marginTop: '-0.25rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <Link href={`${hubBase}/promotions`} style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        color: pathname === `${hubBase}/promotions` ? 'var(--indigo)' : 'var(--text-muted)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.6rem' }}>📢</span> PROMOTIONS
                      </Link>
                    </li>
                    <li>
                      <Link href={`${hubBase}/settings`} style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        color: pathname === `${hubBase}/settings` ? 'var(--indigo)' : 'var(--text-muted)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.6rem' }}>⚙️</span> SETTINGS
                      </Link>
                    </li>
                  </ul>
                </DesktopNavItem>
              );
            })}
          </ul>
        </div>

        {/* Staff admin section */}
        {isStaff && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.6rem', fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🔒 Staff Admin
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <Link
                  href="/dashboard/admin/platform-promotions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: pathname === '/dashboard/admin/platform-promotions' ? '#6366f1' : 'var(--text-muted)',
                    textDecoration: 'none',
                    padding: '0.3rem 0',
                    transition: 'color 0.15s',
                  }}
                >
                  <span style={{ fontSize: '0.7rem' }}>✨</span> Platform Promotions
                </Link>
              </li>
            </ul>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
           <button 
             onClick={handleSignOut}
             style={{ 
               background: 'none', 
               border: 'none', 
               color: 'var(--text-muted)', 
               fontSize: '0.75rem', 
               fontWeight: 800, 
               textTransform: 'uppercase', 
               letterSpacing: '0.1em',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem',
               padding: '0.5rem 0'
             }}
           >
             <span>⇠</span> Logout
           </button>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.5, marginTop: '0.5rem', fontWeight: 700 }}>VER V1.0 - STUDIO</div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className={styles.mobileBottomNav}>
        <MobileNavItem href="/dashboard" icon="⬢" label="Hubs" />
        <MobileNavItem href="/dashboard/settings" icon="⚙" label="Settings" />
        <div 
          onClick={handleSignOut}
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.25rem', 
            color: 'var(--text-muted)', 
            fontWeight: 800, 
            fontSize: '0.75rem',
            padding: '0.5rem',
            flex: 1,
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⇠</span> 
          <span>LOGOUT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', flex: 1 }}>
          <ThemeToggle />
        </div>
      </nav>

      <style jsx>{`
        @media (min-width: 1025px) {
          :global(.${styles.mobileBottomNav}) {
            display: none;
          }
        }
        
        @media (max-width: 1024px) {
          :global(.${styles.sidebar}) {
            display: none !important;
          }
          
          :global(.${styles.mobileBottomNav}) {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-surface);
            border-top: 1px solid var(--border);
            padding: 0.5rem 0.75rem;
            padding-bottom: env(safe-area-inset-bottom, 0.75rem);
            z-index: 100;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
        }
      `}</style>
    </>
  );
}
