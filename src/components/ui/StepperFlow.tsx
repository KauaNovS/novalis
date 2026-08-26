"use client";

import { ChevronRight, X } from "lucide-react";

export type StepStatus = "done" | "current" | "upcoming";

export interface StepItem {
  label: string;
  secondaryLabel?: string;
  status: StepStatus;
}

export interface TerminalState {
  label: string;
  onAction?: () => void;
}

interface StepperFlowProps {
  steps?: StepItem[];
  terminalState?: TerminalState;
}

export default function StepperFlow({ steps = [], terminalState }: StepperFlowProps) {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const isDone = step.status === "done";
          const isCurrent = step.status === "current";
          const isUpcoming = step.status === "upcoming";

          return (
            <div key={index} className="flex items-center">
              <div
                className={`relative flex items-center rounded-lg border px-4 py-2 ${
                  isDone
                    ? "border-gray-300 bg-gray-100 text-gray-600"
                    : isCurrent
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                <div className="text-sm font-medium">{step.label}</div>
                {step.secondaryLabel && (
                  <div
                    className={`ml-2 text-xs ${
                      isDone
                        ? "text-gray-500"
                        : isCurrent
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  >
                    {step.secondaryLabel}
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <ChevronRight
                  className="h-4 w-4 text-gray-300 mx-2"
                  strokeWidth={1.5}
                />
              )}
            </div>
          );
        })}

        {terminalState && (
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-300 mx-2" strokeWidth={1.5} />
            <button
              onClick={terminalState.onAction}
              className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <X className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
              {terminalState.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}