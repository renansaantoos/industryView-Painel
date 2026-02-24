import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { tasksApi, equipamentTypesApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Trash2, Edit, Ruler, BookOpen, Tag } from 'lucide-react';

interface SettingsItem {
  id: number;
  displayName: string;
}

type ActiveTab = 'unity' | 'discipline' | 'category';

export default function Settings() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();

  const [activeTab, setActiveTab] = useState<ActiveTab>('unity');
  const [unities, setUnities] = useState<SettingsItem[]>([]);
  const [disciplines, setDisciplines] = useState<SettingsItem[]>([]);
  const [categories, setCategories] = useState<SettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: ActiveTab; id: number } | null>(null);

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: number } | null>(null);
  const [itemName, setItemName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    setNavBarSelection(11);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [unityData, disciplineData, categoryData] = await Promise.all([
        tasksApi.getUnity().catch(() => []),
        tasksApi.getDisciplines().catch(() => []),
        equipamentTypesApi.queryAllEquipamentTypes().catch(() => []),
      ]);

      const rawUnities = Array.isArray(unityData) ? unityData : [];
      const rawDisciplines = Array.isArray(disciplineData) ? disciplineData : [];
      const rawCategories = Array.isArray(categoryData) ? categoryData : [];

      setUnities(rawUnities.map((u) => {
        const row = u as { id?: number | string; unity?: string; name?: string };
        return {
          id: Number(row.id),
          displayName: row.unity || row.name || `#${row.id}`,
        };
      }));

      setDisciplines(rawDisciplines.map((d) => {
        const row = d as { id?: number | string; discipline?: string; name?: string };
        return {
          id: Number(row.id),
          displayName: row.discipline || row.name || `#${row.id}`,
        };
      }));

      setCategories(rawCategories.map((c) => {
        const row = c as { id?: number | string; type?: string; name?: string };
        return {
          id: Number(row.id),
          displayName: row.type || row.name || `#${row.id}`,
        };
      }));
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setItemName('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: SettingsItem) => {
    setEditingItem({ id: item.id });
    setItemName(item.displayName);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!itemName.trim()) return;
    setModalLoading(true);
    try {
      if (activeTab === 'unity') {
        if (editingItem) {
          await tasksApi.editUnity(editingItem.id, { name: itemName.trim() });
        } else {
          await tasksApi.addUnity({ name: itemName.trim() });
        }
      } else if (activeTab === 'discipline') {
        if (editingItem) {
          await tasksApi.editDiscipline(editingItem.id, { name: itemName.trim() });
        } else {
          await tasksApi.addDiscipline({ name: itemName.trim() });
        }
      } else if (activeTab === 'category') {
        if (editingItem) {
          await equipamentTypesApi.editEquipamentType(editingItem.id, { type: itemName.trim() });
        } else {
          await equipamentTypesApi.addEquipamentType({ type: itemName.trim() });
        }
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type: ActiveTab, id: number) => {
    try {
      if (type === 'unity') {
        await tasksApi.deleteUnity(id);
      } else if (type === 'discipline') {
        await tasksApi.deleteDiscipline(id);
      } else if (type === 'category') {
        await equipamentTypesApi.deleteEquipamentType(id);
      }
      loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeleteConfirm(null);
  };

  const currentItems: SettingsItem[] = (() => {
    if (activeTab === 'unity') return unities;
    if (activeTab === 'discipline') return disciplines;
    return categories;
  })();

  const getAddLabel = () => {
    if (activeTab === 'unity') return t('settings.addUnity');
    if (activeTab === 'discipline') return t('settings.addDiscipline');
    return t('settings.addCategory');
  };

  const getModalTitle = () => {
    if (activeTab === 'unity') return editingItem ? t('settings.editUnity') : t('settings.addUnity');
    if (activeTab === 'discipline') return editingItem ? t('settings.editDiscipline') : t('settings.addDiscipline');
    return editingItem ? t('settings.editCategory') : t('settings.addCategory');
  };

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
    transition: 'all 0.2s ease',
  });

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--color-alternate)' }}>
        <button onClick={() => setActiveTab('unity')} style={tabStyle('unity')}>
          <Ruler size={16} />
          {t('settings.unities')}
        </button>
        <button onClick={() => setActiveTab('discipline')} style={tabStyle('discipline')}>
          <BookOpen size={16} />
          {t('settings.disciplines')}
        </button>
        <button onClick={() => setActiveTab('category')} style={tabStyle('category')}>
          <Tag size={16} />
          {t('settings.categories')}
        </button>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', margin: 0 }}>
          {currentItems.length} {currentItems.length === 1 ? 'item' : 'itens'}
        </p>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          {getAddLabel()}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : currentItems.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} />
              {getAddLabel()}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('settings.name')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody key={activeTab} variants={staggerParent} initial="initial" animate="animate">
              {currentItems.map((item) => (
                <motion.tr key={item.id} variants={tableRowVariants}>
                  <td style={{ fontWeight: 500 }}>{item.displayName}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-icon" title={t('common.edit')} onClick={() => handleOpenEditModal(item)}>
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteConfirm({ type: activeTab, id: item.id })}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{getModalTitle()}</h3>
            <div className="input-group">
              <label>{t('settings.name')} *</label>
              <input
                className="input-field"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={modalLoading || !itemName.trim()}>
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('settings.confirmDelete')}
          onConfirm={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
