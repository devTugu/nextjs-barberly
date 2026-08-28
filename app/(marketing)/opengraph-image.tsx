import { ImageResponse } from 'next/og';

export const alt = 'Barberly — barbershop SaaS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#f6f3ff',
          color: '#1b1633',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#5b3cc4',
          }}
        >
          Barberly
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 58,
            fontWeight: 600,
            lineHeight: 1.12,
            maxWidth: 920,
          }}
        >
          A site for every shop. One platform.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: '#5c5870',
            maxWidth: 760,
          }}
        >
          Online booking, QPay, staff calendar, and a branded landing.
        </div>
      </div>
    ),
    { ...size },
  );
}
