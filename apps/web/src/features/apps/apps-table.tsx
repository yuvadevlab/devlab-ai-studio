"use client";

import {
  AppWindow,
  Button,
  Copy,
  EmptyState,
  Pencil,
  Plus,
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
import type { StudioConsumerApp } from "@/lib/studio-api";

export interface AppsTableProps {
  apps: StudioConsumerApp[];
  onCreate: () => void;
  onEdit: (app: StudioConsumerApp) => void;
  onRotateKey: (slug: string) => void;
  onDelete: (slug: string) => void;
}

/** Table view for registered consumer apps backed by @yuva-devlab/ui Table. */
export function AppsTable({ apps, onCreate, onEdit, onRotateKey, onDelete }: AppsTableProps) {
  if (apps.length === 0) {
    return (
      <EmptyState
        icon={<AppWindow size={19} />}
        title={STUDIO_WEB_COPY.APPS.EMPTY_TITLE}
        description={STUDIO_WEB_COPY.APPS.EMPTY_DESC}
        action={
          <Button onClick={onCreate}>
            <Plus size={14} /> {STUDIO_WEB_COPY.APPS.ADD_CTA}
          </Button>
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_NAME}</TableHead>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_SLUG}</TableHead>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_ENDPOINT}</TableHead>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_BUDGET}</TableHead>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_STATUS}</TableHead>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_CREATED}</TableHead>
          <TableHead>{STUDIO_WEB_COPY.APPS.COL_ACTIONS}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {apps.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{app.name}</TableCell>
            <TableCell className="studio-mono">{app.slug}</TableCell>
            <TableCell className="studio-mono">{app.mcpEndpointUrl || "—"}</TableCell>
            <TableCell className="studio-mono">
              ${Number(app.monthlyBudgetUsd).toLocaleString()}
            </TableCell>
            <TableCell>
              <StudioStatusPill
                tone={app.isActive ? StudioStatusTone.SUCCESS : StudioStatusTone.ERROR}
                label={
                  app.isActive ? STUDIO_WEB_COPY.COMMON.ACTIVE : STUDIO_WEB_COPY.COMMON.INACTIVE
                }
              />
            </TableCell>
            <TableCell className="studio-mono">
              {new Date(app.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`${STUDIO_WEB_COPY.COMMON.EDIT} ${app.name}`}
                onClick={() => onEdit(app)}
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`${STUDIO_WEB_COPY.APPS.ROTATE_KEY_ACTION} ${app.name}`}
                onClick={() => onRotateKey(app.slug)}
              >
                <Copy size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`${STUDIO_WEB_COPY.COMMON.DELETE} ${app.name}`}
                onClick={() => onDelete(app.slug)}
              >
                <Trash2 size={14} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
