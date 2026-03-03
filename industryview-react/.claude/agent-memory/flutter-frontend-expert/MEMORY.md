# Flutter Frontend Expert - Memória do Projeto IndustryView

## Projeto App Flutter
- **Diretório**: `C:/Users/resaa/Downloads/Projetos/Doublex/IndustryView/IndustryView/industryView-app/industyView-app/`
- Infraestrutura em `lib/core/` (AppTheme, AppButton, AppTabBar, etc.)
- Estado global em `AppState()` via Provider
- Fonte padrão: GoogleFonts.lexend()

## Home Page Tarefas
- **Arquivo principal**: `lib/pages/home_page_tarefas/home_page_tarefas_widget.dart` (~7700 linhas)
- **Model**: `lib/pages/home_page_tarefas/home_page_tarefas_model.dart`
- Contém 3 listas: `listaSemSucesso`, `listaAndamento` (tarefas), `listaAndamento` (inspeções - tab 2)
- Cada lista usa `ListView.builder` com `Material` > `Container` como card
- `AppTabBar` com `useToggleButtonStyle: true` para as abas Tarefas/Inspeções

## Padrão Visual Adotado (pós-refactor)
- Background da página: `Color(0xFFF5F7FA)` (cinza muito claro)
- Cards: fundo `Colors.white`, `borderRadius 14`, shadow `opacity 0.07, blur 12, offset(0,3)`, border `Color(0xFFE8EAED)`
- Badges de equipamento: `borderRadius 8`, cores suaves (verde 0xFFE8F5E9, roxo 0xFFF3E5F5, amarelo 0xFFFFF9C4)
- Espaçamento entre cards: 12px
- Padding lateral do body: 16px
- Card Sprint: fundo branco com shadow, ícone de foguete, barra de progresso LinearProgressIndicator

## Padrões de Cores dos Badges por Tipo
- Tipo 1 (verde): background `0xFFE8F5E9`, border `0xFF66BB6A.withOpacity(0.5)`, texto `0xFF2E7D32`
- Tipo 2 (roxo): background `0xFFF3E5F5`, border `0xFFAB47BC.withOpacity(0.5)`, texto `0xFF6A1B9A`
- Tipo 3 (amarelo): background `0xFFFFF9C4`, border `0xFFFDD835.withOpacity(0.7)`, texto `0xFFF57F17`

## Observações Técnicas
- O arquivo usa `AppConstants.um/dois/tres/zero` para comparar tipos de equipamento
- `_isOfflineMaskedTask()` filtra tarefas mascaradas offline antes de renderizar
- AppBar usa `FlexibleSpaceBar` dentro de `PreferredSize(height: 85.0)`
- Header do card de subtarefa usa gradiente azul `[0xFF3B6EC8, 0xFF487EDA]`
