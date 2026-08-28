interface PlatformJsonLdProps {
  data: Record<string, unknown>;
}

export function PlatformJsonLd({ data }: PlatformJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
