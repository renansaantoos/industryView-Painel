import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { projectsApi } from '../../services';
import type { CreateProjectRequest, CepResponse, ProjectStatus, ProjectWorkSituation } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  Save,
  ArrowLeft,
  Building2,
  FileText,
  HardHat,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';

export default function CreateProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [workSituations, setWorkSituations] = useState<ProjectWorkSituation[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>();
  const [selectedWorkSituationId, setSelectedWorkSituationId] = useState<number | undefined>();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateProjectRequest>();

  useEffect(() => {
    loadDropdowns();
  }, []);

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

  const onSubmit = async (data: CreateProjectRequest) => {
    setLoading(true);
    setError('');
    try {
      await projectsApi.addProject({
        ...data,
        projects_statuses_id: selectedStatusId,
        projects_works_situations_id: selectedWorkSituationId,
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
    } catch { /* ignore CEP errors */ }
  };

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

  return (
    <div>
      <PageHeader
        title={t('projects.createProject')}
        breadcrumb={t('projects.title')}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/projetos')}>
            <ArrowLeft size={18} /> {t('common.back')}
          </button>
        }
      />

      {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
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
                <input className={`input-field ${errors.name ? 'error' : ''}`} {...register('name', { required: true })} />
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
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                    let masked = digits;
                    if (digits.length > 2) masked = digits.slice(0, 2) + '.' + digits.slice(2);
                    if (digits.length > 5) masked = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5);
                    if (digits.length > 8) masked = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5, 8) + '/' + digits.slice(8);
                    if (digits.length > 12) masked = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5, 8) + '/' + digits.slice(8, 12) + '-' + digits.slice(12);
                    setValue('cnpj', masked);
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
    </div>
  );
}
