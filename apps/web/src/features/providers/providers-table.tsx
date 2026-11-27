"use client";

import Link from "next/link";
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
import { StudioWebRoute } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import type { StudioProvider } from "@/lib/studio-api";

export interface ProvidersTableProps {
  providers: StudioProvider[];
  modelCounts: Map<string, number>;
  pending: boolean;
  onEdit: (provider: StudioProvider) => void;
  onDelete: (slug: string) => void;
}

/** Tabular catalog of upstream LLM providers with edit and delete actions. */
export function ProvidersTable({
  providers,
  modelCounts,
  pending,
  onEdit,
  onDelete,
}: ProvidersTableProps) {
  return (
    <div className="studio-table-wrap">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_PROVIDER}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_SLUG}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_BASE_URL}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_MODELS}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_API_KEY}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_STATUS}</TableHead>
            <TableHead>{STUDIO_WEB_COPY.PROVIDERS.COL_ACTIONS}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => {
            const count = provider._count?.models ?? modelCounts.get(provider.id) ?? 0;
            return (
              <TableRow key={provider.id}>
                <TableCell>
                  <Link
                    href={`${StudioWebRoute.MODELS}/${encodeURIComponent(provider.slug)}`}
                    className="studio-provider-link"
                  >
                    {provider.name}
                  </Link>
                </TableCell>
                <TableCell className="studio-mono studio-muted-label">{provider.slug}</TableCell>
                <TableCell className="studio-mono">{provider.baseUrl}</TableCell>
                <TableCell className="studio-mono">{count}</TableCell>
                <TableCell className="studio-mono">
                  {provider.keyMask ?? STUDIO_WEB_COPY.PROVIDERS.KEY_UNSET}
                </TableCell>
                <TableCell>
                  <StudioStatusPill
                    tone={provider.isActive ? StudioStatusTone.SUCCESS : StudioStatusTone.ERROR}
                    label={
                      provider.isActive
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
                      onClick={() => onEdit(provider)}
                      aria-label={`${STUDIO_WEB_COPY.PROVIDERS.EDIT_ACTION} ${provider.name}`}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => onDelete(provider.slug)}
                      aria-label={`${STUDIO_WEB_COPY.PROVIDERS.DELETE_ACTION} ${provider.name}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
