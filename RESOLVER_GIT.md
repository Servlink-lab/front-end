# Instruções Seguras para Resolver o Conflito (Projeto em Grupo)

**IMPORTANTE:** Como você está em um grupo, **NUNCA** use `git push --force`. Isso apagaria o trabalho dos seus colegas.

## Método Seguro: Resolver Conflitos e Manter Tudo

### 1. Identificar os arquivos
O Git avisou que `index.html` e `styles.css` têm conflitos.

### 2. Resolver no Editor (VS Code)
1. Abra o `index.html`.
2. Procure pelas marcas `<<<<<<<`, `=======` e `>>>>>>>`.
3. O VS Code mostrará opções no topo do conflito. Escolha **"Accept Both Changes"** se quiser manter as duas partes, ou escolha a que for a correta.
4. Repita para o `styles.css`.

### 3. Finalizar e Enviar
Após salvar os arquivos sem as marcas de conflito, execute no terminal:

```powershell
# 1. Adicione os arquivos resolvidos
git add index.html styles.css

# 2. Finalize o processo de união (merge)
git commit -m "fix: resolvendo conflitos e integrando trabalho do grupo"

# 3. Agora o push funcionará normalmente
git push origin main
```

---
*Este guia foi atualizado para priorizar a segurança do código da equipe.*
