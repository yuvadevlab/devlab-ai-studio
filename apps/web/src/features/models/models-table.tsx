"use client";

import {
  Button,
  Pencil,
  StudioStatusPill,
  StudioStatusTone,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Trash2,
} from "@devlab-ai-studio/ui";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import type { StudioModel } from "@/lib/studio-api";

export interface ModelsTableProps {
  models: StudioModel[];
  deleting: boolean;
  onEdit: (model: StudioModel) => void;
  onDelete: (id: string) => void;
}

/** Tabular catalog of registered models across providers with edit and delete icon actions. */
export function ModelsTable({ models, deleting, onEdit, onDelete }: ModelsTableProps) {
  return (
    <div className="studio-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_MODEL}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_MODEL_ID}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_PROVIDER}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_CONTEXT}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_INPUT_COST}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_OUTPUT_COST}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_STATUS}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.MODELS.COL_ACTIONS}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell>
                <strong>{model.displayName}</strong>
              </TableCell>
              <TableCell className="studio-mono studio-muted-label">{model.modelId}</TableCell>
              <TableCell>{model.provider?.name ?? model.providerId}</TableCell>
              <TableCell className="studio-mono">{model.contextWindow.toLocaleString()}</TableCell>
              <TableCell className="studio-mono">
                ${Number(model.inputCostPer1M ?? 0).toFixed(4)}
              </TableCell>
              <TableCell className="studio-mono">
                ${Number(model.outputCostPer1M ?? 0).toFixed(4)}
              </TableCell>
              <TableCell>
                <StudioStatusPill
                  tone={
                    model.isDeprecated
                      ? StudioStatusTone.WARNING
                      : model.isActive
                        ? StudioStatusTone.SUCCESS
                        : StudioStatusTone.ERROR
                  }
                  label={
                    model.isDeprecated
                      ? STUDIO_WEB_COPY.MODELS.STATUS_DEPRECATED
                      : model.isActive
                        ? STUDIO_WEB_COPY.COMMON.ACTIVE
                        : STUDIO_WEB_COPY.COMMON.INACTIVE
                  }
                />
              </TableCell>
              <TableCell>
                <div className="studio-table-actions">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(model)}
                    aria-label={`${STUDIO_WEB_COPY.COMMON.EDIT} ${model.displayName}`}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deleting}
                    onClick={() => onDelete(model.id)}
                    aria-label={`${STUDIO_WEB_COPY.COMMON.DELETE} ${model.displayName}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
