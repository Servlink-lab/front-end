import { API_BASE, setApiConfig } from './config.js';
import { api } from './api.js';

// Cada entidade: path plural + chaves de envelope (singular/plural) do contrato da API.
const ENTITIES = {
  usuarios: {
    label: 'Usuários',
    path: '/usuarios',
    one: 'usuario',
    many: 'usuarios',
    authList: true,
    fields: [
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'tipo_conta', label: 'Tipo', type: 'select', options: ['profissional', 'estabelecimento', 'admin'], required: true },
      { name: 'ativo', label: 'Ativo', type: 'checkbox', default: true },
      { name: 'email_confirmado', label: 'E-mail confirmado', type: 'checkbox' },
    ],
  },
  estabelecimentos: {
    label: 'Estabelecimentos',
    path: '/estabelecimentos',
    one: 'estabelecimento',
    many: 'estabelecimentos',
    fields: [
      { name: 'usuario_id', label: 'Usuario ID', required: true },
      { name: 'cnpj', label: 'CNPJ', required: true },
      { name: 'nome_fantasia', label: 'Nome fantasia', required: true },
      { name: 'ramo', label: 'Ramo', required: true },
      { name: 'bairro', label: 'Bairro' },
      { name: 'wallet_saldo', label: 'Wallet', type: 'number', step: '0.01', default: 0 },
      { name: 'status_verificacao', label: 'Status', type: 'select', options: ['pendente', 'validado', 'rejeitado', 'bloqueado'], default: 'pendente' },
    ],
  },
  profissionais: {
    label: 'Profissionais',
    path: '/profissionais',
    one: 'profissional',
    many: 'profissionais',
    fields: [
      { name: 'usuario_id', label: 'Usuario ID', required: true },
      { name: 'cpf', label: 'CPF', required: true },
      { name: 'nome_completo', label: 'Nome completo', required: true },
      { name: 'selo_verificado', label: 'Verificado', type: 'checkbox' },
      { name: 'media_avaliacao', label: 'Média avaliação', type: 'number', step: '0.1' },
      { name: 'status_verificacao', label: 'Status', type: 'select', options: ['pendente', 'validado', 'rejeitado', 'bloqueado'], default: 'pendente' },
    ],
  },
  vagas: {
    label: 'Vagas',
    path: '/vagas',
    one: 'vaga',
    many: 'vagas',
    fields: [
      { name: 'estabelecimento_id', label: 'Estabelecimento ID', required: true },
      { name: 'funcao', label: 'Função', required: true },
      { name: 'valor_bruto', label: 'Valor R$', type: 'number', step: '0.01', required: true },
      { name: 'data_turno', label: 'Data turno', type: 'date', required: true },
      { name: 'hora_inicio', label: 'Hora início', type: 'time', required: true },
      { name: 'hora_fim', label: 'Hora fim', type: 'time', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['rascunho', 'publicado', 'expirado', 'cancelado'], default: 'rascunho' },
    ],
  },
};

let currentEntity = 'usuarios';
let editingId = null;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function showLoading(show) {
  document.getElementById('loading').classList.toggle('visible', show);
}

function renderField(field, value) {
  const val = value ?? field.default ?? '';
  if (field.type === 'select') {
    return `<label>${field.label}<select name="${field.name}" ${field.required ? 'required' : ''}>${
      field.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')
    }</select></label>`;
  }
  if (field.type === 'checkbox') {
    const checked = val === true || val === 'true' || field.default === true;
    return `<label class="checkbox-label"><input type="checkbox" name="${field.name}" ${checked ? 'checked' : ''}> ${field.label}</label>`;
  }
  return `<label>${field.label}<input name="${field.name}" type="${field.type || 'text'}" value="${val}" step="${field.step || ''}" ${field.required ? 'required' : ''}></label>`;
}

function buildForm(entity, data = {}) {
  const cfg = ENTITIES[entity];
  document.getElementById('form-title').textContent = editingId ? `Editar ${cfg.label}` : `Novo ${cfg.label}`;
  document.getElementById('entity-form').innerHTML = cfg.fields.map(f => renderField(f, data[f.name])).join('');
}

function formToPayload(entity) {
  const cfg = ENTITIES[entity];
  const form = document.getElementById('entity-form');
  const payload = {};
  cfg.fields.forEach(field => {
    const el = form.querySelector(`[name="${field.name}"]`);
    if (!el) return;
    if (field.type === 'checkbox') {
      payload[field.name] = el.checked;
    } else if (field.type === 'number') {
      payload[field.name] = el.value === '' ? null : Number(el.value);
    } else {
      payload[field.name] = el.value || null;
    }
  });
  return payload;
}

async function loadList() {
  const cfg = ENTITIES[currentEntity];
  showLoading(true);
  try {
    const res = await api.get(cfg.path, cfg.authList);
    const items = res[cfg.many] ?? [];
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = items.map(item => {
      const preview = item.nome_fantasia || item.nome_completo || item.email || item.funcao || item.id;
      return `<tr>
        <td>${preview}</td>
        <td><code>${item.id.slice(0, 8)}…</code></td>
        <td class="actions">
          <button type="button" data-action="edit" data-id="${item.id}">Editar</button>
          <button type="button" data-action="delete" data-id="${item.id}" class="btn-danger">Excluir</button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="3">Nenhum registro</td></tr>';
    document.getElementById('table-count').textContent = `${items.length} registros`;
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function saveRecord(e) {
  e.preventDefault();
  const cfg = ENTITIES[currentEntity];
  const payload = { [cfg.one]: formToPayload(currentEntity) };
  showLoading(true);
  try {
    if (editingId) {
      await api.put(`${cfg.path}/${editingId}`, payload);
      showToast('Registro atualizado');
    } else {
      await api.post(cfg.path, payload, true);
      showToast('Registro criado');
    }
    editingId = null;
    buildForm(currentEntity);
    await loadList();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function deleteRecord(id) {
  if (!confirm('Confirmar exclusão?')) return;
  const cfg = ENTITIES[currentEntity];
  showLoading(true);
  try {
    await api.delete(`${cfg.path}/${id}`);
    showToast('Registro removido');
    await loadList();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    showLoading(false);
  }
}

function switchEntity(entity) {
  currentEntity = entity;
  editingId = null;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.entity === entity);
  });
  document.getElementById('panel-title').textContent = ENTITIES[entity].label;
  buildForm(entity);
  loadList();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('api-base-display').textContent = API_BASE;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchEntity(btn.dataset.entity));
  });

  document.getElementById('record-form').addEventListener('submit', saveRecord);

  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    editingId = null;
    buildForm(currentEntity);
  });

  document.getElementById('table-body').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'delete') {
      deleteRecord(id);
      return;
    }
    if (btn.dataset.action === 'edit') {
      showLoading(true);
      try {
        const cfg = ENTITIES[currentEntity];
        const res = await api.get(`${cfg.path}/${id}`, cfg.authList);
        editingId = id;
        buildForm(currentEntity, res[cfg.one]);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        showLoading(false);
      }
    }
  });

  document.getElementById('config-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const base = document.getElementById('cfg-api-base').value.trim();
    const key = document.getElementById('cfg-api-key').value.trim();
    setApiConfig(base, key);
  });

  switchEntity('usuarios');
});
