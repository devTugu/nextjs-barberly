import { describe, expect, it } from 'vitest';
import { buildBrandHeroPalette, toMarketingMeshCssVars } from './brand-hero-palette';

describe('buildBrandHeroPalette', () => {
  it('uses brand color as the first stripe gradient color', () => {
    const palette = buildBrandHeroPalette('#E11D48');

    expect(palette.stripeColors[0]).toBe('#E11D48');
    expect(palette.stripeColors).toHaveLength(4);
  });

  it('builds CSS gradients that reference the brand hue', () => {
    const palette = buildBrandHeroPalette('#635BFF');

    expect(palette.heroGradient).toContain('#635BFF');
    expect(palette.ribbonGradient).toContain('#635BFF');
    expect(palette.violet).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('falls back to default brand color when input is invalid', () => {
    const palette = buildBrandHeroPalette('not-a-color');

    expect(palette.stripeColors[0]).toBe('#635BFF');
  });

  it('exports mesh CSS variables for four stripe colors', () => {
    const palette = buildBrandHeroPalette('#E11D48');
    const vars = toMarketingMeshCssVars(palette, '#E11D48');

    expect(vars['--marketing-mesh-color-1']).toBe('#E11D48');
    expect(vars['--marketing-mesh-color-4']).toMatch(/^#[0-9A-F]{6}$/);
    expect(vars['--marketing-indigo']).toBe('#E11D48');
  });
});
