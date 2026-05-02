import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

/** Maps variant → icon component and colour token for the icon */
const VARIANT_META = {
    danger: {
        Icon: AlertTriangle,
        iconColor: '#DC2626',
    },
    warning: {
        Icon: AlertCircle,
        iconColor: '#D97706',
    },
    info: {
        Icon: Info,
        iconColor: '#2A6DF4',
    },
    success: {
        Icon: CheckCircle2,
        iconColor: '#16A34A',
    },
} as const;

/**
 * ConfirmationModal
 *
 * Uses the canonical IMS modal design system (BookDemo-style).
 * Apply variant prop to control icon colour and confirm button colour.
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'danger',
}) => {
    const { Icon, iconColor } = VARIANT_META[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                /* ── Backdrop ── */
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="confirm-modal-title"
                >
                    {/* ── Card ── */}
                    <motion.div
                        className="modal-card modal-card-sm"
                        initial={{ opacity: 0, scale: 0.93, y: 20 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{   opacity: 0, scale: 0.93, y: 20 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* ── Header ── */}
                        <div className="modal-header">
                            <div className="flex items-center gap-3">
                                <div className={`modal-icon-box ${variant}`}>
                                    <Icon size={20} style={{ color: iconColor }} />
                                </div>
                                <div>
                                    <p className="modal-title" id="confirm-modal-title">
                                        {title}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Body ── */}
                        <div className="modal-body">
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                {message}
                            </p>
                        </div>

                        {/* ── Footer ── */}
                        <div className="modal-footer">
                            <button
                                className="modal-btn-secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                {cancelText}
                            </button>
                            <button
                                className={`modal-btn-primary ${variant}`}
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing…' : confirmText}
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;

