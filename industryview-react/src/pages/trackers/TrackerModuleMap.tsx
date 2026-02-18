import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { trackersApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ArrowLeft, Map, ZoomIn, ZoomOut, Filter } from 'lucide-react';

interface TrackerMapData {
  id: number;
  name: string;
  sections?: {
    id: number;
    name: string;
    rows?: {
      id: number;
      name: string;
      trackers?: {
        id: number;
        name: string;
        modules?: {
          id: number;
          name: string;
          status?: string;
          statusColor?: string;
        }[];
      }[];
    }[];
  }[];
}

export default function TrackerModuleMap() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo, setIsMap } = useAppState();

  const [mapData, setMapData] = useState<TrackerMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
      return;
    }
    setIsMap(true);
    loadMapData();
    return () => setIsMap(false);
  }, [projectsInfo, navigate]);

  const loadMapData = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await trackersApi.getModulesMap({
        projects_id: projectsInfo.id,
      });
      setMapData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo]);

  const getModuleColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'installed':
      case 'instalado':
        return 'var(--color-success)';
      case 'pending':
      case 'pendente':
        return 'var(--color-warning)';
      case 'damaged':
      case 'danificado':
        return 'var(--color-error)';
      default:
        return 'var(--color-alternate)';
    }
  };

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={t('trackers.moduleMap')}
        subtitle={t('trackers.moduleMapSubtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('trackers.moduleMap')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} /> {t('common.filter')}
            </button>
          </div>
        }
      />

      {/* Zoom Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>
          <ZoomOut size={16} />
        </button>
        <span style={{ fontSize: '13px', fontWeight: 500, minWidth: '60px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button className="btn btn-secondary btn-sm" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
          <ZoomIn size={16} />
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setZoom(1)} style={{ marginLeft: '8px' }}>
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ fontWeight: 500 }}>{t('trackers.legend')}:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '2px', backgroundColor: 'var(--color-success)' }} />
            <span>{t('trackers.installed')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '2px', backgroundColor: 'var(--color-warning)' }} />
            <span>{t('trackers.pending')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '2px', backgroundColor: 'var(--color-error)' }} />
            <span>{t('trackers.damaged')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '2px', backgroundColor: 'var(--color-alternate)' }} />
            <span>{t('trackers.notStarted')}</span>
          </div>
        </div>
      </div>

      {/* Map Content */}
      {loading ? (
        <LoadingSpinner />
      ) : mapData.length === 0 ? (
        <EmptyState message={t('trackers.noMapData')} />
      ) : (
        <div
          className="card"
          style={{
            overflow: 'auto',
            maxHeight: 'calc(100vh - 320px)',
            padding: '24px',
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease',
            }}
          >
            <motion.div variants={staggerParent} initial="initial" animate="animate">
            {mapData.map((field) => (
              <motion.div key={field.id} variants={fadeUpChild} style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-primary)' }}>
                  <Map size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  {field.name}
                </h3>
                {field.sections?.map((section) => (
                  <div key={section.id} style={{ marginBottom: '16px', marginLeft: '16px' }}>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        marginBottom: '8px',
                        cursor: 'pointer',
                        color: selectedSection === section.id ? 'var(--color-primary)' : 'var(--color-primary-text)',
                      }}
                      onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                    >
                      {section.name}
                    </h4>
                    {section.rows?.map((row) => (
                      <div key={row.id} style={{ marginBottom: '8px', marginLeft: '16px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginRight: '8px' }}>
                          {row.name}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' }}>
                          {row.trackers?.map((tracker) =>
                            tracker.modules?.map((module) => (
                              <div
                                key={module.id}
                                title={`${module.name} - ${module.status || 'N/A'}`}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '2px',
                                  backgroundColor: getModuleColor(module.status),
                                  cursor: 'pointer',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                }}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
