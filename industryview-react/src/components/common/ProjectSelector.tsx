import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi } from '../../services';
import type { ProjectInfo } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import { FolderKanban, Search } from 'lucide-react';

/**
 * Shown when a page requires a selected project but none is set.
 * Lets the user pick a project inline instead of silently redirecting.
 */
export default function ProjectSelector() {
  const { t } = useTranslation();
  const { setProjectsInfo } = useAppState();

  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectsApi.queryAllProjects({ page: 1, per_page: 50, search });
      setProjects(data.items || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSelect = (project: ProjectInfo) => {
    setProjectsInfo(project);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
      <FolderKanban size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
        {t('projects.selectProject', 'Selecione um Projeto')}
      </h2>
      <p style={{ color: 'var(--color-secondary-text)', marginBottom: '24px', textAlign: 'center' }}>
        {t('projects.selectProjectDescription', 'Escolha um projeto para continuar')}
      </p>

      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('projects.searchProjects')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-secondary-text)', padding: '24px' }}>
            {t('common.noData')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelect(project)}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  border: '1px solid var(--color-alternate)',
                  borderRadius: '8px',
                  textAlign: 'left',
                  width: '100%',
                  background: 'var(--color-secondary-bg)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-alternate)')}
              >
                <FolderKanban size={20} color="var(--color-primary)" />
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{project.name}</div>
                  {project.registrationNumber && (
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                      {project.registrationNumber}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
