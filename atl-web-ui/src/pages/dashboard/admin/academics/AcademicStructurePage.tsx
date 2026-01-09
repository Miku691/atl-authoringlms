import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import { BookOpen, Layers, GraduationCap, Loader2 } from 'lucide-react';

interface Program {
    id: string;
    code: string;
    title: string;
    level: string;
    board: string;
}

interface Offering {
    id: string;
    programId: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
}

const AcademicStructurePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [programs, setPrograms] = useState<Program[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tenantId) {
            fetchData();
        }
    }, [tenantId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [progRes, offRes] = await Promise.all([
                api.get(`/ims-academic/programs/tenant/${tenantId}`),
                api.get(`/ims-academic/offerings/tenant/${tenantId}`)
            ]);

            if (progRes.data.status === 'SUCCESS') {
                setPrograms(progRes.data.apiData);
            }
            if (offRes.data.status === 'SUCCESS') {
                setOfferings(offRes.data.apiData);
            }
        } catch (error) {
            console.error('Error fetching academic data:', error);
            toast.error('Failed to load academic structure');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Academic Structure</h1>
                <p className="text-sm text-gray-500">View and manage your institute's foundational programs and offerings.</p>
            </div>

            <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-indigo-900">Structure is Immutable</h3>
                        <p className="text-sm text-indigo-700 mt-1">
                            Programs and Offerings are fixed based on your tenant type (School/College/Coaching). To request structural changes, please contact support.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {programs.map((program) => {
                        const programOfferings = offerings.filter(o => o.programId === program.id);

                        return (
                            <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{program.title}</h3>
                                            <p className="text-xs text-gray-500">Code: {program.code} • {program.board} • {program.level}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                                        {program.level}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Course Offerings</h4>
                                    {programOfferings.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No offerings found for this program.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {programOfferings.map(offering => (
                                                <div key={offering.id} className="flex items-center p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                                    <Layers className="h-4 w-4 text-gray-400 mr-3" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{offering.name}</p>
                                                        <p className="text-xs text-gray-500">{offering.type}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AcademicStructurePage;
