import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when backdrop or X button is clicked */
  onClose: () => void;
  /** Optional title rendered in the canonical header */
  title?: React.ReactNode;
  /** Optional subtitle rendered below the title */
  subtitle?: React.ReactNode;
  /** Optional icon rendered in the icon box left of the title */
  icon?: React.ReactNode;
  /** Variant colours the icon box. Defaults to 'info' (brand-subtle). */
  iconVariant?: 'info' | 'danger' | 'warning' | 'success';
  /** Controls max-width of the modal card */
  size?: ModalSize;
  /** Legacy prop: maps to size if it's a valid ModalSize */
  maxWidth?: ModalSize;
  /** If false the header section (title bar) is hidden */
  showHeader?: boolean;
  /** Children rendered inside .modal-body */
  children?: React.ReactNode;
  /** Optional footer content rendered inside .modal-footer */
  footer?: React.ReactNode;
  /** Extra className applied to the modal card */
  cardClassName?: string;
  /** If true, clicking the backdrop does NOT close the modal */
  disableBackdropClose?: boolean;
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'modal-card-sm',
  md: '',
  lg: 'modal-card-lg',
  xl: 'modal-card-xl',
  '2xl': 'modal-card-2xl',
  '3xl': 'modal-card-3xl',
  '4xl': 'modal-card-4xl',
};

/**
 * Modal
 *
 * Canonical IMS modal wrapper — uses the `.modal-*` CSS design system that
 * matches the BookDemoModal style: blurred dark backdrop, centred card with
 * rounded-[20px] corners, consistent header / body / footer regions.
 *
 * Usage:
 * ```tsx
 * <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Record" icon={<Edit size={18}/>}>
 *   <form>…</form>
 * </Modal>
 * ```
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconVariant = 'info',
  size = 'md',
  maxWidth,
  showHeader = true,
  children,
  footer,
  cardClassName = '',
  disableBackdropClose = false,
}) => {
  const effectiveSize = maxWidth || size;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ── */
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={disableBackdropClose ? undefined : onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? 'ims-modal-title' : undefined}
        >
          {/* ── Card ── */}
          <motion.div
            className={`modal-card ${SIZE_CLASS[effectiveSize]} ${cardClassName}`}
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            {showHeader && (title || icon) && (
              <div className="modal-header">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className={`modal-icon-box ${iconVariant}`}>
                      {icon}
                    </div>
                  )}
                  {(title || subtitle) && (
                    <div>
                      {title && (
                        <p className="modal-title" id="ims-modal-title">
                          {title}
                        </p>
                      )}
                      {subtitle && (
                        <p className="modal-subtitle">{subtitle}</p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="modal-close-btn"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* ── Body ── */}
            {children && (
              <div className="modal-body">
                {children}
              </div>
            )}

            {/* ── Footer ── */}
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
