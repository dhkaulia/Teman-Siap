import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderPlant, stageForPractices, getPlantStage, PLANT_STAGES, getPlantSvg } from '../public/js/ui/plant.js';

describe('Botanical Stoneware Plant System (Taman Kita)', () => {
  it('exports PLANT_STAGES with correct thresholds and 4 stages', () => {
    assert.equal(PLANT_STAGES.length, 4);
    assert.equal(PLANT_STAGES[0].id, 'biji');
    assert.equal(PLANT_STAGES[1].id, 'tunas');
    assert.equal(PLANT_STAGES[2].id, 'berdaun');
    assert.equal(PLANT_STAGES[3].id, 'berbunga');
  });

  it('maps practices count accurately via stageForPractices and getPlantStage', () => {
    assert.equal(stageForPractices(0).stage, 1);
    assert.equal(stageForPractices(1).stage, 1);
    assert.equal(stageForPractices(2).stage, 2);
    assert.equal(stageForPractices(4).stage, 2);
    assert.equal(stageForPractices(5).stage, 3);
    assert.equal(stageForPractices(8).stage, 3);
    assert.equal(stageForPractices(9).stage, 4);
    assert.equal(stageForPractices(25).stage, 4);

    // Backward compatibility alias
    assert.equal(getPlantStage(0).stage, 1);
    assert.equal(getPlantStage(9).stage, 4);
  });

  it('enforces that every plant SVG is strictly under 4KB (4096 bytes)', () => {
    for (let stage = 1; stage <= 4; stage++) {
      const svg = getPlantSvg(stage);
      const byteSize = Buffer.byteLength(svg, 'utf8');
      assert.ok(
        byteSize < 4096,
        `Stage ${stage} SVG size (${byteSize} bytes) exceeds 4KB limit!`
      );
    }
  });

  it('proves zero SVG filters are used in any stage (strictly banned for 60fps mobile)', () => {
    for (let stage = 1; stage <= 4; stage++) {
      const svg = getPlantSvg(stage);
      assert.equal(svg.includes('<filter'), false, `Stage ${stage} must not contain <filter> primitives`);
      assert.equal(svg.includes('feDropShadow'), false);
      assert.equal(svg.includes('feGaussianBlur'), false);
    }
  });

  it('uses CSS variables for styling (--leaf-1..3, --petal-1..2, --pot-1..2, --soil)', () => {
    const s1 = getPlantSvg(1);
    const s2 = getPlantSvg(2);
    const s3 = getPlantSvg(3);
    const s4 = getPlantSvg(4);

    // Cream stoneware pot & soil variables across all stages
    assert.ok(s1.includes('var(--pot-1)'));
    assert.ok(s1.includes('var(--pot-2)'));
    assert.ok(s1.includes('var(--soil)'));

    // Leaf variables in sprout & leafy
    assert.ok(s2.includes('var(--leaf-1)'));
    assert.ok(s2.includes('var(--leaf-3)'));
    assert.ok(s3.includes('var(--leaf-1)'));
    assert.ok(s3.includes('var(--leaf-3)'));

    // Petal variables in flowering stage
    assert.ok(s4.includes('var(--petal-1)'));
    assert.ok(s4.includes('var(--petal-core)'));
  });

  it('renders pot with base ring, dark soil, and almond seed in Stage 1', () => {
    const s1 = getPlantSvg(1);
    assert.ok(s1.includes('var(--pot-shade)'), 'Pot must feature visible base ring');
    assert.ok(s1.includes('var(--soil)'), 'Pot must feature dark soil top');
    assert.ok(s1.includes('seedG'), 'Stage 1 must feature almond-brown seed');
  });

  it('renders plum flower with orange stamens and 2 buds in Stage 4', () => {
    const s4 = getPlantSvg(4);
    assert.ok(s4.includes('class="plant-flower"'), 'Stage 4 must feature open flower');
    assert.ok(s4.includes('class="plant-bud"'), 'Stage 4 must feature buds');
    assert.ok(s4.includes('var(--stamen)'), 'Stage 4 must feature stamens');
  });

  it('keeps existing renderPlant(stage, size, name) API with HTML text outside artwork', () => {
    const html = renderPlant(3, 140, 'Tunas A');
    assert.ok(html.includes('class="botanical-plant-container"'));
    assert.ok(html.includes('--plant-size: 140px;'));
    assert.ok(html.includes('class="plant-pot-shadow"'), 'CSS soft shadow must be outside SVG');
    assert.ok(html.includes('<svg class="plant-svg plant-stage-3"'));
    assert.ok(html.includes('class="plant-partner-name font-bold text-sm text-ink-primary">Tunas A</div>'));
    assert.ok(html.includes('class="plant-stage-title text-xs mute">Tanaman Rimbun</div>'));
  });
});
