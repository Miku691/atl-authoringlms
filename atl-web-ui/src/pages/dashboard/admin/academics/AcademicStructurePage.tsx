import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { Loader2 } from 'lucide-react';
import api from '../../../../utils/api';
import SchoolStructureView from './views/SchoolStructureView';
import CollegeStructureView from './views/CollegeStructureView';
import CoachingStructureView from './views/CoachingStructureView';

const AcademicStructurePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [actualTenantType, setActualTenantType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkType = async () => {
            if (!user) return;
            
            // If user token has it securely (and it's not undefined)
            if (user.tenantType) {
                setActualTenantType(user.tenantType);
                setIsLoading(false);
                return;
            }

            try {
                // Otherwise fetch dynamically from readiness
                const res = await api.get('/ims-academic-service/readiness/status');
                if (res.data?.status === 'SUCCESS' && res.data?.apiData?.tenantType) {
                    setActualTenantType(res.data.apiData.tenantType);
                } else {
                    setActualTenantType('SCHOOL'); // fallback
                }
            } catch (err) {
                console.error("Failed to fetch readiness type", err);
                setActualTenantType('SCHOOL');
            } finally {
                setIsLoading(false);
            }
        };

        checkType();
    }, [user]);

    if (!user || isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        }>
            {actualTenantType === 'COLLEGE' ? (
                <CollegeStructureView />
            ) : actualTenantType === 'COACHING' ? (
                <CoachingStructureView />
            ) : (
                <SchoolStructureView />
            )}
        </Suspense>
    );
};

export default AcademicStructurePage;
