import { ModelsFeature } from "@/features/models/models-feature";

export default async function ProviderModelsPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = await params;
  return <ModelsFeature providerSlug={decodeURIComponent(provider)} />;
}
