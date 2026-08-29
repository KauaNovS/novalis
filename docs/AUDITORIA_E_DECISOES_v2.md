# Auditoria consolidada — decisões da atualização v2

## Decisões

- Não reconstruir o Novalis do zero.
- Preservar o CRM e os modelos atuais `Developer`, `Project`, `Tower`, `Unit`.
- Preservar a nomenclatura funcional dos documentos: TABELÃO, BOOK, ESPELHO DE VENDAS, TABELA DE PREÇOS e TABELA DE FINANCIAMENTO.
- Valor da unidade e valor/m² permanecem no núcleo da unidade.
- Valor/m² calculado é sempre derivado de `valor da unidade / área m²` quando ambos existem.
- Divergência com o valor/m² do documento não é apagada: é sinalizada.
- Matching de planta não pode inventar associação.
- OCR e Vision Computing são componentes do Intelligence Engine.
- Dados sem fonte suficiente não são inferidos como verdade.
- HMP sem planta/área documentada não deve ser completado por suposição.

## Problemas corrigidos

- colisão de `unitNumber` por falta de padding do final;
- ausência de `final` estruturado no `Unit` atual;
- ausência de `Planta` no schema atual;
- ausência de proveniência por campo;
- ausência de cálculo/validação explícita de valor/m²;
- fallback arbitrário no matching;
- separação entre código experimental e pipeline permanente.

## Não implementado silenciosamente

- OCR de PDF escaneado sem renderer de páginas;
- ingestão completa de BOOK por Vision;
- preenchimento das 45 HMP não documentadas;
- integração com provedor de Vision quando `OPENAI_API_KEY` não existe.
