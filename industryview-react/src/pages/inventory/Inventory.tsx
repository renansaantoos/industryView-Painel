import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants, fadeUpChild } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { inventoryApi, unityApi, equipamentTypesApi, manufacturersApi, projectsApi } from '../../services';
import type { InventoryProduct, Unity, EquipamentType, Manufacturer, ProjectInfo } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProjectSelector from '../../components/common/ProjectSelector';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';
import {
  Plus,
  Search,
  Trash2,
  Package,
  MinusCircle,
  PlusCircle,
  Download,
  History,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { formatNumber } from '../../utils/formatters';
import { downloadCsv } from '../../utils/csvUtils';

export default function Inventory() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // KPI from backend
  const [kpiLow, setKpiLow] = useState(0);
  const [kpiNo, setKpiNo] = useState(0);
  const [kpiAll, setKpiAll] = useState(0);

  // Reference data
  const [unityOptions, setUnityOptions] = useState<Unity[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<EquipamentType[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<Manufacturer[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectInfo[]>([]);

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productMinQuantity, setProductMinQuantity] = useState('');
  const [productUnityId, setProductUnityId] = useState<number | undefined>();
  const [productCategoryId, setProductCategoryId] = useState<number | undefined>();
  const [productManufacturerId, setProductManufacturerId] = useState<number | undefined>();
  const [productProjectId, setProductProjectId] = useState<number | undefined>();
  const [modalLoading, setModalLoading] = useState(false);

  // Bloco K fields
  const [showBlocoK, setShowBlocoK] = useState(false);
  const [ncmCode, setNcmCode] = useState('');
  const [cestCode, setCestCode] = useState('');
  const [originIndicator, setOriginIndicator] = useState<string>('');
  const [custodyType, setCustodyType] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [batchLot, setBatchLot] = useState('');
  const [fiscalClassification, setFiscalClassification] = useState('');
  const [barcodeField, setBarcodeField] = useState('');

  // Quantity adjustment modal
  const [adjustProduct, setAdjustProduct] = useState<InventoryProduct | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustReason, setAdjustReason] = useState('');

  // Logs modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState<unknown[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  useEffect(() => {
    setNavBarSelection(9);
  }, []);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [unityData, categoryData, manufacturerData, projectsData] = await Promise.all([
          unityApi.queryAllUnity().catch(() => []),
          equipamentTypesApi.queryAllEquipamentTypes().catch(() => []),
          manufacturersApi.queryAllManufacturers().then(res => {
            return (res as any).items || res || [];
          }).catch(() => []),
          projectsApi.queryAllProjects({ per_page: 100 }).then(res => {
            return (res as any).items || res || [];
          }).catch(() => []),
        ]);
        setUnityOptions(Array.isArray(unityData) ? unityData : []);
        setCategoryOptions(Array.isArray(categoryData) ? categoryData : []);
        setManufacturerOptions(Array.isArray(manufacturerData) ? manufacturerData : []);
        setProjectOptions(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    };
    loadReferenceData();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await inventoryApi.queryAllProducts({
        projects_id: projectsInfo.id,
        page,
        per_page: perPage,
        search: search || undefined,
        sort_field: sortField || undefined,
        sort_direction: sortDirection || undefined,
      });
      // Backend returns { result1: { items, pageTotal, ... }, low, no, all }
      const result1 = data.result1;
      setProducts(result1?.items || []);
      setTotalPages(result1?.pageTotal || 1);
      setTotalItems(result1?.itemsTotal || 0);
      setKpiLow(data.low || 0);
      setKpiNo(data.no || 0);
      setKpiAll(typeof data.all === 'number' ? data.all : 0);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, search, sortField, sortDirection]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetAddForm = () => {
    setProductCode('');
    setProductName('');
    setProductDescription('');
    setProductQuantity('');
    setProductMinQuantity('');
    setProductUnityId(undefined);
    setProductCategoryId(undefined);
    setProductManufacturerId(undefined);
    setProductProjectId(projectsInfo?.id);
    setShowBlocoK(false);
    setNcmCode('');
    setCestCode('');
    setOriginIndicator('');
    setCustodyType('');
    setCostPrice('');
    setBatchLot('');
    setFiscalClassification('');
    setBarcodeField('');
  };

  const handleAddProduct = async () => {
    if (!productName.trim()) return;
    setModalLoading(true);
    try {
      await inventoryApi.addProduct({
        projects_id: productProjectId || projectsInfo?.id,
        code: productCode.trim() || undefined,
        product: productName.trim(),
        specifications: productDescription.trim() || undefined,
        inventory_quantity: productQuantity ? parseInt(productQuantity, 10) : 0,
        min_quantity: productMinQuantity ? parseInt(productMinQuantity, 10) : undefined,
        unity_id: productUnityId || undefined,
        equipaments_types_id: productCategoryId || undefined,
        manufacturers_id: productManufacturerId || undefined,
        // Bloco K
        ncm_code: ncmCode.trim() || undefined,
        cest_code: cestCode.trim() || undefined,
        origin_indicator: originIndicator ? parseInt(originIndicator, 10) : undefined,
        custody_type: (custodyType as 'own' | 'third_party') || undefined,
        cost_price: costPrice ? parseFloat(costPrice) : undefined,
        batch_lot: batchLot.trim() || undefined,
        fiscal_classification: fiscalClassification.trim() || undefined,
        barcode: barcodeField.trim() || undefined,
      });
      resetAddForm();
      setShowAddModal(false);
      loadProducts();
    } catch (err) {
      console.error('Failed to add product:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAdjustQuantity = async () => {
    if (!adjustProduct || !adjustQuantity) return;
    setModalLoading(true);
    try {
      const qty = parseInt(adjustQuantity, 10);
      if (adjustType === 'add') {
        await inventoryApi.addQuantity({ product_inventory_id: adjustProduct.id, quantity: qty });
      } else {
        await inventoryApi.removeQuantity({ product_inventory_id: adjustProduct.id, quantity: qty });
      }
      setAdjustProduct(null);
      setAdjustQuantity('');
      setAdjustReason('');
      loadProducts();
    } catch (err) {
      console.error('Failed to adjust quantity:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await inventoryApi.deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
    setDeleteConfirm(null);
  };

  const handleViewLogs = async (productId: number) => {
    setShowLogsModal(true);
    setLogsLoading(true);
    try {
      const data = await inventoryApi.getProductLogs(productId);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (products.length === 0) return;
    const csvData = products.map((p) => ({
      [t('inventory.code', 'Codigo')]: p.code || '',
      [t('inventory.productName')]: p.product,
      [t('inventory.category')]: p.equipaments_types?.type || '',
      [t('inventory.quantity')]: p.inventory_quantity,
      [t('inventory.minQuantity')]: p.min_quantity || '',
      [t('inventory.unit', 'Unidade')]: p.unity?.unity || '',
      [t('inventory.manufacturer', 'Fabricante')]: p.manufacturers?.name || '',
      [t('inventory.status')]: p.status_inventory?.status || '',
      NCM: p.ncm_code || '',
      CEST: p.cest_code || '',
      [t('inventory.barcodeField', 'Codigo de Barras')]: p.barcode || '',
    }));
    downloadCsv(csvData, `estoque_${projectsInfo?.name || 'export'}.csv`);
  };

  const getStockStatus = (product: InventoryProduct) => {
    const qty = product.inventory_quantity || 0;
    const minQty = product.min_quantity || 0;
    if (qty === 0) {
      return { label: t('inventory.outOfStock'), color: 'var(--color-error)', bg: 'var(--color-status-01)' };
    }
    if (minQty > 0 && qty <= minQty) {
      return { label: t('inventory.lowStock'), color: 'var(--color-warning)', bg: 'var(--color-status-02, var(--color-status-01))' };
    }
    return { label: t('inventory.inStock'), color: 'var(--color-success)', bg: 'var(--color-status-04)' };
  };

  if (!projectsInfo) return <ProjectSelector />;

  return (
    <div>
      <PageHeader
        title={t('inventory.title')}
        subtitle={t('inventory.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('inventory.title')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleExportCsv}>
              <Download size={18} /> CSV
            </button>
            <button className="btn btn-primary" onClick={() => { setProductProjectId(projectsInfo?.id); setShowAddModal(true); }}>
              <Plus size={18} /> {t('inventory.addProduct')}
            </button>
          </div>
        }
      />

      {/* KPI Cards - using backend counters */}
      <motion.div
        variants={staggerParent}
        initial="initial"
        animate="animate"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          { key: 'all', label: t('inventory.totalInStock', 'Total em Estoque'), value: kpiAll, icon: <Package size={24} />, color: 'var(--color-primary)' },
          { key: 'low', label: t('inventory.lowStock', 'Estoque Baixo'), value: kpiLow, icon: <AlertTriangle size={24} />, color: 'var(--color-warning)' },
          { key: 'no', label: t('inventory.outOfStock', 'Sem Estoque'), value: kpiNo, icon: <XCircle size={24} />, color: 'var(--color-error)' },
        ].map((card) => (
          <motion.div key={card.key} variants={fadeUpChild} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: `${card.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '2px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-text)' }}>
                {formatNumber(card.value)}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
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
            placeholder={t('inventory.searchProducts')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => { setProductProjectId(projectsInfo?.id); setShowAddModal(true); }}>
              <Plus size={18} /> {t('inventory.addProduct')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('inventory.code', 'Codigo')}</th>
                <SortableHeader label={t('inventory.productName')} field="product" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('inventory.category')}</th>
                <SortableHeader label={t('inventory.quantity')} field="inventory_quantity" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('inventory.minQuantity')} field="min_quantity" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('inventory.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {products.map((product) => {
                const status = getStockStatus(product);
                return (
                  <motion.tr key={product.id} variants={tableRowVariants}>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{product.code || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>{product.product}</span>
                      </div>
                    </td>
                    <td>{product.equipaments_types?.type || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{formatNumber(product.inventory_quantity)}</td>
                    <td>{product.min_quantity != null ? formatNumber(product.min_quantity) : '-'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-icon"
                          title={t('inventory.addQuantity')}
                          onClick={() => {
                            setAdjustProduct(product);
                            setAdjustType('add');
                          }}
                        >
                          <PlusCircle size={16} color="var(--color-success)" />
                        </button>
                        <button
                          className="btn btn-icon"
                          title={t('inventory.removeQuantity')}
                          onClick={() => {
                            setAdjustProduct(product);
                            setAdjustType('remove');
                          }}
                        >
                          <MinusCircle size={16} color="var(--color-warning)" />
                        </button>
                        <button className="btn btn-icon" title={t('inventory.viewLogs')} onClick={() => handleViewLogs(product.id)}>
                          <History size={16} color="var(--color-primary)" />
                        </button>
                        <button className="btn btn-icon" title={t('common.delete')} onClick={() => setDeleteConfirm(product.id)}>
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => { setShowAddModal(false); resetAddForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', minWidth: '320px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('inventory.addProduct')}</h3>
            {/* Project selector */}
            <div className="input-group" style={{ marginBottom: '4px' }}>
              <label>{t('projects.title', 'Projeto')}</label>
              <SearchableSelect
                options={projectOptions.map(p => ({ value: p.id, label: p.name }))}
                value={productProjectId}
                onChange={(v) => setProductProjectId(v as number | undefined)}
                placeholder={t('common.select', 'Selecione o projeto...')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('inventory.code', 'Código')}</label>
                  <input className="input-field" value={productCode} onChange={(e) => setProductCode(e.target.value)} placeholder="Ex: MAT-0001" maxLength={50} />
                </div>
                <div className="input-group">
                  <label>{t('inventory.productName')} *</label>
                  <input className="input-field" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t('inventory.productNamePlaceholder')} />
                </div>
              </div>
              <div className="input-group">
                <label>{t('inventory.specifications', 'Especificações')}</label>
                <textarea
                  className="input-field"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder={t('inventory.specificationsPlaceholder', 'Descreva as especificações do produto...')}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('inventory.category')}</label>
                  <SearchableSelect
                    options={categoryOptions.map(c => ({ value: c.id, label: c.type }))}
                    value={productCategoryId}
                    onChange={(v) => setProductCategoryId(v as number | undefined)}
                    placeholder={t('common.select', 'Selecione...')}
                  />
                </div>
                <div className="input-group">
                  <label>{t('inventory.unit', 'Unidade')}</label>
                  <SearchableSelect
                    options={unityOptions.map(u => ({ value: u.id, label: u.unity }))}
                    value={productUnityId}
                    onChange={(v) => setProductUnityId(v as number | undefined)}
                    placeholder={t('common.select', 'Selecione...')}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>{t('inventory.manufacturer', 'Fabricante')}</label>
                <SearchableSelect
                  options={manufacturerOptions.map(m => ({ value: m.id, label: m.name }))}
                  value={productManufacturerId}
                  onChange={(v) => setProductManufacturerId(v as number | undefined)}
                  placeholder={t('common.select', 'Selecione...')}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('inventory.quantity')}</label>
                  <input type="number" className="input-field" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} min="0" />
                </div>
                <div className="input-group">
                  <label>{t('inventory.minQuantity')}</label>
                  <input type="number" className="input-field" value={productMinQuantity} onChange={(e) => setProductMinQuantity(e.target.value)} min="0" />
                </div>
              </div>

              {/* Bloco K - Collapsible Section */}
              <div style={{ borderTop: '1px solid var(--color-alternate)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowBlocoK(!showBlocoK)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--color-primary-text)',
                    padding: 0,
                    width: '100%',
                  }}
                >
                  <ChevronDown
                    size={16}
                    style={{
                      transition: 'transform 0.2s',
                      transform: showBlocoK ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                  {t('inventory.fiscalData', 'Dados Fiscais (Bloco K)')}
                </button>

                {showBlocoK && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label>{t('inventory.ncmCode', 'Código NCM')}</label>
                        <input className="input-field" value={ncmCode} onChange={(e) => setNcmCode(e.target.value)} maxLength={8} placeholder="00000000" />
                      </div>
                      <div className="input-group">
                        <label>{t('inventory.cestCode', 'Código CEST')}</label>
                        <input className="input-field" value={cestCode} onChange={(e) => setCestCode(e.target.value)} maxLength={7} placeholder="0000000" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label>{t('inventory.originIndicator', 'Indicador de Origem')}</label>
                        <select className="select-field" value={originIndicator} onChange={(e) => setOriginIndicator(e.target.value)}>
                          <option value="">{t('common.select', 'Selecione...')}</option>
                          <option value="0">0 - Nacional</option>
                          <option value="1">1 - Estrangeira (importação direta)</option>
                          <option value="2">2 - Estrangeira (adquirida no mercado interno)</option>
                          <option value="3">3 - Nacional (conteúdo importação &gt; 40%)</option>
                          <option value="4">4 - Nacional (produção conforme processos básicos)</option>
                          <option value="5">5 - Nacional (conteúdo importação &lt;= 40%)</option>
                          <option value="6">6 - Estrangeira (importação direta, sem similar)</option>
                          <option value="7">7 - Estrangeira (mercado interno, sem similar)</option>
                          <option value="8">8 - Nacional (conteúdo importação &gt; 70%)</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>{t('inventory.custodyType', 'Tipo de Custódia')}</label>
                        <select className="select-field" value={custodyType} onChange={(e) => setCustodyType(e.target.value)}>
                          <option value="">{t('common.select', 'Selecione...')}</option>
                          <option value="own">{t('inventory.custodyOwn', 'Próprio')}</option>
                          <option value="third_party">{t('inventory.custodyThirdParty', 'Terceiros')}</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label>{t('inventory.costPrice', 'Preço de Custo')}</label>
                        <input type="number" className="input-field" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" />
                      </div>
                      <div className="input-group">
                        <label>{t('inventory.batchLot', 'Lote/Batelada')}</label>
                        <input className="input-field" value={batchLot} onChange={(e) => setBatchLot(e.target.value)} maxLength={100} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label>{t('inventory.fiscalClassification', 'Classificação Fiscal')}</label>
                        <input className="input-field" value={fiscalClassification} onChange={(e) => setFiscalClassification(e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>{t('inventory.barcodeField', 'Código de Barras')}</label>
                        <input className="input-field" value={barcodeField} onChange={(e) => setBarcodeField(e.target.value)} maxLength={14} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetAddForm(); }}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={handleAddProduct} disabled={modalLoading}>
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Quantity Modal */}
      {adjustProduct && (
        <div className="modal-backdrop" onClick={() => setAdjustProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', minWidth: '320px', maxWidth: '480px', width: '90%' }}>
            <h3 style={{ marginBottom: '16px' }}>
              {adjustType === 'add' ? t('inventory.addQuantity') : t('inventory.removeQuantity')} - {adjustProduct.product}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('inventory.quantity')} *</label>
                <input type="number" className="input-field" value={adjustQuantity} onChange={(e) => setAdjustQuantity(e.target.value)} min="1" />
              </div>
              <div className="input-group">
                <label>{t('inventory.reason')}</label>
                <input className="input-field" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setAdjustProduct(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={handleAdjustQuantity} disabled={modalLoading}>
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="modal-backdrop" onClick={() => setShowLogsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '600px', maxHeight: '80vh', width: '90%' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('inventory.viewLogs')}</h3>
            {logsLoading ? (
              <LoadingSpinner />
            ) : logs.length === 0 ? (
              <p style={{ color: 'var(--color-secondary-text)', textAlign: 'center', padding: '24px' }}>{t('common.noData')}</p>
            ) : (
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {logs.map((log: unknown, index: number) => {
                  const l = log as Record<string, unknown>;
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid var(--color-alternate)',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 500 }}>{l.type === true ? 'Entrada' : l.type === false ? 'Saída' : String(l.type || '-')}</span>
                        <span style={{ color: 'var(--color-secondary-text)' }}>
                          {l.quantity ? `${l.quantity} un` : ''} | {String(l.created_at || '-')}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-secondary-text)', marginTop: '4px' }}>{String(l.observations || '-')}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogsModal(false)}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('inventory.confirmDelete')}
          onConfirm={() => handleDeleteProduct(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
