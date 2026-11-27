import {
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@yuva-devlab/ui";

export interface StudioRunTableItem {
  id: string;
  traceId: string;
  profileSlug: string;
  status: string;
  finalModelId: string | null;
  tokensIn: number;
  tokensOut: number;
  totalCostUsd: string | number;
  latencyMs: number;
}

export interface StudioRunsTableProps {
  runs: StudioRunTableItem[];
  emptyLabel: string;
  showExtendedColumns?: boolean;
  columns: {
    trace: string;
    profile: string;
    status: string;
    model: string;
    tokens?: string;
    cost?: string;
    latency: string;
  };
}

/** Reusable telemetry runs table shared between Overview and Telemetry views. */
export function StudioRunsTable({
  runs,
  emptyLabel,
  showExtendedColumns = false,
  columns,
}: StudioRunsTableProps) {
  if (runs.length === 0) {
    return <EmptyState title={emptyLabel} description="" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{columns.trace}</TableHead>
          <TableHead>{columns.profile}</TableHead>
          <TableHead>{columns.status}</TableHead>
          <TableHead>{columns.model}</TableHead>
          {showExtendedColumns ? <TableHead>{columns.tokens}</TableHead> : null}
          {showExtendedColumns ? <TableHead>{columns.cost}</TableHead> : null}
          <TableHead>{columns.latency}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell>{run.traceId}</TableCell>
            <TableCell>{run.profileSlug}</TableCell>
            <TableCell>
              <Badge variant="outline">{run.status}</Badge>
            </TableCell>
            <TableCell>{run.finalModelId ?? "-"}</TableCell>
            {showExtendedColumns ? (
              <TableCell>
                {run.tokensIn} / {run.tokensOut}
              </TableCell>
            ) : null}
            {showExtendedColumns ? (
              <TableCell>${Number(run.totalCostUsd).toFixed(5)}</TableCell>
            ) : null}
            <TableCell>{run.latencyMs} ms</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
