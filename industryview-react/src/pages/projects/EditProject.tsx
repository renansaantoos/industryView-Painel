import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi, clientsApi } from '../../services';
import type { Client } from '../../services/api/clients';
import type { CreateProjectRequest, CepResponse, ProjectStatus, ProjectWorkSituation } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableSelect from '../../components/common/SearchableSelect';
import { ClientFormModal, maskCNPJ } from '../../components/clients/ClientFormModal';
import {
  Save,
  ArrowLeft,
  Building2,
  Users,
  FileText,
  HardHat,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';

/** Convert a timestamp (ms) or ISO string to YYYY-MM-DD for date inputs */
function formatDateForInput(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'number') {
    return new Date(val).toISOString().slice(0, 10);
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val.slice(0, 10) : d.toISOString().slice(0, 10);
  }
  return '';
}

/** Formats a raw CNPJ string (digits only) for display: 00.000.000/0000-00 */
function applyInlineCnpjMask(digits: string): string {
  let masked = digits;
  if (digits.length > 2) masked = digits.slice(0, 2) + '.' + digits.slice(2);
  if (digits.length > 5) masked = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5);
  if (digits.length > 8) {
    masked = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5, 8) + '/' + digits.slice(8);
  }
  if (digits.length > 12) {
    masked =
      digits.slice(0, 2) +
      '.' +
      digits.slice(2, 5) +
      '.' +
      digits.slice(5, 8) +
      '/' +
      digits.slice(8, 12) +
      '-' +
      digits.slice(12);
  }
  return masked;
}

