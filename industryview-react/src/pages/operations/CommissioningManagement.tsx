import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { commissioningApi, projectsApi } from '../../services';
import type { CommissioningSystem, PunchListItem, CommissioningCertificate } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Settings, ClipboardList, Award } from 'lucide-react';

// ---------------------------------------------------------------------------
// Status color maps
// ---------------------------------------------------------------------------

const SYSTEM_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pendente:     { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Pendente' },
  em_andamento: { bg: '#dbeafe', color: '#1d4ed8', label: 'Em Andamento' },
  concluido:    { bg: '#dcfce7', color: '#16a34a', label: 'Concluido' },
  reprovado:    { bg: '#fee2e2', color: '#dc2626', label: 'Reprovado' },
};

const PUNCH_PRIORITY_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  A: { bg: '#fee2e2', color: '#dc2626', label: 'Alta (A)' },
  B: { bg: '#fef9c3', color: '#a16207', label: 'Media (B)' },
  C: { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Baixa (C)' },
};

const _PUNCH_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pendente:     { bg: '#fee2e2', color: '#dc2626', label: 'Pendente' },
  em_andamento: { bg: '#dbeafe', color: '#1d4ed8', label: 'Em Andamento' },
  concluido:    { bg: '#dcfce7', color: '#16a34a', label: 'Concluido' },
  reprovado:    { bg: '#fef9c3', color: '#a16207', label: 'Reprovado' },
};

const CERT_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pendente: { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Pendente' },
  emitido:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Emitido' },
  aprovado: { bg: '#dcfce7', color: '#16a34a', label: 'Aprovado' },
};

// Reverse map: A/B/C -> textual for edit modal
const PRIORITY_REVERSE: Record<string, string> = { A: 'alta', B: 'media', C: 'baixa' };

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

