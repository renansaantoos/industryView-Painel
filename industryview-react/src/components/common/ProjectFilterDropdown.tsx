import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderKanban } from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi } from '../../services';
import type { ProjectInfo } from '../../types';
import SearchableSelect from './SearchableSelect';

export default function ProjectFilterDropdown() {
  const { t } = useTranslation();
  const { projectsInfo, setProjectsInfo } = useAppState();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    projectsApi.queryAllProjects({ per_page: 100 }).then((data) => {
      if (!cancelled) setProjects(data.items ?? []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const options = projects.map((p) => ({ value: p.id, label: p.name }));

  const handleChange = (val: string | number | undefined) => {
    if (val === undefined) {
      setProjectsInfo(null);
    } else {
      const found = projects.find((p) => p.id === Number(val));
      if (found) setProjectsInfo(found);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        padding: '8px 12px',
        background: 'var(--color-tertiary-bg)',
        borderRadius: '8px',
      }}
    >
      <FolderKanban size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
        {t('common.project')}:
      </span>
      <SearchableSelect
        options={options}
        value={projectsInfo?.id}
        onChange={handleChange}
        placeholder={t('projects.allProjects')}
        allowClear
        style={{ flex: 1, maxWidth: '320px' }}
      />
    </div>
  );
}
