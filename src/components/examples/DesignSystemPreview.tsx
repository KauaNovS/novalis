"use client";

import { File, Home, Building } from "lucide-react";
import StepperFlow from "../ui/StepperFlow";
import ProgressCard from "../ui/ProgressCard";
import PillBadge from "../ui/PillBadge";
import QuickActionRow from "../ui/QuickActionRow";
import InfoListCard from "../ui/InfoListCard";
import CollapsibleListCard from "../ui/CollapsibleListCard";
import EmptyStateCard from "../ui/EmptyStateCard";

export default function DesignSystemPreview() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Design System Preview</h1>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">StepperFlow</h2>
          <StepperFlow
            steps={[
              { label: "Cadastro", secondaryLabel: "Sistema", status: "done" },
              { label: "Análise", secondaryLabel: "Equipe", status: "done" },
              { label: "Aprovação", secondaryLabel: "Gestor", status: "current" },
              { label: "Finalização", secondaryLabel: "Cliente", status: "upcoming" },
            ]}
            terminalState={{ label: "Cancelado", onAction: () => {} }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">ProgressCard</h2>
          <ProgressCard
            label="Documentação pendente"
            percentage={72}
            pendingText="3 documentos aguardando envio"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">PillBadge</h2>
          <div className="flex gap-2">
            <PillBadge text="Ativo" variant="solid" />
            <PillBadge text="Pendente" variant="outline" />
            <PillBadge text="Concluído" variant="solid" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">QuickActionRow</h2>
          <QuickActionRow
            actions={[
              { icon: <File size={18} />, label: "Gerar relatório", onClick: () => {} },
              { icon: <Home size={18} />, label: "Cadastrar imóvel", onClick: () => {} },
              { icon: <Building size={18} />, label: "Nova incorporadora", onClick: () => {} },
            ]}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">InfoListCard</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoListCard
              title="Informações do projeto"
              items={[
                { label: "Nome", value: "Residencial Horizonte", type: "text" },
                { label: "Localização", value: "São Paulo, SP", type: "tag" },
                { label: "Avaliação", value: "4", type: "rating", rating: 4 },
              ]}
            />
            <InfoListCard
              title="Detalhes adicionais"
              items={[
                { label: "Tipo", value: "Residencial", type: "text" },
                { label: "Valor", value: "R$ 850.000", type: "text" },
                { label: "Status", value: "Em análise", type: "tag" },
              ]}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">CollapsibleListCard</h2>
          <CollapsibleListCard
            title="Tarefas"
            count={3}
            actionLabel="Ver todas"
            onAction={() => {}}
            items={[
              { title: "Revisar contrato", content: "Detalhes sobre a revisão do contrato." },
              { title: "Enviar proposta", content: "Detalhes sobre o envio da proposta." },
              { title: "Agendar visita", content: "Detalhes sobre o agendamento da visita." },
            ]}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-600">EmptyStateCard</h2>
          <EmptyStateCard
            title="Documentos"
            emptyMessage="Nenhum documento cadastrado ainda."
            actionLabel="Adicionar documento"
            onAction={() => {}}
            icon={<File size={32} />}
          />
        </section>
      </div>
    </main>
  );
}
