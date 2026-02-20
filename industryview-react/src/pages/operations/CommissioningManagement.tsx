import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { commissioningApi } from '../../services';
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
  concluido:    { bg: '#dcfce7', color: '#16a34a', label: 'Concluído' },
};

const PUNCH_PRIORITY_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  baixa:  { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Baixa' },
  media:  { bg: '#fef9c3', color: '#a16207', label: 'Média' },
  alta:   { bg: '#ffedd5', color: '#c2410c', label: 'Alta' },
  critica:{ bg: '#fee2e2', color: '#dc2626', label: 'Crítica' },
};

const PUNCH_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  aberto:       { bg: '#fee2e2', color: '#dc2626', label: 'Aberto' },
  em_andamento: { bg: '#dbeafe', color: '#1d4ed8', label: 'Em Andamento' },
  concluido:    { bg: '#dcfce7', color: '#16a34a', label: 'Concluído' },
};

const CERT_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pendente: { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Pendente' },
  emitido:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Emitido' },
  aprovado: { bg: '#dcfce7', color: '#16a34a', label: 'Aprovado' },
};

// ---------------------------------------------------------------------------
// Types for expanded system data
// ---------------------------------------------------------------------------

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
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(26);
  }, []);

  // ------------------------------------------------------------------
  // Systems list state
  // ------------------------------------------------------------------
  const [systems, setSystems] = useState<CommissioningSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ------------------------------------------------------------------
  // Expanded system state (keyed by system id)
  // ------------------------------------------------------------------
  const [expandedSystemId, setExpandedSystemId] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<SystemExpanded | null>(null);

  // ------------------------------------------------------------------
  // Create / Edit system modal
  // ------------------------------------------------------------------
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<CommissioningSystem | null>(null);
  const [systemName, setSystemName] = useState('');
  const [systemDescription, setSystemDescription] = useState('');
  const [systemType, setSystemType] = useState('');
  const [systemModalLoading, setSystemModalLoading] = useState(false);

  // ------------------------------------------------------------------
  // Delete system confirm
  // ------------------------------------------------------------------
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Add punch list item modal
  // ------------------------------------------------------------------
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchSystemId, setPunchSystemId] = useState<number | null>(null);
  const [punchDescription, setPunchDescription] = useState('');
  const [punchCategory, setPunchCategory] = useState('');
  const [punchPriority, setPunchPriority] = useState('');
  const [punchDueDate, setPunchDueDate] = useState('');
  const [punchModalLoading, setPunchModalLoading] = useState(false);

  // ------------------------------------------------------------------
  // Add certificate modal
  // ------------------------------------------------------------------
  const [showCertModal, setShowCertModal] = useState(false);
  const [certSystemId, setCertSystemId] = useState<number | null>(null);
  const [certType, setCertType] = useState('');
  const [certDescription, setCertDescription] = useState('');
  const [certFileUrl, setCertFileUrl] = useState('');
  const [certModalLoading, setCertModalLoading] = useState(false);

  // ------------------------------------------------------------------
  // Load systems
  // ------------------------------------------------------------------
  const loadSystems = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await commissioningApi.listSystems({
        projects_id: projectsInfo.id,
        page,
        per_page: perPage,
      });
      setSystems(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load commissioning systems:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage]);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  // ------------------------------------------------------------------
  // System expand / collapse
  // ------------------------------------------------------------------
  const handleToggleSystem = async (system: CommissioningSystem) => {
    if (expandedSystemId === system.id) {
      setExpandedSystemId(null);
      setExpandedData(null);
      return;
    }
    setExpandedSystemId(system.id);
    setExpandedData({
      punchList: [],
      certificates: [],
      punchLoading: true,
      certLoading: true,
      activeSection: 'punch',
    });

    // Load both punch list and certificates in parallel
    try {
      const [punchList, certificates] = await Promise.all([
        commissioningApi.getPunchList(system.id),
        commissioningApi.getCertificates(system.id),
      ]);
      setExpandedData((prev) =>
        prev ? { ...prev, punchList, certificates, punchLoading: false, certLoading: false } : null
      );
    } catch (err) {
      console.error('Failed to load system detail:', err);
      setExpandedData((prev) =>
        prev ? { ...prev, punchLoading: false, certLoading: false } : null
      );
    }
  };

  const setActiveSection = (section: 'punch' | 'certificates') => {
    setExpandedData((prev) => prev ? { ...prev, activeSection: section } : null);
  };

  // ------------------------------------------------------------------
  // Create / Edit system
  // ------------------------------------------------------------------
  const openCreateSystem = () => {
    setEditingSystem(null);
    setSystemName('');
    setSystemDescription('');
    setSystemType('');
    setShowSystemModal(true);
  };

  const openEditSystem = (system: CommissioningSystem) => {
    setEditingSystem(system);
    setSystemName(system.name);
    setSystemDescription(system.description || '');
    setSystemType(system.system_type || '');
    setShowSystemModal(true);
  };

  const handleSaveSystem = async () => {
    if (!projectsInfo || !systemName.trim()) return;
    setSystemModalLoading(true);
    try {
      if (editingSystem) {
        await commissioningApi.updateSystem(editingSystem.id, {
          name: systemName.trim(),
          description: systemDescription.trim() || undefined,
          system_type: systemType.trim() || undefined,
        });
      } else {
        await commissioningApi.createSystem({
          projects_id: projectsInfo.id,
          name: systemName.trim(),
          description: systemDescription.trim() || undefined,
          system_type: systemType.trim() || undefined,
        });
      }
      setShowSystemModal(false);
      loadSystems();
    } catch (err) {
      console.error('Failed to save system:', err);
    } finally {
      setSystemModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Delete system
  // ------------------------------------------------------------------
  const handleDeleteSystem = async (id: number) => {
    try {
      await commissioningApi.deleteSystem(id);
      if (expandedSystemId === id) {
        setExpandedSystemId(null);
        setExpandedData(null);
      }
      loadSystems();
    } catch (err) {
      console.error('Failed to delete system:', err);
    }
    setDeleteConfirm(null);
  };

  // ------------------------------------------------------------------
  // Punch list item - update status inline
  // ------------------------------------------------------------------
  const handleUpdatePunchStatus = async (itemId: number, status: string) => {
    try {
      await commissioningApi.updatePunchListItem(itemId, { status });
      // Refresh expanded data punch list
      if (expandedSystemId) {
        const punchList = await commissioningApi.getPunchList(expandedSystemId);
        setExpandedData((prev) => prev ? { ...prev, punchList } : null);
      }
    } catch (err) {
      console.error('Failed to update punch list item:', err);
    }
  };

  // ------------------------------------------------------------------
  // Create punch list item
  // ------------------------------------------------------------------
  const openPunchModal = (systemId: number) => {
    setPunchSystemId(systemId);
    setPunchDescription('');
    setPunchCategory('');
    setPunchPriority('');
    setPunchDueDate('');
    setShowPunchModal(true);
  };

  const handleCreatePunchItem = async () => {
    if (!punchSystemId || !punchDescription.trim()) return;
    setPunchModalLoading(true);
    try {
      await commissioningApi.createPunchListItem(punchSystemId, {
        description: punchDescription.trim(),
        category: punchCategory.trim() || undefined,
        priority: punchPriority || undefined,
        due_date: punchDueDate || undefined,
      });
      setShowPunchModal(false);
      // Refresh punch list
      const punchList = await commissioningApi.getPunchList(punchSystemId);
      setExpandedData((prev) => prev ? { ...prev, punchList } : null);
    } catch (err) {
      console.error('Failed to create punch list item:', err);
    } finally {
      setPunchModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Create certificate
  // ------------------------------------------------------------------
  const openCertModal = (systemId: number) => {
    setCertSystemId(systemId);
    setCertType('');
    setCertDescription('');
    setCertFileUrl('');
    setShowCertModal(true);
  };

  const handleCreateCertificate = async () => {
    if (!certSystemId || !certType.trim()) return;
    setCertModalLoading(true);
    try {
      await commissioningApi.createCertificate(certSystemId, {
        certificate_type: certType.trim(),
        description: certDescription.trim() || undefined,
        file_url: certFileUrl.trim() || undefined,
      });
      setShowCertModal(false);
      // Refresh certificates
      const certificates = await commissioningApi.getCertificates(certSystemId);
      setExpandedData((prev) => prev ? { ...prev, certificates } : null);
    } catch (err) {
      console.error('Failed to create certificate:', err);
    } finally {
      setCertModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------
  return (
    <div>
      <PageHeader
        title="Comissionamento"
        subtitle="Gestão de sistemas, punch list e certificados"
        breadcrumb={projectsInfo ? `${projectsInfo.name} / Comissionamento` : 'Comissionamento'}
        actions={
          <button className="btn btn-primary" onClick={openCreateSystem}>
            <Plus size={18} /> Novo Sistema
          </button>
        }
      />
      <ProjectFilterDropdown />

      {/* Systems table */}
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
                <th>Nome</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Conclusão</th>
                <th>Punch List</th>
                <th>Certificados</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {systems.map((system) => (
                <>
                  <motion.tr key={system.id} variants={tableRowVariants}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>{system.name}</span>
                      </div>
                    </td>
                    <td>{system.system_type || '-'}</td>
                    <td>
                      <StatusBadge status={system.status} colorMap={SYSTEM_STATUS_COLORS} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--color-alternate)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${system.completion_percent ?? 0}%`,
                              backgroundColor: 'var(--color-primary)',
                              borderRadius: '3px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                          {system.completion_percent ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                        {system.punch_list_count ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        {system.certificates_count ?? 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-icon"
                          title="Editar"
                          onClick={() => openEditSystem(system)}
                        >
                          <Edit size={16} color="var(--color-secondary-text)" />
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Excluir"
                          onClick={() => setDeleteConfirm(system.id)}
                        >
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Expandir"
                          onClick={() => handleToggleSystem(system)}
                        >
                          {expandedSystemId === system.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded system detail */}
                  {expandedSystemId === system.id && expandedData && (
                    <tr key={`${system.id}-detail`}>
                      <td colSpan={7} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                        <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                          {/* Section tabs */}
                          <div style={{ borderBottom: '2px solid var(--color-alternate)', display: 'flex', gap: '0', marginBottom: '16px' }}>
                            <button
                              className="btn"
                              style={{
                                borderRadius: 0,
                                borderBottom: expandedData.activeSection === 'punch' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                marginBottom: '-2px',
                                fontWeight: expandedData.activeSection === 'punch' ? 600 : 400,
                                color: expandedData.activeSection === 'punch' ? 'var(--color-primary)' : 'var(--color-secondary-text)',
                                padding: '8px 16px',
                                fontSize: '13px',
                                backgroundColor: 'transparent',
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
                                padding: '8px 16px',
                                fontSize: '13px',
                                backgroundColor: 'transparent',
                              }}
                              onClick={() => setActiveSection('certificates')}
                            >
                              <Award size={14} /> Certificados
                            </button>
                          </div>

                          {/* Punch list section */}
                          {expandedData.activeSection === 'punch' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => openPunchModal(system.id)}>
                                  <Plus size={14} /> Adicionar Item
                                </button>
                              </div>
                              {expandedData.punchLoading ? (
                                <LoadingSpinner />
                              ) : expandedData.punchList.length === 0 ? (
                                <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                                  Nenhum item no punch list.
                                </p>
                              ) : (
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Categoria</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Prioridade</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Responsável</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Vencimento</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedData.punchList.map((item) => (
                                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                                        <td style={{ padding: '8px 12px' }}>{item.description}</td>
                                        <td style={{ padding: '8px 12px' }}>{item.category || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          {item.priority ? (
                                            <StatusBadge status={item.priority} colorMap={PUNCH_PRIORITY_COLORS} />
                                          ) : '-'}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <StatusBadge status={item.status} colorMap={PUNCH_STATUS_COLORS} />
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>{item.responsible_name || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <SearchableSelect
                                            options={[
                                              { value: 'aberto', label: 'Aberto' },
                                              { value: 'em_andamento', label: 'Em Andamento' },
                                              { value: 'concluido', label: 'Concluído' },
                                            ]}
                                            value={item.status}
                                            onChange={(val) => handleUpdatePunchStatus(item.id, String(val ?? 'aberto'))}
                                            style={{ fontSize: '12px', minWidth: '120px' }}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          )}

                          {/* Certificates section */}
                          {expandedData.activeSection === 'certificates' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => openCertModal(system.id)}>
                                  <Plus size={14} /> Adicionar Certificado
                                </button>
                              </div>
                              {expandedData.certLoading ? (
                                <LoadingSpinner />
                              ) : expandedData.certificates.length === 0 ? (
                                <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                                  Nenhum certificado cadastrado.
                                </p>
                              ) : (
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Emitido em</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Arquivo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedData.certificates.map((cert) => (
                                      <tr key={cert.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{cert.certificate_type}</td>
                                        <td style={{ padding: '8px 12px' }}>{cert.description || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                          <StatusBadge status={cert.status} colorMap={CERT_STATUS_COLORS} />
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                          {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                          {cert.file_url ? (
                                            <a href={cert.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                                              Ver arquivo
                                            </a>
                                          ) : '-'}
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

      {/* ----------------------------------------------------------------
          Modal: Create / Edit System
      ---------------------------------------------------------------- */}
      {showSystemModal && (
        <div className="modal-backdrop" onClick={() => setShowSystemModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '460px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>
              {editingSystem ? 'Editar Sistema' : 'Novo Sistema'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Nome *</label>
                <input
                  className="input-field"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="Nome do sistema"
                />
              </div>
              <div className="input-group">
                <label>Tipo de Sistema</label>
                <input
                  className="input-field"
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value)}
                  placeholder="Ex: Elétrico, Mecânico, Civil"
                />
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={systemDescription}
                  onChange={(e) => setSystemDescription(e.target.value)}
                  placeholder="Descrição do sistema..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowSystemModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveSystem}
                disabled={systemModalLoading || !systemName.trim()}
              >
                {systemModalLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Add Punch List Item
      ---------------------------------------------------------------- */}
      {showPunchModal && (
        <div className="modal-backdrop" onClick={() => setShowPunchModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Adicionar Item ao Punch List</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Descrição *</label>
                <input
                  className="input-field"
                  value={punchDescription}
                  onChange={(e) => setPunchDescription(e.target.value)}
                  placeholder="Descrição do item"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Categoria</label>
                  <input
                    className="input-field"
                    value={punchCategory}
                    onChange={(e) => setPunchCategory(e.target.value)}
                    placeholder="Ex: Elétrica, Civil"
                  />
                </div>
                <div className="input-group">
                  <label>Prioridade</label>
                  <SearchableSelect
                    options={[
                      { value: 'baixa', label: 'Baixa' },
                      { value: 'media', label: 'Média' },
                      { value: 'alta', label: 'Alta' },
                      { value: 'critica', label: 'Crítica' },
                    ]}
                    value={punchPriority || undefined}
                    onChange={(val) => setPunchPriority(String(val ?? ''))}
                    placeholder="Selecione"
                    allowClear
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Data de Vencimento</label>
                <input
                  type="date"
                  className="input-field"
                  value={punchDueDate}
                  onChange={(e) => setPunchDueDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowPunchModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreatePunchItem}
                disabled={punchModalLoading || !punchDescription.trim()}
              >
                {punchModalLoading ? <span className="spinner" /> : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Add Certificate
      ---------------------------------------------------------------- */}
      {showCertModal && (
        <div className="modal-backdrop" onClick={() => setShowCertModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '460px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Adicionar Certificado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Tipo de Certificado *</label>
                <input
                  className="input-field"
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  placeholder="Ex: NR-10, ART, ISO 9001"
                />
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={certDescription}
                  onChange={(e) => setCertDescription(e.target.value)}
                  placeholder="Descrição do certificado..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="input-group">
                <label>URL do Arquivo</label>
                <input
                  className="input-field"
                  value={certFileUrl}
                  onChange={(e) => setCertFileUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCertModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateCertificate}
                disabled={certModalLoading || !certType.trim()}
              >
                {certModalLoading ? <span className="spinner" /> : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title="Excluir Sistema"
          message="Tem certeza que deseja excluir este sistema? Esta ação não pode ser desfeita."
          onConfirm={() => handleDeleteSystem(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
