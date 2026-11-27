import { Card, CardContent, CardHeader, CardTitle } from "@yuva-devlab/ui";

export interface StudioStreamViewerProps {
  title: string;
  events: unknown[];
  emptyLabel: string;
}

/** Monospace SSE event stream viewer card for the Gateway Playground. */
export function StudioStreamViewer({ title, events, emptyLabel }: StudioStreamViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="studio-stream-box">
          {events.length === 0 ? emptyLabel : events.map((ev) => JSON.stringify(ev)).join("\n")}
        </pre>
      </CardContent>
    </Card>
  );
}
