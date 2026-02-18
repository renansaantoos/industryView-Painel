import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import * as companyApi from '../../services/api/company';
import type { CompanyFull, CompanyBranch, CompanyUpdatePayload, BranchPayload } from '../../types/company';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import CompanyEditModal from '../../components/company/CompanyEditModal';
import BranchForm from '../../components/company/BranchForm';
import {
  Building2,
  Edit,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  ExternalLink,
} from 'lucide-react';

const REGIME_LABELS: Record<string, string> = {
  simples_nacional: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  mei: 'MEI',
  isento: 'Isento',
};

function formatCnpj(cnpj?: string): string {
  if (!cnpj) return '-';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function buildAddressLine(company: CompanyFull | CompanyBranch): string {
  const parts = [
    company.address_line,
    company.numero && `nº ${company.numero}`,
    company.complemento,
    company.bairro,
    company.city && company.state ? `${company.city} - ${company.state}` : company.city || company.state,
    company.pais && company.pais !== 'Brasil' ? company.pais : null,
  ].filter(Boolean);
  return parts.join(', ') || '-';
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}

function InfoItem({ icon, label, value, isLink }: InfoItemProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        {isLink && value !== '-' ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {value} <ExternalLink size={12} />
          </a>
        ) : (
          <div style={{ fontSize: '14px', fontWeight: 500, color: value === '-' ? 'var(--color-secondary-text)' : 'var(--color-primary-text)' }}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function CompanyProfile() {
  const { setNavBarSelection } = useAppState();
  const { user } = useAuth();

  const [company, setCompany] = useState<CompanyFull | null>(null);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [showEditCompany, setShowEditCompany] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CompanyBranch | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setNavBarSelection(13);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadCompany = useCallback(async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await companyApi.getCompany(user.companyId);
      setCompany(data);
    } catch {
      showToast('Erro ao carregar dados da empresa', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, showToast]);

  const loadBranches = useCallback(async () => {
    if (!user?.companyId) return;
    setBranchesLoading(true);
    try {
      const data = await companyApi.getBranches(user.companyId);
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar filiais', 'error');
    } finally {
      setBranchesLoading(false);
    }
  }, [user?.companyId, showToast]);

  useEffect(() => {
    loadCompany();
    loadBranches();
  }, [loadCompany, loadBranches]);

  const handleSaveCompany = useCallback(async (data: CompanyUpdatePayload) => {
    if (!user?.companyId) return;
    await companyApi.updateCompany(user.companyId, data);
    setShowEditCompany(false);
    showToast('Empresa atualizada com sucesso', 'success');
    loadCompany();
  }, [user?.companyId, showToast, loadCompany]);

  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    setShowBranchForm(true);
  };

  const handleOpenEditBranch = (branch: CompanyBranch) => {
    setEditingBranch(branch);
    setShowBranchForm(true);
  };

  const handleSaveBranch = useCallback(async (data: BranchPayload) => {
    if (!user?.companyId) return;
    if (editingBranch) {
      await companyApi.updateBranch(user.companyId, editingBranch.id, data);
      showToast('Filial atualizada com sucesso', 'success');
    } else {
      await companyApi.createBranch(user.companyId, data);
      showToast('Filial criada com sucesso', 'success');
    }
    setShowBranchForm(false);
    setEditingBranch(null);
    loadBranches();
  }, [user?.companyId, editingBranch, showToast, loadBranches]);

  const handleToggleBranchStatus = useCallback(async (branch: CompanyBranch) => {
    if (!user?.companyId) return;
    try {
      await companyApi.updateBranch(user.companyId, branch.id, { ativo: !branch.ativo });
      showToast(
        `Filial ${!branch.ativo ? 'ativada' : 'desativada'} com sucesso`,
        'success'
      );
      loadBranches();
    } catch {
      showToast('Erro ao alterar status da filial', 'error');
    }
  }, [user?.companyId, showToast, loadBranches]);

  const handleDeleteBranch = useCallback(async () => {
    if (!user?.companyId || !deleteConfirm) return;
    try {
      await companyApi.deleteBranch(user.companyId, deleteConfirm.id);
      showToast('Filial excluída com sucesso', 'success');
      loadBranches();
    } catch {
      showToast('Erro ao excluir filial', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  }, [user?.companyId, deleteConfirm, showToast, loadBranches]);

  if (loading) return <LoadingSpinner fullPage />;

  if (!company) {
    return (
      <div>
        <PageHeader title="Empresa" subtitle="Gestão de matriz e filiais" />
        <EmptyState message="Dados da empresa não encontrados" />
      </div>
    );
  }

  const fullAddress = buildAddressLine(company);

  return (
    <div>
      <PageHeader
        title="Empresa"
        subtitle="Gerencie os dados da sua empresa e filiais"
        breadcrumb="Configurações"
      />

      {/* Toast notification */}
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

      {/* === MATRIZ CARD === */}
      <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ marginBottom: '24px' }}>
        {/* Card header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.brand_name}
                style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'contain', border: '1px solid var(--color-alternate)', background: 'var(--color-secondary)' }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: 'var(--color-tertiary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-alternate)',
              }}>
                <Building2 size={28} color="var(--color-primary)" />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{company.brand_name}</h2>
                <span className="badge" style={{ background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)', fontSize: '11px' }}>
                  Matriz
                </span>
              </div>
              {company.legal_name && (
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                  {company.legal_name}
                </p>
              )}
              {company.cnpj && (
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                  CNPJ: {formatCnpj(company.cnpj)}
                </p>
              )}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowEditCompany(true)}>
            <Edit size={16} />
            Editar
          </button>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {(company.phone || company.email || company.website) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Contato
              </div>
              {company.phone && <InfoItem icon={<Phone size={16} />} label="Telefone" value={company.phone} />}
              {company.email && <InfoItem icon={<Mail size={16} />} label="E-mail" value={company.email} />}
              {company.website && <InfoItem icon={<Globe size={16} />} label="Website" value={company.website} isLink />}
            </div>
          )}

          {fullAddress !== '-' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Endereço
              </div>
              <InfoItem icon={<MapPin size={16} />} label="Endereço completo" value={fullAddress} />
              {company.cep && <InfoItem icon={<MapPin size={16} />} label="CEP" value={company.cep} />}
            </div>
          )}

          {(company.cnae || company.regime_tributario || company.inscricao_estadual || company.inscricao_municipal) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Fiscal
              </div>
              {company.cnae && <InfoItem icon={<FileText size={16} />} label="CNAE" value={company.cnae} />}
              {company.regime_tributario && <InfoItem icon={<FileText size={16} />} label="Regime Tributário" value={REGIME_LABELS[company.regime_tributario] || company.regime_tributario} />}
              {company.inscricao_estadual && <InfoItem icon={<FileText size={16} />} label="Inscrição Estadual" value={company.inscricao_estadual} />}
              {company.inscricao_municipal && <InfoItem icon={<FileText size={16} />} label="Inscrição Municipal" value={company.inscricao_municipal} />}
            </div>
          )}

          {(company.responsavel_legal || company.responsavel_cpf) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Responsável Legal
              </div>
              {company.responsavel_legal && <InfoItem icon={<User size={16} />} label="Nome" value={company.responsavel_legal} />}
              {company.responsavel_cpf && <InfoItem icon={<User size={16} />} label="CPF" value={company.responsavel_cpf} />}
            </div>
          )}
        </div>
      </motion.div>

      {/* === BRANCHES SECTION === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
            Filiais
            <span style={{
              marginLeft: '8px',
              padding: '2px 10px',
              borderRadius: '12px',
              background: 'var(--color-tertiary-bg)',
              color: 'var(--color-primary)',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {branches.length}
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
            Gerencie as unidades filiais da empresa
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateBranch}>
          <Plus size={16} />
          Adicionar Filial
        </button>
      </div>

      {branchesLoading ? (
        <LoadingSpinner />
      ) : branches.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          message="Nenhuma filial cadastrada"
          action={
            <button className="btn btn-primary" onClick={handleOpenCreateBranch}>
              <Plus size={16} />
              Adicionar Filial
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome Fantasia</th>
                <th>CNPJ</th>
                <th>Cidade / UF</th>
                <th>Responsável</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {branches.map(branch => (
                <motion.tr key={branch.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{branch.brand_name}</div>
                    {branch.legal_name && (
                      <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{branch.legal_name}</div>
                    )}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)' }}>
                    {formatCnpj(branch.cnpj)}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)' }}>
                    {[branch.city, branch.state].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)' }}>
                    {branch.responsavel_legal || '-'}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: branch.ativo ? 'var(--color-status-04)' : 'var(--color-status-05)',
                        color: branch.ativo ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    >
                      {branch.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        className="btn btn-icon"
                        title="Editar filial"
                        onClick={() => handleOpenEditBranch(branch)}
                      >
                        <Edit size={15} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={branch.ativo ? 'Desativar filial' : 'Ativar filial'}
                        onClick={() => handleToggleBranchStatus(branch)}
                      >
                        {branch.ativo
                          ? <ToggleRight size={15} color="var(--color-success)" />
                          : <ToggleLeft size={15} color="var(--color-secondary-text)" />
                        }
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Excluir filial"
                        onClick={() => setDeleteConfirm(branch)}
                      >
                        <Trash2 size={15} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      {/* === MODALS === */}

      {showEditCompany && (
        <CompanyEditModal
          company={company}
          onSave={handleSaveCompany}
          onClose={() => setShowEditCompany(false)}
        />
      )}

      {showBranchForm && (
        <BranchForm
          branch={editingBranch}
          onSave={handleSaveBranch}
          onClose={() => {
            setShowBranchForm(false);
            setEditingBranch(null);
          }}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Excluir Filial"
          message={`Tem certeza que deseja excluir a filial "${deleteConfirm.brand_name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={handleDeleteBranch}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

export default CompanyProfile;
