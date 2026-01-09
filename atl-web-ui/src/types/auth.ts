export interface User {
    username: string;
    roles: string[];
    tenantId?: string | null;
    tenantSetupCompleted?: boolean;
    tenantType?: 'SCHOOL' | 'COLLEGE' | 'COACHING';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
