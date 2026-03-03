import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { toolsApi } from '../../../services';
import type { Tool, ToolKit } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Wrench, Plus, RotateCcw, Boxes, ClipboardList } from 'lucide-react';

interface ToolsTabProps {
  usersId: number;
}

interface AssignFormData {
  tool_id: string;
  quantity: string;
  notes: string;
}

interface ReturnFormData {
  quantity: string;
  condition: string;
  notes: string;
}

interface KitFormData {
  kit_id: string;
  notes: string;
}

const EMPTY_ASSIGN_FORM: AssignFormData = {
  tool_id: '',
  quantity: '1',
  notes: '',
};

const EMPTY_RETURN_FORM: ReturnFormData = {
  quantity: '1',
  condition: 'bom',
  notes: '',
};

const EMPTY_KIT_FORM: KitFormData = {
  kit_id: '',
  notes: '',
};

const CONDITION_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'danificado', label: 'Danificado' },
  { value: 'descartado', label: 'Descartado' },
];

export default function ToolsTab({ usersId }: ToolsTabProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [kits, setKits] = useState<ToolKit[]>([]);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);

  // Forms
  const [assignForm, setAssignForm] = useState<AssignFormData>(EMPTY_ASSIGN_FORM);
  const [returnForm, setReturnForm] = useState<ReturnFormData>(EMPTY_RETURN_FORM);
  const [kitForm, setKitForm] = useState<KitFormData>(EMPTY_KIT_FORM);

  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userTools = await toolsApi.getUserTools(usersId);
      setTools(userTools || []);
    } catch (err) {
      console.error('Failed to load user tools:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAssign = async () => {
    setModalLoading(true);
    try {
      const resp = await toolsApi.listTools({ page: 1, per_page: 100 });
      // Filtrar apenas as que estão disponíveis (sem assigned_user_id ou com saldo disponível)
      setAvailableTools(resp.items.filter(t => t.quantity_available > 0));
      setShowAssignModal(true);
    } catch (err) {
      console.error('Failed to load available tools:', err);
      showToast('Erro ao carregar ferramentas disponíveis.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenKit = async () => {
    setModalLoading(true);
    try {
      const resp = await toolsApi.listKits();
      setKits(resp || []);
      setShowKitModal(true);
    } catch (err) {
      console.error('Failed to load kits:', err);
      showToast('Erro ao carregar kits.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenReturn = (tool: Tool) => {
    setSelectedToolId(tool.id);
    setReturnForm({
      quantity: '1',
      condition: tool.condition,
      notes: '',
    });
    setShowReturnModal(true);
  };

  const handleAssign = async () => {
    if (!assignForm.tool_id) return;
    setModalLoading(true);
    try {
      await toolsApi.assignEmployee({
        tool_id: Number(assignForm.tool_id),
        user_id: usersId,
        quantity: Number(assignForm.quantity),
        notes: assignForm.notes,
      });
      showToast('Ferramenta vinculada com sucesso.', 'success');
      setShowAssignModal(false);
      setAssignForm(EMPTY_ASSIGN_FORM);
      loadData();
    } catch (err) {
      console.error('Failed to assign tool:', err);
      showToast('Erro ao vincular ferramenta.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedToolId) return;
    setModalLoading(true);
    try {
      await toolsApi.returnTool({
        tool_id: selectedToolId,
        quantity: Number(returnForm.quantity),
        condition: returnForm.condition,
        notes: returnForm.notes,
      });
      showToast('Ferramenta devolvida com sucesso.', 'success');
      setShowReturnModal(false);
      setSelectedToolId(null);
      loadData();
    } catch (err) {
      console.error('Failed to return tool:', err);
      showToast('Erro ao devolver ferramenta.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAssignKit = async () => {
    if (!kitForm.kit_id) return;
    setModalLoading(true);
    try {
      await toolsApi.assignKit({
        user_id: usersId,
        kit_id: Number(kitForm.kit_id),
        notes: kitForm.notes,
      });
      showToast('Kit vinculado com sucesso.', 'success');
      setShowKitModal(false);
      setKitForm(EMPTY_KIT_FORM);
      loadData();
    } catch (err) {
      console.error('Failed to assign kit:', err);
      showToast('Erro ao vincular kit. Verifique se há estoque das ferramentas do kit.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              color: 'white',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={handleOpenKit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Boxes size={16} /> Vincular Kit
        </button>
        <button className="btn btn-primary" onClick={handleOpenAssign} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Vincular Ferramenta
        </button>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '10px', borderRadius: '8px' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{tools.length}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>Ferramentas Atribuídas</div>
          </div>
        </div>
      </div>

      {/* Table */}
      {tools.length === 0 ? (
        <EmptyState message="Nenhuma ferramenta vinculada a este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ferramenta</th>
                <th>Patrimônio / Serial</th>
                <th>Quantidade</th>
                <th>Condição</th>
                <th>Data Atribuição</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {tools.map((tool) => (
                <motion.tr key={tool.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tool.model?.name || 'Ferramenta'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{tool.model?.category?.name}</div>
                  </td>
                  <td>
                    {tool.patrimonio_code && <div style={{ fontSize: '13px' }}>P: {tool.patrimonio_code}</div>}
                    {tool.serial_number && <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>S: {tool.serial_number}</div>}
                    {!tool.patrimonio_code && !tool.serial_number && '-'}
                  </td>
                  <td>{tool.quantity_total}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor:
                          tool.condition === 'bom' || tool.condition === 'novo'
                            ? '#F4FEF9'
                            : tool.condition === 'regular'
                            ? '#FFFBEB'
                            : '#FDE8E8',
                        color:
                          tool.condition === 'bom' || tool.condition === 'novo'
                            ? '#028F58'
                            : tool.condition === 'regular'
                            ? '#B45309'
                            : '#C0392B',
                      }}
                    >
                      {tool.condition.charAt(0).toUpperCase() + tool.condition.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(tool.updated_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-icon" onClick={() => handleOpenReturn(tool)} title="Devolver">
                      <RotateCcw size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div className="modal-backdrop" variants={modalBackdropVariants} initial="initial" animate="animate" exit="exit" onClick={() => setShowAssignModal(false)}>
            <motion.div className="modal-content" variants={modalContentVariants} onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
              <h3>Vincular Ferramenta</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div className="input-group">
                  <label>Ferramenta Disponível</label>
                  <SearchableSelect
                    options={availableTools.map(t => ({
                      value: String(t.id),
                      label: `${t.model?.name} ${t.patrimonio_code ? `[P: ${t.patrimonio_code}]` : ''} (${t.quantity_available} disponíveis)`
                    }))}
                    value={assignForm.tool_id}
                    onChange={(val) => setAssignForm({ ...assignForm, tool_id: String(val) })}
                    placeholder="Selecione a ferramenta..."
                  />
                </div>
                <div className="input-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    className="input-field"
                    value={assignForm.quantity}
                    onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
                    min="1"
                  />
                </div>
                <div className="input-group">
                  <label>Observações</label>
                  <textarea
                    className="input-field"
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="Opcional..."
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAssign} disabled={modalLoading || !assignForm.tool_id}>
                  {modalLoading ? 'Processando...' : 'Vincular'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div className="modal-backdrop" variants={modalBackdropVariants} initial="initial" animate="animate" exit="exit" onClick={() => setShowReturnModal(false)}>
            <motion.div className="modal-content" variants={modalContentVariants} onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
              <h3>Devolver Ferramenta</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div className="input-group">
                  <label>Quantidade a Devolver</label>
                  <input
                    type="number"
                    className="input-field"
                    value={returnForm.quantity}
                    onChange={(e) => setReturnForm({ ...returnForm, quantity: e.target.value })}
                    min="1"
                  />
                </div>
                <div className="input-group">
                  <label>Condição de Retorno</label>
                  <select
                    className="input-field"
                    value={returnForm.condition}
                    onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  >
                    {CONDITION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Observações</label>
                  <textarea
                    className="input-field"
                    value={returnForm.notes}
                    onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                    placeholder="Opcional..."
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleReturn} disabled={modalLoading}>
                  {modalLoading ? 'Processando...' : 'Confirmar Devolução'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kit Modal */}
      <AnimatePresence>
        {showKitModal && (
          <motion.div className="modal-backdrop" variants={modalBackdropVariants} initial="initial" animate="animate" exit="exit" onClick={() => setShowKitModal(false)}>
            <motion.div className="modal-content" variants={modalContentVariants} onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
              <h3>Vincular Kit de Ferramentas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div className="input-group">
                  <label>Kit Disponível</label>
                  <SearchableSelect
                    options={kits.map(k => ({
                      value: String(k.id),
                      label: `${k.name} (${k.cargo})`
                    }))}
                    value={kitForm.kit_id}
                    onChange={(val) => setKitForm({ ...kitForm, kit_id: String(val) })}
                    placeholder="Selecione o kit..."
                  />
                </div>
                <div className="input-group">
                  <label>Observações</label>
                  <textarea
                    className="input-field"
                    value={kitForm.notes}
                    onChange={(e) => setKitForm({ ...kitForm, notes: e.target.value })}
                    placeholder="Opcional..."
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setShowKitModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAssignKit} disabled={modalLoading || !kitForm.kit_id}>
                  {modalLoading ? 'Processando...' : 'Vincular Kit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
