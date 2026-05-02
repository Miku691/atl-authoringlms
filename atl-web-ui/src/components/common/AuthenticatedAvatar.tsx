import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Loader2 } from 'lucide-react';

interface AuthenticatedAvatarProps {
    imageUrl?: string | null;
    alt: string;
    fallbackInitial: string; // e.g. "J"
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const AuthenticatedAvatar: React.FC<AuthenticatedAvatarProps> = ({
    imageUrl,
    alt,
    fallbackInitial,
    size = 'md',
    className = ''
}) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        if (!imageUrl) {
            setSrc(null);
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError(false);

        api.get(imageUrl, { responseType: 'blob' })
            .then(response => {
                if (isMounted) {
                    const objectUrl = URL.createObjectURL(response.data);
                    setSrc(objectUrl);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Failed to load avatar", err);
                    setError(true);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
            // potential cleanup of objectUrl if stored in ref, but browser cleans up eventually
        };
    }, [imageUrl]);

    // Size classes
    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-16 w-16 text-lg',
        xl: 'h-24 w-24 text-xl'
    };

    const containerClass = `${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center ${className}`;

    if (imageUrl && src && !error) {
        return (
            <div className={containerClass}>
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    // Fallback or Loading
    return (
        <div className={`${containerClass} bg-indigo-500/10 text-indigo-600 font-semibold`}>
            {loading ? (
                <Loader2 className="animate-spin w-1/3 h-1/3" />
            ) : (
                fallbackInitial.charAt(0).toUpperCase()
            )}
        </div>
    );
};

export default AuthenticatedAvatar;
