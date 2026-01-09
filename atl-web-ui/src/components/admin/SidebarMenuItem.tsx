import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { MenuItem } from '../../config/SidebarConfig';

interface SidebarMenuItemProps {
    item: MenuItem;
    isOpen: boolean;
    expandedMenus: string[];
    toggleSubMenu: (path: string) => void;
    location: string;
    depth: number;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item, isOpen, expandedMenus, toggleSubMenu, location, depth }) => {
    const isExpanded = expandedMenus.includes(item.path);
    const isActiveParent = location.startsWith(item.path);

    // Indentation for nested items
    const paddingLeft = depth > 0 ? `${depth * 12 + 12}px` : '12px';

    if (item.subItems && item.subItems.length > 0) {
        return (
            <div className="mb-1">
                <button
                    onClick={() => toggleSubMenu(item.path)}
                    className={`
                        w-full flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group
                        ${isActiveParent ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                        ${!isOpen && 'justify-center'}
                    `}
                    style={{ paddingLeft: !isOpen ? '12px' : paddingLeft, paddingRight: '12px' }}
                >
                    {item.icon && <item.icon className={`w-5 h-5 flex-shrink-0 ${!isOpen && 'mx-auto'}`} />}
                    {isOpen && (
                        <>
                            <span className="font-medium text-sm truncate flex-1 text-left">{item.label}</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </>
                    )}
                </button>

                {isOpen && isExpanded && (
                    <div className="space-y-1">
                        {item.subItems.map((subItem) => (
                            <SidebarMenuItem
                                key={subItem.path}
                                item={subItem}
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

    return (
        <NavLink
            to={item.path}
            className={({ isActive }) => `
                flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
                ${!isOpen && 'justify-center'}
            `}
            style={{ paddingLeft: !isOpen ? '12px' : paddingLeft, paddingRight: '12px' }}
        >
            {item.icon && <item.icon className={`w-5 h-5 flex-shrink-0 ${!isOpen && 'mx-auto'}`} />}
            {isOpen && (
                <span className="font-medium text-sm truncate">{item.label}</span>
            )}

            {/* Tooltip for collapsed state */}
            {!isOpen && depth === 0 && (
                <div className="absolute left-16 bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-slate-700 shadow-xl z-50 whitespace-nowrap">
                    {item.label}
                </div>
            )}
        </NavLink>
    );
};

export default SidebarMenuItem;
