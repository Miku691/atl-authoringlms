import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MenuItem } from '../../config/SidebarConfig';

interface SidebarMenuItemProps {
    item: MenuItem;
    isOpen: boolean;
    expandedMenus: string[];
    toggleSubMenu: (path: string) => void;
    location: string;
    depth: number;
}

// ── Design tokens: all use CSS variables so they auto-theme ─────────────
const T = {
    text:         'var(--text-secondary)',
    textHover:    'var(--text-primary)',
    textActive:   'var(--brand)',
    iconDefault:  'var(--text-muted)',
    iconActive:   'var(--brand)',
    bgHover:      'var(--brand-subtle)',
    bgActive:     'var(--brand-subtle)',
    activeBorder: 'var(--brand)',
    indent:       'var(--border)',
};

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
    item,
    isOpen,
    expandedMenus,
    toggleSubMenu,
    location,
    depth,
}) => {
    const isExpanded     = expandedMenus.includes(item.path);
    const isActiveParent = location.startsWith(item.path) && item.path !== '/dashboard';

    const rowBase: React.CSSProperties = {
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
        width:         '100%',
        padding:       isOpen
            ? depth === 0 ? '8px 10px' : '6px 10px 6px 14px'
            : '8px 0',
        justifyContent: !isOpen ? 'center' : undefined,
        borderRadius:  '8px',
        cursor:        'pointer',
        transition:    'background 150ms ease, color 150ms ease',
        position:      'relative',
        textAlign:     'left',
        border:        'none',
        background:    'transparent',
        textDecoration:'none',
    };

    // ── Parent with sub-items ───────────────────────────────────────
    if (item.subItems && item.subItems.length > 0) {
        const isActive = isActiveParent;

        return (
            <div style={{ marginBottom: depth === 0 ? '2px' : '1px' }}>
                <button
                    onClick={() => toggleSubMenu(item.path)}
                    style={{
                        ...rowBase,
                        color:      isActive ? T.textActive : T.text,
                        background: isActive && isExpanded ? T.bgActive : 'transparent',
                    }}
                    onMouseEnter={e => {
                        if (!(isActive && isExpanded)) {
                            (e.currentTarget as HTMLButtonElement).style.background = T.bgHover;
                            (e.currentTarget as HTMLButtonElement).style.color = T.textHover;
                        }
                    }}
                    onMouseLeave={e => {
                        if (!(isActive && isExpanded)) {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.color = isActive ? T.textActive : T.text;
                        }
                    }}
                >
                    {isActive && isExpanded && isOpen && (
                        <span style={{ position: 'absolute', left: 0, top: '6px', bottom: '6px', width: '3px', borderRadius: '0 3px 3px 0', background: T.activeBorder }} />
                    )}

                    {item.icon && (
                        <item.icon style={{ width: '16px', height: '16px', flexShrink: 0, color: isActive ? T.iconActive : T.iconDefault }} />
                    )}

                    {isOpen && (
                        <>
                            <span style={{ flex: 1, fontSize: depth === 0 ? '13px' : '12px', fontWeight: depth === 0 ? 600 : 500, color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                            </span>
                            {isExpanded
                                ? <ChevronDown  style={{ width: '14px', height: '14px', flexShrink: 0, color: T.iconDefault }} />
                                : <ChevronRight style={{ width: '14px', height: '14px', flexShrink: 0, color: T.iconDefault }} />
                            }
                        </>
                    )}
                </button>

                {isOpen && isExpanded && (
                    <div style={{ marginTop: '2px', marginLeft: '10px', paddingLeft: '14px', borderLeft: `1.5px solid ${T.indent}` }}>
                        {item.subItems.map(sub => (
                            <SidebarMenuItem
                                key={sub.path}
                                item={sub}
                                isOpen={isOpen}
                                expandedMenus={expandedMenus}
                                toggleSubMenu={toggleSubMenu}
                                location={location}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Leaf item ───────────────────────────────────────────────────
    return (
        <div style={{ marginBottom: '1px', position: 'relative' }}>
            <NavLink
                to={item.path}
                style={({ isActive }) => ({
                    ...rowBase,
                    color:      isActive ? T.textActive : T.text,
                    background: isActive ? T.bgActive   : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                })}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = T.bgHover;
                    el.style.color = T.textHover;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = '';
                    el.style.color = '';
                }}
            >
                {({ isActive }) => (
                    <>
                        {isActive && isOpen && (
                            <span style={{ position: 'absolute', left: 0, top: '5px', bottom: '5px', width: '3px', borderRadius: '0 3px 3px 0', background: T.activeBorder }} />
                        )}
                        {item.icon && (
                            <item.icon style={{ width: '15px', height: '15px', flexShrink: 0, color: isActive ? T.iconActive : T.iconDefault }} />
                        )}
                        {isOpen && (
                            <span style={{ flex: 1, fontSize: depth === 0 ? '13px' : '12px', color: isActive ? T.textActive : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                            </span>
                        )}
                        {!isOpen && depth === 0 && (
                            <div
                                className="sidebar-tooltip"
                                style={{ position: 'absolute', left: '52px', top: '50%', transform: 'translateY(-50%)', background: 'var(--text-primary)', color: 'var(--bg-main)', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0, zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                            >
                                {item.label}
                            </div>
                        )}
                    </>
                )}
            </NavLink>
        </div>
    );
};

export default SidebarMenuItem;
