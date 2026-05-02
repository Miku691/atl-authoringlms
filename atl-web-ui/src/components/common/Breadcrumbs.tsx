import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();

    // Split path and remove empty strings
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map logic for cleaner names (optional, can be expanded)
    const getName = (segment: string) => {
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    };

    return (
        <nav className="hidden sm:flex items-center text-sm text-content-secondary">
            <Link to="/dashboard" className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center">
                <Home className="w-4 h-4 mr-1" />
                <span className="sr-only">Dashboard</span>
            </Link>

            {pathnames.length > 0 && (
                <span className="mx-2 text-content-muted">
                    <ChevronRight className="w-4 h-4" />
                </span>
            )}

            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                return (
                    <React.Fragment key={to}>
                        {isLast ? (
                            <span className="font-medium text-content-primary">{getName(value)}</span>
                        ) : (
                            <Link to={to} className="hover:text-indigo-600 cursor-pointer transition-colors">
                                {getName(value)}
                            </Link>
                        )}
                        {!isLast && (
                            <span className="mx-2 text-content-muted">
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
