export interface User {
    username: string;
    roles: string[];
    tenantId?: string | null;
    tenantName?: string | null;
    currency?: string | null;
    tenantSetupCompleted?: boolean;
    tenantType?: 'SCHOOL' | 'COLLEGE' | 'COACHING';
    email?: string;
    id: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
