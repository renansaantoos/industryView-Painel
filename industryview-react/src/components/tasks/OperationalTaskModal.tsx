// @ts-nocheck
import { useState, useCallback, useRef } from 'react';
import { X, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { modalBackdropVariants, modalContentVariants } from '../../lib/motion';
import { projectsApi } from '../../services';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OperationalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  parentBacklog: { id: number; description: string; wbsCode?: string };
  unities: Array<{ id: number; unity: string }>;
  disciplines: Array<{ id: number; discipline: string }>;
}

interface FormState {
  description: string;
  weight: string;
  quantity: string;
  unity_id: string;
  discipline_id: string;
  planned_start_date: string;
  planned_end_date: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const INITIAL_FORM: FormState = {
  description: '',
  weight: '1',
  quantity: '',
  unity_id: '',
  discipline_id: '',
  planned_start_date: '',
  planned_end_date: '',
};

// ── Field helpers ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors';

const selectClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors';

// ── Component ─────────────────────────────────────────────────────────────────

export default function OperationalTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  parentBacklog,
  unities,
  disciplines,
}: OperationalTaskModalProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [descriptionError, setDescriptionError] = useState(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const handleChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (field === 'description') setDescriptionError(false);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    setDescriptionError(false);
    setToast(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!form.description.trim()) {
        setDescriptionError(true);
        return;
      }

      setIsSubmitting(true);
      try {
        await projectsApi.createOperationalTask({
          projects_id: projectId,
          parent_backlog_id: parentBacklog.id,
          description: form.description.trim(),
          weight: form.weight ? Number(form.weight) : undefined,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          unity_id: form.unity_id ? Number(form.unity_id) : undefined,
          discipline_id: form.discipline_id ? Number(form.discipline_id) : undefined,
          planned_start_date: form.planned_start_date || undefined,
          planned_end_date: form.planned_end_date || undefined,
        });

        showToast(t('operationalTask.success'), 'success');
        setForm(INITIAL_FORM);
        onSuccess();
        onClose();
      } catch {
        showToast(t('operationalTask.error'), 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, projectId, parentBacklog.id, onSuccess, onClose, showToast, t],
  );

  const linkedLabel = parentBacklog.wbsCode
    ? `${parentBacklog.wbsCode} — ${parentBacklog.description}`
    : parentBacklog.description;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-2xl"
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t('operationalTask.title')}
              </h2>
              <button
                onClick={handleClose}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-4 px-6 py-5">

                {/* Linked to (read-only) */}
                <Field label={t('operationalTask.linkedTo')}>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                    <Lock size={13} className="shrink-0 text-gray-400" />
                    <span className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {linkedLabel}
                    </span>
                  </div>
                </Field>

                {/* Description */}
                <Field label={t('operationalTask.description')} required>
                  <input
                    type="text"
                    className={`${inputClass} ${descriptionError ? 'border-red-500 focus:ring-red-500/20' : ''}`}
                    value={form.description}
                    onChange={handleChange('description')}
                    placeholder={t('operationalTask.description')}
                    autoFocus
                  />
                  {descriptionError && (
                    <p className="text-xs text-red-500">{t('common.error')}</p>
                  )}
                </Field>

                {/* Weight + Quantity row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('operationalTask.weight')}>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.weight}
                      onChange={handleChange('weight')}
                      min={0}
                      max={1}
                      step="0.01"
                      placeholder="1"
                    />
                  </Field>
                  <Field label={t('operationalTask.quantity')}>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.quantity}
                      onChange={handleChange('quantity')}
                      min={0}
                      step="any"
                      placeholder="—"
                    />
                  </Field>
                </div>

                {/* Unity + Discipline row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('operationalTask.unity')}>
                    <select
                      className={selectClass}
                      value={form.unity_id}
                      onChange={handleChange('unity_id')}
                    >
                      <option value="">—</option>
                      {unities.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.unity}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t('operationalTask.discipline')}>
                    <select
                      className={selectClass}
                      value={form.discipline_id}
                      onChange={handleChange('discipline_id')}
                    >
                      <option value="">—</option>
                      {disciplines.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.discipline}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Planned dates row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('operationalTask.plannedStart')}>
                    <input
                      type="date"
                      className={inputClass}
                      value={form.planned_start_date}
                      onChange={handleChange('planned_start_date')}
                    />
                  </Field>
                  <Field label={t('operationalTask.plannedEnd')}>
                    <input
                      type="date"
                      className={inputClass}
                      value={form.planned_end_date}
                      onChange={handleChange('planned_end_date')}
                    />
                  </Field>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t('common.loading') : t('operationalTask.addTask')}
                </button>
              </div>
            </form>

            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {toast.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