export default function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [workSituations, setWorkSituations] = useState<ProjectWorkSituation[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>();
  const [selectedWorkSituationId, setSelectedWorkSituationId] = useState<number | undefined>();
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientError, setClientError] = useState(false);

  const { register, handleSubmit, setValue, reset } = useForm<CreateProjectRequest>();

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
      return;
    }
    loadDropdowns();
    loadClients();
    // API returns snake_case keys — access them via bracket notation or cast
    const p = projectsInfo as any;
    reset({
      name: p.name,
      registration_number: p.registration_number,
      responsible: p.responsible,
      cnpj: p.cnpj ? applyInlineCnpjMask(String(p.cnpj).replace(/\D/g, '').slice(0, 14)) : '',
      start_date: p.start_date ? formatDateForInput(p.start_date) : '',
      art: p.art,
      rrt: p.rrt,
      cib: p.cib,
      cnae: p.cnae,
      category: p.category,
      origin_registration: p.origin_registration,
      real_state_registration: p.real_state_registration,
      permit_number: p.permit_number,
      situation_date: p.situation_date ? formatDateForInput(p.situation_date) : '',
      destination: p.destination,
      project_work_type: p.project_work_type,
      resulting_work_area: p.resulting_work_area,
      cep: p.cep,
      street: p.street,
      number: p.number,
      neighbourhood: p.neighbourhood,
      city: p.city,
      state: p.state,
      complement: p.complement,
    });
    setSelectedStatusId(p.projects_statuses_id || undefined);
    setSelectedWorkSituationId(p.projects_works_situations_id || undefined);
    setSelectedClientId(p.client_id || undefined);
  }, [projectsInfo]);

  const loadDropdowns = async () => {
    try {
      const [statusList, situationList] = await Promise.all([
        projectsApi.queryAllProjectStatuses().catch(() => []),
        projectsApi.queryAllWorkSituations().catch(() => []),
      ]);
      setStatuses(Array.isArray(statusList) ? statusList : []);
      setWorkSituations(Array.isArray(situationList) ? situationList : []);
    } catch { /* ignore */ }
  };

  const loadClients = async () => {
    setClientsLoading(true);
    try {
      const result = await clientsApi.listClients({ per_page: 100 });
      const items = Array.isArray(result) ? result : (result?.items ?? []);
      setAllClients(items);
    } catch {
      setAllClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClientId) {
      setSelectedClient(null);
      return;
    }
    const client = allClients.find((c) => c.id === selectedClientId) ?? null;
    setSelectedClient(client);
  }, [selectedClientId, allClients]);

  function handleClientSelect(clientId: string | number | undefined) {
    if (!clientId) {
      setSelectedClientId(undefined);
      setSelectedClient(null);
      setValue('cnpj', '');
      return;
    }

    const id = Number(clientId);
    const client = allClients.find((c) => c.id === id) ?? null;
    setSelectedClientId(id);
    setSelectedClient(client);
    setClientError(false);

    if (client?.cnpj) {
      const digits = client.cnpj.replace(/\D/g, '').slice(0, 14);
      setValue('cnpj', applyInlineCnpjMask(digits));
    }
  }

  function handleNewClientSaved(newClient: Client) {
    setShowClientModal(false);
    setAllClients((prev) => {
      const exists = prev.some((c) => c.id === newClient.id);
      return exists ? prev : [...prev, newClient];
    });
    handleClientSelect(newClient.id);
  }

  const onSubmit = async (data: CreateProjectRequest) => {
    if (!projectsInfo) return;
    if (!selectedClientId) {
      setClientError(true);
      setError(t('projects.clientRequired'));
      return;
    }
    setClientError(false);
    setLoading(true);
    setError('');
    try {
      await projectsApi.editProject(projectsInfo.id, {
        ...data,
        projects_statuses_id: selectedStatusId,
        projects_works_situations_id: selectedWorkSituationId,
        client_id: selectedClientId,
      });
      navigate('/projetos');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCepLookup = async (cep: string) => {
    if (cep.replace(/\D/g, '').length !== 8) return;
    try {
      const data: CepResponse = await projectsApi.getCep(cep.replace(/\D/g, ''));
      if (data) {
        setValue('street', data.logradouro || '');
        setValue('neighbourhood', data.bairro || '');
        setValue('city', data.localidade || '');
        setValue('state', data.uf || '');
      }
    } catch { /* ignore */ }
  };

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-alternate)',
    overflow: 'hidden',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-alternate)',
    background: 'var(--color-bg)',
  };

  const sectionIconStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const sectionBodyStyle: React.CSSProperties = {
    padding: '20px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  };

  const clientOptions = allClients.map((c) => ({
    value: c.id,
    label: [
      c.trade_name || c.legal_name,
      c.cnpj ? maskCNPJ(c.cnpj) : null,
    ]
      .filter(Boolean)
      .join(' — '),
  }));

  return (
    <div>
      <PageHeader
        title={t('projects.editProject')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/projetos')}>
            <ArrowLeft size={18} /> {t('common.back')}
          </button>
        }
      />

      {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div variants={fadeUpChild} style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...sectionIconStyle, background: 'rgba(var(--color-primary-rgb, 26,115,232), 0.1)' }}>
                <Users size={18} color="var(--color-primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                  {t('projects.clientSection')}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                  {t('projects.clientSectionSubtitle')}
                </span>
              </div>
            </div>
            <div style={sectionBodyStyle}>
              {/* Dropdown row */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>{t('projects.clientSection')} *</label>
                  <div style={clientError ? { border: '1.5px solid var(--color-error, #C0392B)', borderRadius: '8px' } : undefined}>
                    <SearchableSelect
                      options={clientOptions}
                      value={selectedClientId}
                      onChange={handleClientSelect}
                      placeholder={
                        clientsLoading
                          ? t('common.loading')
                          : t('projects.selectClient')
                      }
                      searchPlaceholder={t('common.search')}
                    />
                  </div>
                  {clientError && (
                    <span style={{ color: 'var(--color-error, #C0392B)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {t('projects.clientRequired')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowClientModal(true)}
                  style={{ flexShrink: 0, height: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title={t('projects.addNewClient')}
                >
                  <Plus size={16} />
                  {t('projects.addNewClient')}
                </button>
              </div>

              {/* Selected client summary card */}
              {selectedClient && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    marginTop: '14px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'var(--color-status-01, rgba(26,115,232,0.06))',
                    border: '1px solid var(--color-alternate)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Building2 size={24} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {selectedClient.trade_name || selectedClient.legal_name}
                      </div>
                      {selectedClient.trade_name && selectedClient.legal_name && (
                        <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                          {selectedClient.legal_name}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-secondary-text)',
                          display: 'flex',
                          gap: '12px',
                          marginTop: '2px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {selectedClient.cnpj && (
                          <span>CNPJ: {maskCNPJ(selectedClient.cnpj)}</span>
                        )}
                        {(selectedClient.billing_city || selectedClient.billing_state) && (
                          <span>
                            {[selectedClient.billing_city, selectedClient.billing_state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => handleClientSelect(undefined)}
                    title={t('common.clear')}
                    style={{ flexShrink: 0 }}
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

        <motion.div variants={staggerParent} initial="initial" animate="animate">
        {/* Section 1: Dados do Projeto */}
        <motion.div variants={fadeUpChild} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ ...sectionIconStyle, background: 'var(--color-status-01)' }}>
              <Building2 size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{t('projects.projectData')}</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('projects.projectDataDesc')}</span>
            </div>
          </div>
          <div style={sectionBodyStyle}>
            <div style={gridStyle}>
              <div className="input-group">
                <label>{t('projects.projectName')} *</label>
                <input className="input-field" {...register('name', { required: true })} />
              </div>
              <div className="input-group">
                <label>{t('projects.registrationNumber')}</label>
                <input className="input-field" {...register('registration_number')} />
              </div>
              <div className="input-group">
                <label>{t('projects.responsible')}</label>
                <input className="input-field" {...register('responsible')} />
              </div>
              <div className="input-group">
                <label>{t('projects.cnpj')}</label>
                <input
                  className="input-field"
                  {...register('cnpj')}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setValue('cnpj', applyInlineCnpjMask(digits));
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <div className="input-group">
                <label>{t('projects.startDate')}</label>
                <input type="date" className="input-field" {...register('start_date')} />
              </div>
              <div className="input-group">
                <label>{t('projects.category')}</label>
                <input className="input-field" {...register('category')} />
              </div>
              <div className="input-group">
                <label>{t('projects.projectStatus')}</label>
                <SearchableSelect
                  options={statuses.map(s => ({ value: s.id, label: s.name }))}
                  value={selectedStatusId}
                  onChange={(v) => setSelectedStatusId(v ? Number(v) : undefined)}
                  placeholder={t('projects.selectStatus')}
                />
              </div>
              <div className="input-group">
                <label>{t('projects.workSituation')}</label>
                <SearchableSelect
                  options={workSituations.map(s => ({ value: s.id, label: s.name }))}
                  value={selectedWorkSituationId}
                  onChange={(v) => setSelectedWorkSituationId(v ? Number(v) : undefined)}
                  placeholder={t('projects.selectSituation')}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Registros e Documentação */}
        <motion.div variants={fadeUpChild} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ ...sectionIconStyle, background: 'var(--color-status-02)' }}>
              <FileText size={18} color="var(--color-warning)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{t('projects.registrationDocs')}</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('projects.registrationDocsDesc')}</span>
            </div>
          </div>
          <div style={sectionBodyStyle}>
            <div style={gridStyle}>
              <div className="input-group">
                <label>{t('projects.art')}</label>
                <input className="input-field" {...register('art')} />
              </div>
              <div className="input-group">
                <label>{t('projects.rrt')}</label>
                <input className="input-field" {...register('rrt')} />
              </div>
              <div className="input-group">
                <label>{t('projects.cib')}</label>
                <input className="input-field" {...register('cib')} />
              </div>
              <div className="input-group">
                <label>{t('projects.cnae')}</label>
                <input
                  className="input-field"
                  {...register('cnae')}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 7);
                    let masked = digits;
                    if (digits.length > 4) masked = digits.slice(0, 4) + '-' + digits.slice(4);
                    if (digits.length > 5) masked = digits.slice(0, 4) + '-' + digits.slice(4, 5) + '/' + digits.slice(5);
                    setValue('cnae', masked);
                  }}
                  placeholder="0000-0/00"
                  maxLength={9}
                />
              </div>
              <div className="input-group">
                <label>{t('projects.originRegistration')}</label>
                <input className="input-field" {...register('origin_registration')} />
              </div>
              <div className="input-group">
                <label>{t('projects.realStateRegistration')}</label>
                <input className="input-field" {...register('real_state_registration')} />
              </div>
              <div className="input-group">
                <label>{t('projects.permitNumber')}</label>
                <input className="input-field" {...register('permit_number')} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Detalhes da Obra */}
        <motion.div variants={fadeUpChild} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ ...sectionIconStyle, background: 'var(--color-status-04)' }}>
              <HardHat size={18} color="var(--color-success)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{t('projects.workDetails')}</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('projects.workDetailsDesc')}</span>
            </div>
          </div>
          <div style={sectionBodyStyle}>
            <div style={gridStyle}>
              <div className="input-group">
                <label>{t('projects.destination')}</label>
                <input className="input-field" {...register('destination')} />
              </div>
              <div className="input-group">
                <label>{t('projects.projectWorkType')}</label>
                <input className="input-field" {...register('project_work_type')} />
              </div>
              <div className="input-group">
                <label>{t('projects.resultingWorkArea')}</label>
                <input type="number" step="0.01" className="input-field" {...register('resulting_work_area')} />
              </div>
              <div className="input-group">
                <label>{t('projects.situationDate')}</label>
                <input type="date" className="input-field" {...register('situation_date')} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Endereço */}
        <motion.div variants={fadeUpChild} style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ ...sectionIconStyle, background: 'var(--color-status-03)' }}>
              <MapPin size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{t('projects.addressSection')}</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('projects.addressSectionDesc')}</span>
            </div>
          </div>
          <div style={sectionBodyStyle}>
            <div style={gridStyle}>
              <div className="input-group">
                <label>{t('projects.cep')}</label>
                <input className="input-field" {...register('cep')} onBlur={(e) => handleCepLookup(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('projects.street')}</label>
                <input className="input-field" {...register('street')} />
              </div>
              <div className="input-group">
                <label>{t('projects.number')}</label>
                <input className="input-field" {...register('number')} />
              </div>
              <div className="input-group">
                <label>{t('projects.neighborhood')}</label>
                <input className="input-field" {...register('neighbourhood')} />
              </div>
              <div className="input-group">
                <label>{t('projects.city')}</label>
                <input className="input-field" {...register('city')} />
              </div>
              <div className="input-group">
                <label>{t('projects.state')}</label>
                <input className="input-field" {...register('state')} />
              </div>
              <div className="input-group">
                <label>{t('projects.complement')}</label>
                <input className="input-field" {...register('complement')} />
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '32px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/projetos')}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : <><Save size={18} /> {t('common.save')}</>}
          </button>
        </div>
      </form>

      <ClientFormModal
        open={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSaved={handleNewClientSaved}
      />
    </div>
  );
}
