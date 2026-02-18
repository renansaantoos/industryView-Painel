import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import { planningApi } from '../../services';
import type { CompanyModule, ScheduleBaseline, TaskDependency, CurveSData } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Trash2,
  BarChart2,
  Layers,
  GitBranch,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';

type ActiveTab = 'modules' | 'baselines' | 'dependencies';

const MODULE_LABELS: Record<CompanyModule['module_name'], string> = {
  CORE: 'Core',
  SSMA: 'SSMA',
  QUALIDADE: 'Qualidade',
  PLANEJAMENTO: 'Planejamento',
  CONTRATOS: 'Contratos',
};

const DEPENDENCY_TYPE_LABELS: Record<TaskDependency['dependency_type'], string> = {
  FS: 'Finish-to-Start (FS)',
  FF: 'Finish-to-Finish (FF)',
  SS: 'Start-to-Start (SS)',
  SF: 'Start-to-Finish (SF)',
};

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function PlanningBaseline() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();
  const { user } = useAuth();

  useEffect(() => {
    setNavBarSelection(28);
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('modules');
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Modules tab state ────────────────────────────────────────────────────────
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [togglingModuleId, setTogglingModuleId] = useState<number | null>(null);

  // ── Baselines tab state ──────────────────────────────────────────────────────
  const [baselines, setBaselines] = useState<ScheduleBaseline[]>([]);
  const [baselinesLoading, setBaselinesLoading] = useState(false);
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [baselineName, setBaselineName] = useState('');
  const [baselineDescription, setBaselineDescription] = useState('');
  const [baselineModalLoading, setBaselineModalLoading] = useState(false);

  // Curve S drawer state
  const [selectedBaseline, setSelectedBaseline] = useState<ScheduleBaseline | null>(null);
  const [curveData, setCurveData] = useState<CurveSData[]>([]);
  const [curveLoading, setCurveLoading] = useState(false);

  // ── Dependencies tab state ───────────────────────────────────────────────────
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [dependenciesLoading, setDependenciesLoading] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);
  const [depPredecessorId, setDepPredecessorId] = useState('');
  const [depSuccessorId, setDepSuccessorId] = useState('');
  const [depType, setDepType] = useState<TaskDependency['dependency_type']>('FS');
  const [depLagDays, setDepLagDays] = useState('0');
  const [depModalLoading, setDepModalLoading] = useState(false);
  const [deleteDepConfirm, setDeleteDepConfirm] = useState<number | null>(null);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Data loaders ─────────────────────────────────────────────────────────────
  const loadModules = useCallback(async () => {
    if (!user?.companyId) return;
    setModulesLoading(true);
    try {
      const data = await planningApi.listCompanyModules({ company_id: user.companyId });
      setModules(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar módulos', 'error');
    } finally {
      setModulesLoading(false);
    }
  }, [user?.companyId, showToast]);

  const loadBaselines = useCallback(async () => {
    if (!projectsInfo) return;
    setBaselinesLoading(true);
    try {
      const data = await planningApi.listBaselines({ projects_id: projectsInfo.id });
      setBaselines(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar baselines', 'error');
    } finally {
      setBaselinesLoading(false);
    }
  }, [projectsInfo, showToast]);

  const loadDependencies = useCallback(async () => {
    if (!projectsInfo) return;
    setDependenciesLoading(true);
    try {
      const data = await planningApi.listDependencies({ projects_id: projectsInfo.id });
      setDependencies(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar dependências', 'error');
    } finally {
      setDependenciesLoading(false);
    }
  }, [projectsInfo, showToast]);

  useEffect(() => {
    if (activeTab === 'modules') loadModules();
    if (activeTab === 'baselines') loadBaselines();
    if (activeTab === 'dependencies') loadDependencies();
  }, [activeTab, loadModules, loadBaselines, loadDependencies]);

  // ── Module toggle ─────────────────────────────────────────────────────────────
  const handleToggleModule = async (mod: CompanyModule) => {
    if (!user?.companyId) return;
    setTogglingModuleId(mod.id);
    try {
      await planningApi.updateCompanyModule({
        company_id: user.companyId,
        module_name: mod.module_name,
        is_active: !mod.is_active,
      });
      showToast(
        `Módulo ${MODULE_LABELS[mod.module_name]} ${!mod.is_active ? 'ativado' : 'desativado'} com sucesso`,
        'success',
      );
      loadModules();
    } catch {
      showToast('Erro ao alterar módulo', 'error');
    } finally {
      setTogglingModuleId(null);
    }
  };

  // ── Baseline create ───────────────────────────────────────────────────────────
  const handleOpenBaselineModal = () => {
    setBaselineName('');
    setBaselineDescription('');
    setShowBaselineModal(true);
  };

  const handleCreateBaseline = async () => {
    if (!projectsInfo || !baselineName.trim()) return;
    setBaselineModalLoading(true);
    try {
      await planningApi.createBaseline({
        projects_id: projectsInfo.id,
        name: baselineName.trim(),
        description: baselineDescription.trim() || undefined,
      });
      setShowBaselineModal(false);
      showToast('Baseline criada com sucesso', 'success');
      loadBaselines();
    } catch {
      showToast('Erro ao criar baseline', 'error');
    } finally {
      setBaselineModalLoading(false);
    }
  };

  // ── Curve S ───────────────────────────────────────────────────────────────────
  const handleViewCurveS = async (baseline: ScheduleBaseline) => {
    if (!projectsInfo) return;
    setSelectedBaseline(baseline);
    setCurveData([]);
    setCurveLoading(true);
    try {
      const data = await planningApi.getCurveS(baseline.id, { projects_id: projectsInfo.id });
      setCurveData(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar dados da Curva S', 'error');
    } finally {
      setCurveLoading(false);
    }
  };

  // ── Dependency create ─────────────────────────────────────────────────────────
  const handleOpenDepModal = () => {
    setDepPredecessorId('');
    setDepSuccessorId('');
    setDepType('FS');
    setDepLagDays('0');
    setShowDepModal(true);
  };

  const handleCreateDependency = async () => {
    if (!projectsInfo || !depPredecessorId || !depSuccessorId) return;
    setDepModalLoading(true);
    try {
      await planningApi.createDependency({
        projects_id: projectsInfo.id,
        predecessor_backlog_id: Number(depPredecessorId),
        successor_backlog_id: Number(depSuccessorId),
        dependency_type: depType,
        lag_days: Number(depLagDays),
      });
      setShowDepModal(false);
      showToast('Dependência criada com sucesso', 'success');
      loadDependencies();
    } catch {
      showToast('Erro ao criar dependência', 'error');
    } finally {
      setDepModalLoading(false);
    }
  };

  const handleDeleteDependency = async (id: number) => {
    try {
      await planningApi.deleteDependency(id);
      showToast('Dependência excluída com sucesso', 'success');
      loadDependencies();
    } catch {
      showToast('Erro ao excluir dependência', 'error');
    }
    setDeleteDepConfirm(null);
  };

  // ── Curve S chart helpers ─────────────────────────────────────────────────────
  const maxCurveValue = curveData.length > 0
    ? Math.max(...curveData.map((d) => Math.max(d.planned_percent, d.actual_percent)), 100)
    : 100;

  // ── Tab button style helper ───────────────────────────────────────────────────
  const tabStyle = (tab: ActiveTab) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  // ── Project guard message (for project-scoped tabs) ───────────────────────────
  const renderNoProjectMessage = () => (
    <EmptyState message="Selecione um projeto para visualizar este conteúdo." />
  );

  return (
    <div>
      <PageHeader
        title="Planejamento & Baseline"
        subtitle="Gerencie módulos da empresa, baselines de cronograma e dependências entre tarefas"
        breadcrumb="Planejamento"
      />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '24px',
          borderBottom: '2px solid var(--color-alternate)',
        }}
      >
        <button onClick={() => setActiveTab('modules')} style={tabStyle('modules')}>
          <Layers size={16} />
          Módulos da Empresa
        </button>
        <button onClick={() => setActiveTab('baselines')} style={tabStyle('baselines')}>
          <BarChart2 size={16} />
          Baselines
        </button>
        <button onClick={() => setActiveTab('dependencies')} style={tabStyle('dependencies')}>
          <GitBranch size={16} />
          Dependências
        </button>
      </div>

      {/* ── Tab: Modules ──────────────────────────────────────────────────────── */}
      {activeTab === 'modules' && (
        <>
          {modulesLoading ? (
            <LoadingSpinner />
          ) : modules.length === 0 ? (
            <EmptyState message="Nenhum módulo encontrado para esta empresa." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Módulo</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ width: '80px' }}>Ativo</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {modules.map((mod) => (
                    <motion.tr key={mod.id} variants={tableRowVariants}>
                      <td style={{ fontWeight: 500 }}>{MODULE_LABELS[mod.module_name]}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: mod.is_active
                              ? 'var(--color-status-04)'
                              : 'var(--color-status-05)',
                            color: mod.is_active
                              ? 'var(--color-success)'
                              : 'var(--color-error)',
                          }}
                        >
                          {mod.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-icon"
                          title={mod.is_active ? 'Desativar módulo' : 'Ativar módulo'}
                          disabled={togglingModuleId === mod.id}
                          onClick={() => handleToggleModule(mod)}
                        >
                          {mod.is_active ? (
                            <ToggleRight size={22} color="var(--color-success)" />
                          ) : (
                            <ToggleLeft size={22} color="var(--color-secondary-text)" />
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Baselines ────────────────────────────────────────────────────── */}
      {activeTab === 'baselines' && (
        <>
          {!projectsInfo ? (
            renderNoProjectMessage()
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '16px',
                }}
              >
                <button className="btn btn-primary" onClick={handleOpenBaselineModal}>
                  <Plus size={18} />
                  Nova Baseline
                </button>
              </div>

              {baselinesLoading ? (
                <LoadingSpinner />
              ) : baselines.length === 0 ? (
                <EmptyState
                  message="Nenhuma baseline criada para este projeto."
                  action={
                    <button className="btn btn-primary" onClick={handleOpenBaselineModal}>
                      <Plus size={18} />
                      Nova Baseline
                    </button>
                  }
                />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Data do Snapshot</th>
                        <th>Criado por</th>
                        <th style={{ width: '100px' }}>Ações</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {baselines.map((baseline) => (
                        <motion.tr key={baseline.id} variants={tableRowVariants}>
                          <td style={{ fontWeight: 500 }}>{baseline.name}</td>
                          <td style={{ color: 'var(--color-secondary-text)' }}>
                            {baseline.description || '-'}
                          </td>
                          <td style={{ color: 'var(--color-secondary-text)' }}>
                            {baseline.snapshot_date
                              ? new Date(baseline.snapshot_date).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td style={{ color: 'var(--color-secondary-text)' }}>
                            {baseline.creator_name || baseline.created_by}
                          </td>
                          <td>
                            <button
                              className="btn btn-icon"
                              title="Ver Curva S"
                              onClick={() => handleViewCurveS(baseline)}
                            >
                              <BarChart2 size={16} color="var(--color-primary)" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Tab: Dependencies ─────────────────────────────────────────────────── */}
      {activeTab === 'dependencies' && (
        <>
          {!projectsInfo ? (
            renderNoProjectMessage()
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '16px',
                }}
              >
                <button className="btn btn-primary" onClick={handleOpenDepModal}>
                  <Plus size={18} />
                  Nova Dependência
                </button>
              </div>

              {dependenciesLoading ? (
                <LoadingSpinner />
              ) : dependencies.length === 0 ? (
                <EmptyState
                  message="Nenhuma dependência cadastrada para este projeto."
                  action={
                    <button className="btn btn-primary" onClick={handleOpenDepModal}>
                      <Plus size={18} />
                      Nova Dependência
                    </button>
                  }
                />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Predecessor</th>
                        <th>Sucessor</th>
                        <th>Tipo</th>
                        <th>Lag (dias)</th>
                        <th style={{ width: '80px' }}>Ações</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {dependencies.map((dep) => (
                        <motion.tr key={dep.id} variants={tableRowVariants}>
                          <td style={{ fontWeight: 500 }}>
                            {dep.predecessor_name || `#${dep.predecessor_backlog_id}`}
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {dep.successor_name || `#${dep.successor_backlog_id}`}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: 'var(--color-tertiary-bg)',
                                color: 'var(--color-primary)',
                              }}
                            >
                              {dep.dependency_type}
                            </span>
                          </td>
                          <td style={{ color: 'var(--color-secondary-text)' }}>
                            {dep.lag_days ?? 0}
                          </td>
                          <td>
                            <button
                              className="btn btn-icon"
                              title="Excluir dependência"
                              onClick={() => setDeleteDepConfirm(dep.id)}
                            >
                              <Trash2 size={16} color="var(--color-error)" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Modal: Create Baseline ────────────────────────────────────────────── */}
      {showBaselineModal && (
        <div className="modal-backdrop" onClick={() => setShowBaselineModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', minWidth: '400px', maxWidth: '480px' }}
          >
            <h3 style={{ marginBottom: '20px' }}>Nova Baseline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Nome *</label>
                <input
                  className="input-field"
                  placeholder="Ex.: Baseline Aprovada v1"
                  value={baselineName}
                  onChange={(e) => setBaselineName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <textarea
                  className="input-field"
                  placeholder="Descrição opcional"
                  rows={3}
                  value={baselineDescription}
                  onChange={(e) => setBaselineDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '20px',
              }}
            >
              <button className="btn btn-secondary" onClick={() => setShowBaselineModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateBaseline}
                disabled={baselineModalLoading || !baselineName.trim()}
              >
                {baselineModalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Create Dependency ──────────────────────────────────────────── */}
      {showDepModal && (
        <div className="modal-backdrop" onClick={() => setShowDepModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', minWidth: '400px', maxWidth: '480px' }}
          >
            <h3 style={{ marginBottom: '20px' }}>Nova Dependência</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>ID do Predecessor (Backlog) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Ex.: 42"
                  min={1}
                  value={depPredecessorId}
                  onChange={(e) => setDepPredecessorId(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>ID do Sucessor (Backlog) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Ex.: 43"
                  min={1}
                  value={depSuccessorId}
                  onChange={(e) => setDepSuccessorId(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Tipo de Dependência</label>
                <select
                  className="select-field"
                  value={depType}
                  onChange={(e) =>
                    setDepType(e.target.value as TaskDependency['dependency_type'])
                  }
                >
                  {Object.entries(DEPENDENCY_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Lag (dias)</label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  value={depLagDays}
                  onChange={(e) => setDepLagDays(e.target.value)}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '20px',
              }}
            >
              <button className="btn btn-secondary" onClick={() => setShowDepModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateDependency}
                disabled={depModalLoading || !depPredecessorId || !depSuccessorId}
              >
                {depModalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Curve S ────────────────────────────────────────────────────── */}
      {selectedBaseline && (
        <div className="modal-backdrop" onClick={() => setSelectedBaseline(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', minWidth: '560px', maxWidth: '800px', width: '90vw' }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ marginBottom: '2px' }}>Curva S — {selectedBaseline.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                  Planejado vs. Realizado (% acumulado)
                </span>
              </div>
              <button
                className="btn btn-icon"
                onClick={() => setSelectedBaseline(null)}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: 'var(--color-primary)',
                  }}
                />
                <span>Planejado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: 'var(--color-success)',
                  }}
                />
                <span>Realizado</span>
              </div>
            </div>

            {/* Chart */}
            {curveLoading ? (
              <LoadingSpinner />
            ) : curveData.length === 0 ? (
              <EmptyState message="Sem dados de Curva S para esta baseline." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px',
                          color: 'var(--color-secondary-text)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Data
                      </th>
                      <th
                        style={{
                          padding: '8px',
                          color: 'var(--color-secondary-text)',
                          fontWeight: 500,
                          width: '100%',
                        }}
                        colSpan={2}
                      >
                        Percentual Acumulado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {curveData.map((point) => (
                      <tr
                        key={point.date}
                        style={{ borderTop: '1px solid var(--color-alternate)' }}
                      >
                        <td
                          style={{
                            padding: '8px',
                            whiteSpace: 'nowrap',
                            color: 'var(--color-secondary-text)',
                          }}
                        >
                          {new Date(point.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '8px', width: '100%' }}>
                          {/* Planned bar */}
                          <div
                            style={{
                              marginBottom: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: '10px',
                                background: 'var(--color-alternate)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${(point.planned_percent / maxCurveValue) * 100}%`,
                                  background: 'var(--color-primary)',
                                  borderRadius: '4px',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                            <span
                              style={{
                                minWidth: '40px',
                                fontSize: '12px',
                                color: 'var(--color-primary)',
                              }}
                            >
                              {point.planned_percent.toFixed(1)}%
                            </span>
                          </div>
                          {/* Actual bar */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: '10px',
                                background: 'var(--color-alternate)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${(point.actual_percent / maxCurveValue) * 100}%`,
                                  background: 'var(--color-success)',
                                  borderRadius: '4px',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                            <span
                              style={{
                                minWidth: '40px',
                                fontSize: '12px',
                                color: 'var(--color-success)',
                              }}
                            >
                              {point.actual_percent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Confirm: Delete Dependency ────────────────────────────────────────── */}
      {deleteDepConfirm !== null && (
        <ConfirmModal
          title="Excluir Dependência"
          message="Tem certeza que deseja excluir esta dependência? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={() => handleDeleteDependency(deleteDepConfirm)}
          onCancel={() => setDeleteDepConfirm(null)}
        />
      )}
    </div>
  );
}