const errorBorder = { border: '1.5px solid var(--color-error, #C0392B)' };
const errorText: React.CSSProperties = { color: 'var(--color-error, #C0392B)', fontSize: '12px', marginTop: '4px' };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface SystemExpanded {
  punchList: PunchListItem[];
  certificates: CommissioningCertificate[];
  punchLoading: boolean;
  certLoading: boolean;
  activeSection: 'punch' | 'certificates';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommissioningManagement() {
  const { t: _t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(26);
  }, []);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Systems list
  const [systems, setSystems] = useState<CommissioningSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Expanded system
  const [expandedSystemId, setExpandedSystemId] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<SystemExpanded | null>(null);

  // System modal
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<CommissioningSystem | null>(null);
  const [systemName, setSystemName] = useState('');
  const [systemCode, setSystemCode] = useState('');
  const [systemDescription, setSystemDescription] = useState('');
  const [systemPlannedDate, setSystemPlannedDate] = useState('');
  const [systemStatus, setSystemStatus] = useState('');
  const [systemProjectId, setSystemProjectId] = useState<number | null>(null);
  const [modalProjects, setModalProjects] = useState<{ id: number; name: string }[]>([]);
  const [systemModalLoading, setSystemModalLoading] = useState(false);
  const [systemErrors, setSystemErrors] = useState<Record<string, string>>({});

  // Delete confirms
  const [deleteSystemConfirm, setDeleteSystemConfirm] = useState<number | null>(null);
  const [deletePunchConfirm, setDeletePunchConfirm] = useState<number | null>(null);
  const [deleteCertConfirm, setDeleteCertConfirm] = useState<number | null>(null);

  // Punch modal
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [editingPunch, setEditingPunch] = useState<PunchListItem | null>(null);
  const [punchSystemId, setPunchSystemId] = useState<number | null>(null);
  const [punchDescription, setPunchDescription] = useState('');
  const [punchPriority, setPunchPriority] = useState('');
  const [punchResponsible, setPunchResponsible] = useState('');
  const [punchDueDate, setPunchDueDate] = useState('');
  const [punchModalLoading, setPunchModalLoading] = useState(false);
  const [punchErrors, setPunchErrors] = useState<Record<string, string>>({});

  // Certificate modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState<CommissioningCertificate | null>(null);
  const [certSystemId, setCertSystemId] = useState<number | null>(null);
  const [certType, setCertType] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [certIssuedDate, setCertIssuedDate] = useState('');
  const [certFileUrl, setCertFileUrl] = useState('');
  const [certModalLoading, setCertModalLoading] = useState(false);
  const [certErrors, setCertErrors] = useState<Record<string, string>>({});

  // ------------------------------------------------------------------
  // Load systems
  // ------------------------------------------------------------------
  const loadSystems = useCallback(async () => {
    setLoading(true);
    try {
      const params: { projects_id?: number; page: number; per_page: number } = { page, per_page: perPage };
      if (projectsInfo) params.projects_id = projectsInfo.id;
      const data = await commissioningApi.listSystems(params);
      setSystems(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load systems:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage]);

  useEffect(() => { loadSystems(); }, [loadSystems]);

  // ------------------------------------------------------------------
  // Expand / collapse
  // ------------------------------------------------------------------
  const handleToggleSystem = async (system: CommissioningSystem) => {
    if (expandedSystemId === system.id) {
      setExpandedSystemId(null);
      setExpandedData(null);
      return;
    }
    setExpandedSystemId(system.id);
    setExpandedData({ punchList: [], certificates: [], punchLoading: true, certLoading: true, activeSection: 'punch' });
    try {
      const [punchList, certificates] = await Promise.all([
        commissioningApi.getPunchList(system.id),
        commissioningApi.getCertificates(system.id),
      ]);
      setExpandedData((prev) => prev ? { ...prev, punchList, certificates, punchLoading: false, certLoading: false } : null);
    } catch (err) {
      console.error('Failed to load system detail:', err);
      setExpandedData((prev) => prev ? { ...prev, punchLoading: false, certLoading: false } : null);
    }
  };

  const setActiveSection = (section: 'punch' | 'certificates') => {
    setExpandedData((prev) => prev ? { ...prev, activeSection: section } : null);
  };

  const refreshPunchList = async (systemId: number) => {
    const punchList = await commissioningApi.getPunchList(systemId);
    setExpandedData((prev) => prev ? { ...prev, punchList } : null);
  };

  const refreshCertificates = async (systemId: number) => {
    const certificates = await commissioningApi.getCertificates(systemId);
    setExpandedData((prev) => prev ? { ...prev, certificates } : null);
  };

  // ------------------------------------------------------------------
  // System CRUD
  // ------------------------------------------------------------------
  const loadModalProjects = async () => {
    try {
      const data = await projectsApi.queryAllProjects({ per_page: 100 });
      setModalProjects((data.items || []).map((p) => ({ id: p.id, name: p.name })));
    } catch { /* ignore */ }
  };

  const openCreateSystem = () => {
    setEditingSystem(null);
    setSystemName('');
    setSystemCode('');
    setSystemDescription('');
    setSystemPlannedDate('');
    setSystemStatus('');
    setSystemProjectId(projectsInfo?.id ?? null);
    setSystemErrors({});
    loadModalProjects();
    setShowSystemModal(true);
  };

  const openEditSystem = (system: CommissioningSystem) => {
    setEditingSystem(system);
    setSystemErrors({});
    setSystemName(system.system_name);
    setSystemCode(system.system_code || '');
    setSystemDescription(system.description || '');
    setSystemPlannedDate(system.planned_date ? system.planned_date.substring(0, 10) : '');
    setSystemStatus(system.status);
    setSystemProjectId(system.projects_id);
    setShowSystemModal(true);
  };

  const handleSaveSystem = async () => {
    const errs: Record<string, string> = {};
    if (!editingSystem && !systemProjectId) errs.project = 'Selecione um projeto';
    if (!systemName.trim()) errs.name = 'Nome do sistema e obrigatorio';
    if (Object.keys(errs).length > 0) { setSystemErrors(errs); return; }
    setSystemErrors({});
    setSystemModalLoading(true);
    try {
      if (editingSystem) {
        await commissioningApi.updateSystem(editingSystem.id, {
          name: systemName.trim(),
          description: systemDescription.trim() || undefined,
          status: systemStatus || undefined,
          planned_completion_date: systemPlannedDate || undefined,
        });
      } else {
        await commissioningApi.createSystem({
          projects_id: systemProjectId!,
          name: systemName.trim(),
          system_code: systemCode.trim() || undefined,
          description: systemDescription.trim() || undefined,
          planned_completion_date: systemPlannedDate || undefined,
        });
      }
      setShowSystemModal(false);
      await loadSystems();
      showToast(editingSystem ? 'Sistema atualizado.' : 'Sistema criado.');
    } catch (err) {
      console.error('Failed to save system:', err);
      showToast('Erro ao salvar sistema.', 'error');
    } finally {
      setSystemModalLoading(false);
    }
  };

  const handleDeleteSystem = async (id: number) => {
    try {
      await commissioningApi.deleteSystem(id);
      if (expandedSystemId === id) { setExpandedSystemId(null); setExpandedData(null); }
      await loadSystems();
      showToast('Sistema excluido.');
    } catch (err) {
      console.error('Failed to delete system:', err);
      showToast('Erro ao excluir sistema.', 'error');
    }
    setDeleteSystemConfirm(null);
  };

  // ------------------------------------------------------------------
  // Punch list CRUD
  // ------------------------------------------------------------------
  const handleUpdatePunchStatus = async (itemId: number, status: string) => {
    if (!expandedSystemId) return;
    try {
      await commissioningApi.updatePunchListItem(itemId, { status });
      await refreshPunchList(expandedSystemId);
      showToast('Status do item atualizado.');
    } catch (err) {
      console.error('Failed to update punch status:', err);
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const openCreatePunch = (systemId: number) => {
    setEditingPunch(null);
    setPunchSystemId(systemId);
    setPunchDescription('');
    setPunchPriority('');
    setPunchResponsible('');
    setPunchDueDate('');
    setPunchErrors({});
    setShowPunchModal(true);
  };

  const openEditPunch = (item: PunchListItem) => {
    setEditingPunch(item);
    setPunchErrors({});
    setPunchSystemId(item.commissioning_systems_id);
    setPunchDescription(item.description);
    setPunchPriority(item.priority ? (PRIORITY_REVERSE[item.priority] ?? '') : '');
    setPunchResponsible(item.responsible || '');
    setPunchDueDate(item.due_date ? item.due_date.substring(0, 10) : '');
    setShowPunchModal(true);
  };

  const handleSavePunch = async () => {
    const errs: Record<string, string> = {};
    if (!punchDescription.trim()) errs.description = 'Descricao e obrigatoria';
    if (Object.keys(errs).length > 0) { setPunchErrors(errs); return; }
    setPunchErrors({});
    setPunchModalLoading(true);
    try {
      if (editingPunch) {
        await commissioningApi.updatePunchListItem(editingPunch.id, {
          description: punchDescription.trim(),
          priority: punchPriority || undefined,
          responsible_name: punchResponsible.trim() || undefined,
          due_date: punchDueDate || undefined,
        });
        showToast('Item atualizado.');
      } else {
        await commissioningApi.createPunchListItem(punchSystemId!, {
          description: punchDescription.trim(),
          priority: punchPriority || undefined,
          responsible_name: punchResponsible.trim() || undefined,
          due_date: punchDueDate || undefined,
        });
        showToast('Item adicionado.');
      }
      setShowPunchModal(false);
      if (expandedSystemId) await refreshPunchList(expandedSystemId);
    } catch (err) {
      console.error('Failed to save punch item:', err);
      showToast('Erro ao salvar item.', 'error');
    } finally {
      setPunchModalLoading(false);
    }
  };

  const handleDeletePunch = async (id: number) => {
    try {
      await commissioningApi.deletePunchListItem(id);
      if (expandedSystemId) await refreshPunchList(expandedSystemId);
      showToast('Item excluido.');
    } catch (err) {
      console.error('Failed to delete punch item:', err);
      showToast('Erro ao excluir item.', 'error');
    }
    setDeletePunchConfirm(null);
  };

  // ------------------------------------------------------------------
  // Certificate CRUD
  // ------------------------------------------------------------------
  const openCreateCert = (systemId: number) => {
    setEditingCert(null);
    setCertSystemId(systemId);
    setCertType('');
    setCertNumber('');
    setCertIssuedDate('');
    setCertFileUrl('');
    setCertErrors({});
    setShowCertModal(true);
  };

  const openEditCert = (cert: CommissioningCertificate) => {
    setEditingCert(cert);
    setCertErrors({});
    setCertSystemId(cert.commissioning_systems_id);
    setCertType(cert.certificate_type);
    setCertNumber(cert.certificate_number || '');
    setCertIssuedDate(cert.issued_date ? cert.issued_date.substring(0, 10) : '');
    setCertFileUrl(cert.file_url || '');
    setShowCertModal(true);
  };

  const handleSaveCert = async () => {
    const errs: Record<string, string> = {};
    if (!certType.trim()) errs.type = 'Tipo do certificado e obrigatorio';
    if (Object.keys(errs).length > 0) { setCertErrors(errs); return; }
    setCertErrors({});
    setCertModalLoading(true);
    try {
      if (editingCert) {
        await commissioningApi.updateCertificate(editingCert.id, {
          certificate_type: certType.trim(),
          certificate_number: certNumber.trim() || undefined,
          issued_at: certIssuedDate || undefined,
          file_url: certFileUrl.trim() || undefined,
        });
        showToast('Certificado atualizado.');
      } else {
        await commissioningApi.createCertificate(certSystemId!, {
          certificate_type: certType.trim(),
          certificate_number: certNumber.trim() || undefined,
          issued_at: certIssuedDate || undefined,
          file_url: certFileUrl.trim() || undefined,
        });
        showToast('Certificado adicionado.');
      }
      setShowCertModal(false);
      if (expandedSystemId) await refreshCertificates(expandedSystemId);
    } catch (err) {
      console.error('Failed to save certificate:', err);
      showToast('Erro ao salvar certificado.', 'error');
    } finally {
      setCertModalLoading(false);
    }
  };

  const handleDeleteCert = async (id: number) => {
    try {
      await commissioningApi.deleteCertificate(id);
      if (expandedSystemId) await refreshCertificates(expandedSystemId);
      showToast('Certificado excluido.');
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      showToast('Erro ao excluir certificado.', 'error');
    }
    setDeleteCertConfirm(null);
  };

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------
  return (
    <div>
      <PageHeader
        title="Comissionamento"
        subtitle="Controle de testes, pendencias e certificacoes dos sistemas"
        breadcrumb={projectsInfo ? `${projectsInfo.name} / Comissionamento` : 'Comissionamento'}
        actions={
          <button className="btn btn-primary" onClick={openCreateSystem}>
            <Plus size={18} /> Novo Sistema
          </button>
        }
      />
      <ProjectFilterDropdown />

      {loading ? (
        <LoadingSpinner />
      ) : systems.length === 0 ? (
        <EmptyState
          message="Nenhum sistema de comissionamento encontrado."
          action={
            <button className="btn btn-primary" onClick={openCreateSystem}>
              <Plus size={18} /> Novo Sistema
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nome</th>
                <th>Projeto</th>
                <th>Status</th>
                <th>Conclusao</th>
                <th>Punch List</th>
                <th>Certificados</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {systems.map((system) => (
                <>
                  <motion.tr key={system.id} variants={tableRowVariants}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                        {system.system_code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>{system.system_name}</span>
                      </div>
                    </td>
                    <td>{system.projects?.name || '-'}</td>
                    <td>
                      <StatusBadge status={system.status} colorMap={SYSTEM_STATUS_COLORS} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--color-alternate)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(system as any).completion_percent ?? 0}%`, backgroundColor: 'var(--color-primary)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                          {(system as any).completion_percent ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                        {system._count?.punch_list ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        {system._count?.certificates ?? 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-icon" title="Editar" onClick={() => openEditSystem(system)}>
                          <Edit size={16} color="var(--color-secondary-text)" />
                        </button>
                        <button className="btn btn-icon" title="Excluir" onClick={() => setDeleteSystemConfirm(system.id)}>
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                        <button className="btn btn-icon" title="Expandir" onClick={() => handleToggleSystem(system)}>
                          {expandedSystemId === system.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {expandedSystemId === system.id && expandedData && (
                    <tr key={`${system.id}-detail`}>
                      <td colSpan={8} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                        <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                          {/* Tabs */}
                          <div style={{ borderBottom: '2px solid var(--color-alternate)', display: 'flex', gap: '0', marginBottom: '16px' }}>
                            <button
                              className="btn"
                              style={{
                                borderRadius: 0,
                                borderBottom: expandedData.activeSection === 'punch' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                marginBottom: '-2px',
                                fontWeight: expandedData.activeSection === 'punch' ? 600 : 400,
                                color: expandedData.activeSection === 'punch' ? 'var(--color-primary)' : 'var(--color-secondary-text)',
                                padding: '8px 16px', fontSize: '13px', backgroundColor: 'transparent',
                              }}
                              onClick={() => setActiveSection('punch')}
                            >
                              <ClipboardList size={14} /> Punch List
                            </button>
                            <button
                              className="btn"
                              style={{
                                borderRadius: 0,
                                borderBottom: expandedData.activeSection === 'certificates' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                marginBottom: '-2px',
                                fontWeight: expandedData.activeSection === 'certificates' ? 600 : 400,
                                color: expandedData.activeSection === 'certificates' ? 'var(--color-primary)' : 'var(--color-secondary-text)',
                                padding: '8px 16px', fontSize: '13px', backgroundColor: 'transparent',
                              }}
                              onClick={() => setActiveSection('certificates')}
                            >
                              <Award size={14} /> Certificados
                            </button>
                          </div>

                          {/* Punch List */}
                          {expandedData.activeSection === 'punch' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => openCreatePunch(system.id)}>
                                  <Plus size={14} /> Adicionar Item
                                </button>
                              </div>
                              {expandedData.punchLoading ? (
                                <LoadingSpinner />
                              ) : expandedData.punchList.length === 0 ? (
                                <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>Nenhum item no punch list.</p>
                              ) : (
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>#</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descricao</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Prioridade</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Responsavel</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Vencimento</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Acoes</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedData.punchList.map((item) => (
                                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                                        <td style={{ padding: '8px 12px', color: 'var(--color-secondary-text)' }}>{item.item_number}</td>
                                        <td style={{ padding: '8px 12px' }}>{item.description}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <StatusBadge status={item.priority} colorMap={PUNCH_PRIORITY_COLORS} />
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <SearchableSelect
                                            options={[
                                              { value: 'pendente', label: 'Pendente' },
                                              { value: 'em_andamento', label: 'Em Andamento' },
                                              { value: 'concluido', label: 'Concluido' },
                                              { value: 'reprovado', label: 'Reprovado' },
                                            ]}
                                            value={item.status}
                                            onChange={(val) => handleUpdatePunchStatus(item.id, String(val ?? 'pendente'))}
                                            style={{ fontSize: '12px', minWidth: '130px' }}
                                          />
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>{item.responsible || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>{formatDate(item.due_date)}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn btn-icon" title="Editar" onClick={() => openEditPunch(item)}>
                                              <Edit size={14} color="var(--color-secondary-text)" />
                                            </button>
                                            <button className="btn btn-icon" title="Excluir" onClick={() => setDeletePunchConfirm(item.id)}>
                                              <Trash2 size={14} color="var(--color-error)" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}

                          {/* Certificates */}
                          {expandedData.activeSection === 'certificates' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => openCreateCert(system.id)}>
                                  <Plus size={14} /> Adicionar Certificado
                                </button>
                              </div>
                              {expandedData.certLoading ? (
                                <LoadingSpinner />
                              ) : expandedData.certificates.length === 0 ? (
                                <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>Nenhum certificado cadastrado.</p>
                              ) : (
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Numero</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Data Emissao</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Arquivo</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Acoes</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedData.certificates.map((cert) => (
                                      <tr key={cert.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{cert.certificate_type}</td>
                                        <td style={{ padding: '8px 12px' }}>{cert.certificate_number || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <StatusBadge status={cert.status} colorMap={CERT_STATUS_COLORS} />
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>{formatDate(cert.issued_date)}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          {cert.file_url ? (
                                            <a href={cert.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Ver arquivo</a>
                                          ) : '-'}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <div style={{ display: 'flex', gap: '4px' }}>
                                            <button className="btn btn-icon" title="Editar" onClick={() => openEditCert(cert)}>
                                              <Edit size={14} color="var(--color-secondary-text)" />
                                            </button>
                                            <button className="btn btn-icon" title="Excluir" onClick={() => setDeleteCertConfirm(cert.id)}>
                                              <Trash2 size={14} color="var(--color-error)" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </motion.tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
          />
        </div>
      )}

      {/* Modal: Create/Edit System */}
      {showSystemModal && (
        <div className="modal-backdrop" onClick={() => setShowSystemModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingSystem ? 'Editar Sistema' : 'Novo Sistema'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!editingSystem && (
                <div className="input-group">
                  <label>Projeto <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <SearchableSelect
                    options={modalProjects.map((p) => ({ value: p.id, label: p.name }))}
                    value={systemProjectId ?? undefined}
                    onChange={(val) => { setSystemProjectId(val ? Number(val) : null); setSystemErrors((e) => { const { project, ...rest } = e; return rest; }); }}
                    placeholder="Selecione o projeto"
                    style={systemErrors.project ? errorBorder : undefined}
                  />
                  {systemErrors.project && <span style={errorText}>{systemErrors.project}</span>}
                </div>
              )}
              <div className="input-group">
                <label>Nome do Sistema <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input className="input-field" style={systemErrors.name ? errorBorder : undefined} value={systemName} onChange={(e) => { setSystemName(e.target.value); setSystemErrors((er) => { const { name, ...rest } = er; return rest; }); }} placeholder="Nome do sistema" />
                {systemErrors.name && <span style={errorText}>{systemErrors.name}</span>}
              </div>
              {!editingSystem && (
                <div className="input-group">
                  <label>Codigo do Sistema</label>
                  <input className="input-field" value={systemCode} onChange={(e) => setSystemCode(e.target.value)} placeholder="Ex: SYS-001 (gerado automaticamente se vazio)" />
                </div>
              )}
              <div className="input-group">
                <label>Descricao</label>
                <textarea className="input-field" rows={3} value={systemDescription} onChange={(e) => setSystemDescription(e.target.value)} placeholder="Descricao do sistema..." style={{ resize: 'vertical' }} />
              </div>
              <div className="input-group">
                <label>Data Planejada</label>
                <input type="date" className="input-field" value={systemPlannedDate} onChange={(e) => setSystemPlannedDate(e.target.value)} />
              </div>
              {editingSystem && (
                <div className="input-group">
                  <label>Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'pendente', label: 'Pendente' },
                      { value: 'em_andamento', label: 'Em Andamento' },
                      { value: 'concluido', label: 'Concluido' },
                      { value: 'reprovado', label: 'Reprovado' },
                    ]}
                    value={systemStatus || undefined}
                    onChange={(val) => setSystemStatus(String(val ?? ''))}
                    placeholder="Selecione"
                  />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowSystemModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveSystem} disabled={systemModalLoading}>
                {systemModalLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Punch List Item */}
      {showPunchModal && (
        <div className="modal-backdrop" onClick={() => setShowPunchModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingPunch ? 'Editar Item' : 'Adicionar Item ao Punch List'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Descricao <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input className="input-field" style={punchErrors.description ? errorBorder : undefined} value={punchDescription} onChange={(e) => { setPunchDescription(e.target.value); setPunchErrors((er) => { const { description, ...rest } = er; return rest; }); }} placeholder="Descricao do item" />
                {punchErrors.description && <span style={errorText}>{punchErrors.description}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Prioridade</label>
                  <SearchableSelect
                    options={[
                      { value: 'baixa', label: 'Baixa (C)' },
                      { value: 'media', label: 'Media (B)' },
                      { value: 'alta', label: 'Alta (A)' },
                      { value: 'critica', label: 'Critica (A)' },
                    ]}
                    value={punchPriority || undefined}
                    onChange={(val) => setPunchPriority(String(val ?? ''))}
                    placeholder="Selecione"
                    allowClear
                  />
                </div>
                <div className="input-group">
                  <label>Responsavel</label>
                  <input className="input-field" value={punchResponsible} onChange={(e) => setPunchResponsible(e.target.value)} placeholder="Nome do responsavel" />
                </div>
              </div>
              <div className="input-group">
                <label>Data de Vencimento</label>
                <input type="date" className="input-field" value={punchDueDate} onChange={(e) => setPunchDueDate(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowPunchModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePunch} disabled={punchModalLoading}>
                {punchModalLoading ? <span className="spinner" /> : editingPunch ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Certificate */}
      {showCertModal && (
        <div className="modal-backdrop" onClick={() => setShowCertModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '460px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingCert ? 'Editar Certificado' : 'Adicionar Certificado'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Tipo de Certificado <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input className="input-field" style={certErrors.type ? errorBorder : undefined} value={certType} onChange={(e) => { setCertType(e.target.value); setCertErrors((er) => { const { type, ...rest } = er; return rest; }); }} placeholder="Ex: NR-10, ART, ISO 9001" />
                {certErrors.type && <span style={errorText}>{certErrors.type}</span>}
              </div>
              <div className="input-group">
                <label>Numero do Certificado</label>
                <input className="input-field" value={certNumber} onChange={(e) => setCertNumber(e.target.value)} placeholder="Ex: CERT-001" />
              </div>
              <div className="input-group">
                <label>Data de Emissao</label>
                <input type="date" className="input-field" value={certIssuedDate} onChange={(e) => setCertIssuedDate(e.target.value)} />
              </div>
              <div className="input-group">
                <label>URL do Arquivo</label>
                <input className="input-field" value={certFileUrl} onChange={(e) => setCertFileUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveCert} disabled={certModalLoading}>
                {certModalLoading ? <span className="spinner" /> : editingCert ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirms */}
      {deleteSystemConfirm !== null && (
        <ConfirmModal title="Excluir Sistema" message="Tem certeza que deseja excluir este sistema?" onConfirm={() => handleDeleteSystem(deleteSystemConfirm)} onCancel={() => setDeleteSystemConfirm(null)} />
      )}
      {deletePunchConfirm !== null && (
        <ConfirmModal title="Excluir Item" message="Tem certeza que deseja excluir este item do punch list?" onConfirm={() => handleDeletePunch(deletePunchConfirm)} onCancel={() => setDeletePunchConfirm(null)} />
      )}
      {deleteCertConfirm !== null && (
        <ConfirmModal title="Excluir Certificado" message="Tem certeza que deseja excluir este certificado?" onConfirm={() => handleDeleteCert(deleteCertConfirm)} onCancel={() => setDeleteCertConfirm(null)} />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: '20px', right: '24px', zIndex: 2000,
              padding: '12px 20px', borderRadius: '8px', fontWeight: 500, fontSize: '14px',
              backgroundColor: toast.type === 'success' ? 'var(--color-success, #028F58)' : 'var(--color-error, #C0392B)',
              color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
