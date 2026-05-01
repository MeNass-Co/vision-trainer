# Vision Trainer v2: Condition-Specific Programs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the single-mode Vision Trainer into a 3-program platform (myopia, presbyopia, sports vision) with science-backed difficulty calibration, initial assessment, and macOS .dmg packaging via Tauri.

**Architecture:** Add a program config layer on top of the existing paradigm/session/QUEST stack. The `GoalType` drives which paradigms are active, which SF ranges are used, and how stimulus duration adapts. A new `GoalSelection` component gates the first session. The existing `sessionPlanner.ts` replaces its hardcoded milestone array with a program-aware planner that reads goal type + calibration results. Tauri v2 wraps the existing Vite build unchanged.

**Tech Stack:** React 19, TypeScript, Vite 6, Zustand 5, WebGL2, IndexedDB (idb), Tauri v2 (Rust), vitest

---

## File Map

### New files (4)
| File | Responsibility |
|---|---|
| `src/programs/programConfig.ts` | Pure config: paradigm schedules, SF ranges, duration ranges, Gabor sizes per GoalType |
| `src/programs/programPlanner.ts` | Maps (goalType, sessionNumber, thresholds) → paradigm allocation + duration for a session |
| `src/components/GoalSelection.tsx` | 3-card onboarding UI: myopia / presbyopia / sports vision |
| `src-tauri/` (directory) | Tauri v2 scaffold: `tauri.conf.json`, `src/main.rs`, `Cargo.toml`, `icons/` |

### Modified files (8)
| File | Change |
|---|---|
| `src/types.ts` | Add `GoalType`, update `UserProfile.diagnosisType`, add `durationMs` to `ContrastCondition` |
| `src/core/displayCalibration.ts:44-46` | Fix `sigmaPixels()` to use visual angle degrees instead of wavelength |
| `src/psychophysics/quest.ts:23` | Change `pThreshold` default from `0.82` to `0.79` |
| `src/tasks/contrastDetection.ts:62` | Read `durationMs` from condition instead of hardcoded `60` |
| `src/tasks/lateralMasking.ts:38` | Read `durationMs` from condition instead of hardcoded `60` |
| `src/tasks/spatialMasking.ts:38` | Read `durationMs` from condition instead of hardcoded `70` |
| `src/session/sessionPlanner.ts` | Replace `paradigmsForSession()` milestone system with `programPlanner` lookup |
| `src/store/useAppStore.ts` | Add `goalType` to state, persist it, gate session start on goal selection |
| `src/App.tsx` | Show `GoalSelection` when `profile.diagnosisType === 'unspecified'` |
| `src/components/SessionFlow.tsx` | Pass `goalType` to planner, remove dichoptic button (dropped from all 3 programs) |
| `package.json` | Add `@tauri-apps/cli` and `@tauri-apps/api` |

### Untouched
- `src/psychophysics/quest.ts` (except `pThreshold` default) — QUEST algorithm is correct
- `src/core/gaborRenderer.ts` — WebGL shader is correct; sigma change flows through `displayCalibration`
- `src/tasks/backwardMasking.ts` — paradigm logic is fine, only consumed differently by planner
- `src/tasks/pedestalDiscrimination.ts` — same
- `src/data/db.ts` — IndexedDB schema unchanged
- `src/components/GaborCanvas.tsx` — renders whatever stimulus it receives
- `src/components/ContrastTask.tsx` — block runner is paradigm-agnostic
- `src/progress/csf.ts` — CSF curve computation unchanged

---

## Task 1: Types — Add GoalType and Update UserProfile

**Files:**
- Modify: `src/types.ts:9-16` (ParadigmId), `src/types.ts:111-117` (UserProfile)

- [ ] **Step 1.1: Add GoalType and update diagnosisType**

In `src/types.ts`, add `GoalType` after line 1 and update `UserProfile.diagnosisType`:

```typescript
// Add after line 1 (after Orientation type)
export type GoalType = 'myopia' | 'presbyopia' | 'sports-vision';
```

Update `UserProfile.diagnosisType` (line 115) from:
```typescript
diagnosisType: 'amblyopia' | 'presbyopia' | 'low-contrast-sensitivity' | 'research' | 'unspecified';
```
to:
```typescript
diagnosisType: GoalType | 'unspecified';
```

- [ ] **Step 1.2: Add optional durationMs to ContrastCondition**

In `src/tasks/contrastDetection.ts`, add `durationMs` to `ContrastCondition` (line 6-10):

```typescript
export type ContrastCondition = {
  paradigm: ParadigmId;
  spatialFrequencyCpd: number;
  orientationDeg: Orientation;
  trialsPerBlock: number;
  durationMs?: number;
};
```

- [ ] **Step 1.3: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: PASS (durationMs is optional, no downstream breakage)

- [ ] **Step 1.4: Commit**

```bash
git add src/types.ts src/tasks/contrastDetection.ts
git commit -m "feat: add GoalType and optional durationMs to ContrastCondition"
```

---

## Task 2: Fix Gabor Size — The Critical Rendering Bug

**Files:**
- Modify: `src/core/displayCalibration.ts:44-46`

- [ ] **Step 2.1: Fix sigmaPixels to use visual angle**

Replace the current `sigmaPixels` function (line 44-46):

```typescript
// CURRENT (broken — returns 1 wavelength, ~0.3-0.5 deg at high SF):
export function sigmaPixels(spatialFrequencyCpd: number, profile: CalibrationProfile): number {
  return pixelsPerCycle(spatialFrequencyCpd, profile);
}
```

With:

```typescript
export function sigmaPixels(
  _spatialFrequencyCpd: number,
  profile: CalibrationProfile,
  gaborSizeDeg = 4
): number {
  return (gaborSizeDeg / 2) * pixelsPerDegree(profile);
}
```

This produces ~4° visual angle patches for myopia/presbyopia (RevitalVision standard). Sports vision will pass `gaborSizeDeg = 3` via the program config. The `_spatialFrequencyCpd` parameter is kept for backward compatibility but ignored — Gabor size is now fixed in visual angle, not tied to spatial frequency.

- [ ] **Step 2.2: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 2.3: Commit**

```bash
git add src/core/displayCalibration.ts
git commit -m "fix: Gabor size now 4 deg visual angle instead of 1 wavelength"
```

---

## Task 3: QUEST pThreshold — Align with RevitalVision

**Files:**
- Modify: `src/psychophysics/quest.ts:23`

- [ ] **Step 3.1: Change pThreshold default**

In `src/psychophysics/quest.ts`, change line 23 from:

```typescript
pThreshold: 0.82,
```

to:

```typescript
pThreshold: 0.79,
```

This aligns with RevitalVision's 1-up/3-down staircase convergence point (~79.4% correct).

- [ ] **Step 3.2: Commit**

```bash
git add src/psychophysics/quest.ts
git commit -m "fix: QUEST pThreshold 0.82 → 0.79 to match RevitalVision"
```

---

## Task 4: Stimulus Duration — From Fixed to Condition-Driven

**Files:**
- Modify: `src/tasks/contrastDetection.ts:62`
- Modify: `src/tasks/lateralMasking.ts:38`
- Modify: `src/tasks/spatialMasking.ts:38`

- [ ] **Step 4.1: contrastDetection — read durationMs from condition**

In `src/tasks/contrastDetection.ts`, in `createContrastTrial` (line 57-64), change the stimulus object's `durationMs` from hardcoded `60` to:

```typescript
durationMs: condition.durationMs ?? 160,
```

The default `160` is the starting duration for myopia. The program config will override this per-condition.

- [ ] **Step 4.2: lateralMasking — read durationMs from condition**

In `src/tasks/lateralMasking.ts`, in `createLateralMaskingTrial` (line 38), change:

```typescript
durationMs: 60,
```

to:

```typescript
durationMs: condition.durationMs ?? 160,
```

- [ ] **Step 4.3: spatialMasking — read durationMs from condition**

In `src/tasks/spatialMasking.ts`, in `createSpatialMaskingTrial` (line 38), change:

```typescript
durationMs: 70,
```

to:

```typescript
durationMs: condition.durationMs ?? 160,
```

- [ ] **Step 4.4: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4.5: Commit**

```bash
git add src/tasks/contrastDetection.ts src/tasks/lateralMasking.ts src/tasks/spatialMasking.ts
git commit -m "feat: stimulus duration reads from condition instead of hardcoded 60ms"
```

---

## Task 5: Program Config — Condition-Specific Parameters

**Files:**
- Create: `src/programs/programConfig.ts`

- [ ] **Step 5.1: Create programConfig.ts**

```typescript
import type { GoalType, Orientation, ParadigmId } from '../types';
import type { ContrastCondition } from '../tasks/contrastDetection';

export type ProgramPhase = {
  sessionRange: [number, number];
  paradigms: ParadigmId[];
  paradigmWeights: Record<ParadigmId, number>;
};

export type ProgramConfig = {
  goalType: GoalType;
  label: string;
  spatialFrequencies: number[];
  orientations: Orientation[];
  durationStartMs: number;
  durationFloorMs: number;
  durationStepMs: number;
  gaborSizeDeg: number;
  trialsPerSession: number;
  trialsPerBlock: number;
  phases: ProgramPhase[];
};

const MYOPIA_CONFIG: ProgramConfig = {
  goalType: 'myopia',
  label: 'Myopia Program',
  spatialFrequencies: [6, 12],
  orientations: [0, 45, 90, 135],
  durationStartMs: 160,
  durationFloorMs: 80,
  durationStepMs: 20,
  gaborSizeDeg: 4,
  trialsPerSession: 250,
  trialsPerBlock: 40,
  phases: [
    {
      sessionRange: [1, 2],
      paradigms: ['contrast-detection'],
      paradigmWeights: { 'contrast-detection': 1 }
    },
    {
      sessionRange: [3, 10],
      paradigms: ['lateral-masking', 'contrast-detection'],
      paradigmWeights: { 'lateral-masking': 0.7, 'contrast-detection': 0.3 }
    },
    {
      sessionRange: [11, 20],
      paradigms: ['lateral-masking', 'contrast-detection', 'backward-masking'],
      paradigmWeights: { 'lateral-masking': 0.5, 'contrast-detection': 0.2, 'backward-masking': 0.3 }
    },
    {
      sessionRange: [21, 30],
      paradigms: ['lateral-masking', 'contrast-detection', 'backward-masking'],
      paradigmWeights: { 'lateral-masking': 0.5, 'contrast-detection': 0.2, 'backward-masking': 0.3 }
    }
  ]
};

const PRESBYOPIA_CONFIG: ProgramConfig = {
  goalType: 'presbyopia',
  label: 'Presbyopia Program',
  spatialFrequencies: [3, 6],
  orientations: [0, 45, 90, 135],
  durationStartMs: 200,
  durationFloorMs: 100,
  durationStepMs: 20,
  gaborSizeDeg: 4,
  trialsPerSession: 250,
  trialsPerBlock: 40,
  phases: [
    {
      sessionRange: [1, 2],
      paradigms: ['contrast-detection'],
      paradigmWeights: { 'contrast-detection': 1 }
    },
    {
      sessionRange: [3, 5],
      paradigms: ['lateral-masking', 'contrast-detection'],
      paradigmWeights: { 'lateral-masking': 0.7, 'contrast-detection': 0.3 }
    },
    {
      sessionRange: [6, 20],
      paradigms: ['lateral-masking', 'contrast-detection', 'backward-masking'],
      paradigmWeights: { 'lateral-masking': 0.5, 'contrast-detection': 0.2, 'backward-masking': 0.3 }
    },
    {
      sessionRange: [21, 30],
      paradigms: ['lateral-masking', 'contrast-detection', 'backward-masking'],
      paradigmWeights: { 'lateral-masking': 0.4, 'contrast-detection': 0.2, 'backward-masking': 0.4 }
    }
  ]
};

const SPORTS_CONFIG: ProgramConfig = {
  goalType: 'sports-vision',
  label: 'Sports Vision Program',
  spatialFrequencies: [1.5, 3, 6, 12],
  orientations: [0, 45, 90, 135],
  durationStartMs: 120,
  durationFloorMs: 40,
  durationStepMs: 20,
  gaborSizeDeg: 3,
  trialsPerSession: 250,
  trialsPerBlock: 40,
  phases: [
    {
      sessionRange: [1, 2],
      paradigms: ['contrast-detection'],
      paradigmWeights: { 'contrast-detection': 1 }
    },
    {
      sessionRange: [3, 7],
      paradigms: ['contrast-detection', 'backward-masking'],
      paradigmWeights: { 'contrast-detection': 0.4, 'backward-masking': 0.6 }
    },
    {
      sessionRange: [8, 20],
      paradigms: ['contrast-detection', 'backward-masking', 'spatial-masking', 'pedestal-discrimination'],
      paradigmWeights: {
        'contrast-detection': 0.2,
        'backward-masking': 0.3,
        'spatial-masking': 0.25,
        'pedestal-discrimination': 0.25
      }
    },
    {
      sessionRange: [21, 30],
      paradigms: ['contrast-detection', 'backward-masking', 'spatial-masking', 'pedestal-discrimination'],
      paradigmWeights: {
        'contrast-detection': 0.2,
        'backward-masking': 0.3,
        'spatial-masking': 0.25,
        'pedestal-discrimination': 0.25
      }
    }
  ]
};

const PROGRAMS = new Map<GoalType, ProgramConfig>([
  ['myopia', MYOPIA_CONFIG],
  ['presbyopia', PRESBYOPIA_CONFIG],
  ['sports-vision', SPORTS_CONFIG]
]);

export function getProgramConfig(goalType: GoalType): ProgramConfig {
  const config = PROGRAMS.get(goalType);
  if (!config) {
    throw new Error(`Unknown goal type: ${goalType}`);
  }
  return config;
}

export function getPhaseForSession(config: ProgramConfig, sessionNumber: number): ProgramPhase {
  for (const phase of config.phases) {
    if (sessionNumber >= phase.sessionRange[0] && sessionNumber <= phase.sessionRange[1]) {
      return phase;
    }
  }
  return config.phases[config.phases.length - 1];
}

export function computeDurationMs(config: ProgramConfig, sessionNumber: number): number {
  const reductions = Math.floor(Math.max(0, sessionNumber - 2) / 3);
  return Math.max(config.durationFloorMs, config.durationStartMs - reductions * config.durationStepMs);
}
```

- [ ] **Step 5.2: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5.3: Commit**

```bash
git add src/programs/programConfig.ts
git commit -m "feat: add condition-specific program configs (myopia, presbyopia, sports)"
```

---

## Task 6: Program Planner — Replace Milestone System

**Files:**
- Create: `src/programs/programPlanner.ts`
- Modify: `src/session/sessionPlanner.ts`

- [ ] **Step 6.1: Create programPlanner.ts**

```typescript
import type { GoalType, Orientation, ThresholdEstimate } from '../types';
import type { ContrastCondition } from '../tasks/contrastDetection';
import type { PlannedBlock } from '../session/sessionPlanner';
import { conditionKey } from '../core/displayCalibration';
import { getParadigmModule } from '../tasks/paradigmRegistry';
import { computeDurationMs, getPhaseForSession, getProgramConfig } from './programConfig';

export function planProgramSession(
  goalType: GoalType,
  sessionNumber: number,
  thresholds: ThresholdEstimate[]
): PlannedBlock[] {
  const config = getProgramConfig(goalType);
  const phase = getPhaseForSession(config, sessionNumber);
  const durationMs = computeDurationMs(config, sessionNumber);

  const conditions = buildConditionPool(config.spatialFrequencies, config.orientations, phase.paradigms, durationMs);

  const warmUpCondition = conditions.find((c) => c.paradigm === 'contrast-detection') ?? conditions[0];
  const blocks: PlannedBlock[] = [
    createPlannedBlock('Warm-up', { ...warmUpCondition, trialsPerBlock: 20 }, 'warm-up')
  ];

  const trainingBudget = config.trialsPerSession - 50;
  const paradigmTrials = distributeTrials(phase.paradigmWeights, trainingBudget, config.trialsPerBlock);

  let blockIndex = 0;
  for (const [paradigmId, trials] of paradigmTrials) {
    const paradigmConditions = conditions.filter((c) => c.paradigm === paradigmId);
    if (paradigmConditions.length === 0) continue;

    const blockCount = Math.max(1, Math.round(trials / config.trialsPerBlock));
    for (let i = 0; i < blockCount; i++) {
      const condition = selectDeficitCondition(thresholds, paradigmConditions);
      blocks.push(
        createPlannedBlock(`Training ${String.fromCharCode(65 + blockIndex)}`, condition, 'training')
      );
      blockIndex++;
    }
  }

  const assessCondition = selectDeficitCondition(thresholds, conditions);
  blocks.push(
    createPlannedBlock('Assessment', { ...assessCondition, trialsPerBlock: 30 }, 'assessment')
  );

  return blocks;
}

function buildConditionPool(
  spatialFrequencies: number[],
  orientations: Orientation[],
  paradigms: string[],
  durationMs: number
): ContrastCondition[] {
  const conditions: ContrastCondition[] = [];
  for (const paradigm of paradigms) {
    const module = getParadigmModule(paradigm as any);
    for (const sf of spatialFrequencies) {
      for (const ori of orientations) {
        const existing = module.conditions.find(
          (c) => c.spatialFrequencyCpd === sf && c.orientationDeg === ori
        );
        if (existing) {
          conditions.push({ ...existing, durationMs });
        }
      }
    }
  }
  return conditions;
}

function distributeTrials(
  weights: Record<string, number>,
  totalTrials: number,
  blockSize: number
): Array<[string, number]> {
  const entries = Object.entries(weights);
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  return entries.map(([paradigm, weight]) => {
    const raw = (weight / totalWeight) * totalTrials;
    const rounded = Math.round(raw / blockSize) * blockSize;
    return [paradigm, Math.max(blockSize, rounded)];
  });
}

function selectDeficitCondition(
  thresholds: ThresholdEstimate[],
  conditions: ContrastCondition[]
): ContrastCondition {
  if (thresholds.length === 0) return conditions[0];

  const latestByKey = new Map<string, ThresholdEstimate>();
  for (const t of thresholds) {
    latestByKey.set(t.conditionKey, t);
  }

  let worst: ContrastCondition | null = null;
  let worstScore = -Infinity;
  for (const c of conditions) {
    const key = conditionKey(c.spatialFrequencyCpd, c.orientationDeg, c.paradigm);
    const t = latestByKey.get(key);
    const score = t ? t.thresholdContrast : 1;
    if (score > worstScore) {
      worstScore = score;
      worst = c;
    }
  }
  return worst ?? conditions[0];
}

function createPlannedBlock(
  label: string,
  condition: ContrastCondition,
  role: PlannedBlock['role']
): PlannedBlock {
  return {
    id: `block-${crypto.randomUUID()}`,
    label,
    paradigm: condition.paradigm,
    condition,
    role
  };
}
```

- [ ] **Step 6.2: Update sessionPlanner.ts — add program-aware planSession**

In `src/session/sessionPlanner.ts`, replace the `planSession` function (lines 37-61) and `paradigmsForSession` (lines 91-102) with:

```typescript
import { planProgramSession } from '../programs/programPlanner';
import type { GoalType } from '../types';
```

Add this import at the top (after the existing imports).

Replace `planSession` (lines 37-61):

```typescript
export function planSession(
  sessionsCompleted: number,
  thresholds: ThresholdEstimate[],
  goalType?: GoalType
): PlannedBlock[] {
  if (goalType) {
    return planProgramSession(goalType, sessionsCompleted + 1, thresholds);
  }
  // Legacy fallback for unspecified goal
  const warmUp = getParadigmModule('contrast-detection').conditions[0];
  const blocks: PlannedBlock[] = [
    createBlock('Warm-up', { ...warmUp, trialsPerBlock: 10 }, 'warm-up')
  ];
  const deficitCondition = selectDeficitCondition(thresholds, getParadigmModule('contrast-detection').conditions);
  blocks.push(createBlock('Training A', { ...deficitCondition, trialsPerBlock: 40 }, 'training'));
  blocks.push(createBlock('Assessment', { ...deficitCondition, trialsPerBlock: 16 }, 'assessment'));
  return blocks;
}
```

Delete `paradigmsForSession` (lines 91-102) and `activeParadigmsForSession` (lines 161-166) — they are replaced by the program config system.

- [ ] **Step 6.3: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: May show errors from SessionFlow.tsx calling old signature — fixed in Task 8.

- [ ] **Step 6.4: Commit**

```bash
git add src/programs/programPlanner.ts src/session/sessionPlanner.ts
git commit -m "feat: replace milestone unlock system with program-aware session planner"
```

---

## Task 7: Goal Selection Component

**Files:**
- Create: `src/components/GoalSelection.tsx`

- [ ] **Step 7.1: Create GoalSelection.tsx**

```tsx
import { Eye, Glasses, Zap } from 'lucide-react';
import type { GoalType } from '../types';

type GoalSelectionProps = {
  onSelect: (goal: GoalType) => void;
};

const GOALS: Array<{ type: GoalType; icon: typeof Eye; label: string; description: string }> = [
  {
    type: 'myopia',
    icon: Eye,
    label: 'Myopia',
    description: 'Improve distance vision clarity by training high spatial frequency contrast sensitivity.'
  },
  {
    type: 'presbyopia',
    icon: Glasses,
    label: 'Presbyopia',
    description: 'Enhance near vision for reading by training mid-range spatial frequencies at close distance.'
  },
  {
    type: 'sports-vision',
    icon: Zap,
    label: 'Sports Vision',
    description: 'Boost visual processing speed and ultra-fine discrimination for athletic performance.'
  }
];

export function GoalSelection({ onSelect }: GoalSelectionProps) {
  return (
    <section className="panel goal-selection" aria-labelledby="goal-heading">
      <h2 id="goal-heading">What is your training goal?</h2>
      <p className="goal-subtitle">
        This determines which visual functions we target and how difficulty progresses over 30 sessions.
      </p>
      <div className="goal-cards">
        {GOALS.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            type="button"
            className="goal-card"
            onClick={() => onSelect(type)}
          >
            <Icon size={32} />
            <h3>{label}</h3>
            <p>{description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add src/components/GoalSelection.tsx
git commit -m "feat: add GoalSelection onboarding component"
```

---

## Task 8: Wire Goal into Store, App, and SessionFlow

**Files:**
- Modify: `src/store/useAppStore.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/SessionFlow.tsx`

- [ ] **Step 8.1: Add goalType to store**

In `src/store/useAppStore.ts`:

Add import at top:
```typescript
import type { GoalType } from '../types';
```

Add to `AppState` type (after line 39, after `dichopticSettings`):
```typescript
setGoalType: (goal: GoalType) => Promise<void>;
```

In the `defaultProfile` (line 56-61), keep `diagnosisType: 'unspecified'` as-is.

Add implementation inside `create<AppState>` (after `setAudioMuted`, before `refreshDashboard`):

```typescript
setGoalType: async (goal) => {
  const profile = { ...get().profile, diagnosisType: goal };
  await saveProfile(profile);
  set({ profile });
},
```

- [ ] **Step 8.2: Gate App on goal selection**

In `src/App.tsx`, add import:

```typescript
import { GoalSelection } from './components/GoalSelection';
```

Add store selector after line 18:
```typescript
const profile = useAppStore((state) => state.profile);
const setGoalType = useAppStore((state) => state.setGoalType);
```

After the `if (!ready)` block (line 24-29), add:

```tsx
if (profile.diagnosisType === 'unspecified') {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <Brain size={28} />
          <div>
            <h1>Vision Trainer</h1>
            <span>Open perceptual learning platform</span>
          </div>
        </div>
      </header>
      <GoalSelection onSelect={(goal) => void setGoalType(goal)} />
    </main>
  );
}
```

- [ ] **Step 8.3: Update SessionFlow to pass goalType**

In `src/components/SessionFlow.tsx`:

Add store selector:
```typescript
const profile = useAppStore((state) => state.profile);
```

Update the `start` function (line 33-38):

```typescript
const start = async () => {
  const goalType = profile.diagnosisType === 'unspecified' ? undefined : profile.diagnosisType;
  const plannedBlocks = planSession(completedSessions, dashboard.thresholds, goalType as any);
  await startSession([...new Set(plannedBlocks.map((block) => block.paradigm))], selectedEyeMode, 'guided');
  setBlocks(plannedBlocks);
  setCompletionMessage(null);
};
```

Remove the `startDichoptic` function (lines 40-54) and the Dichoptic Training button (lines 140-149) and the DichopticSetup section (lines 153-157). Dichoptic is dropped from all 3 programs per consensus.

- [ ] **Step 8.4: Update planSession import in SessionFlow**

The `planSession` signature now accepts an optional `goalType` third argument. The existing import is fine — just the call site changes as shown in step 8.3.

- [ ] **Step 8.5: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 8.6: Commit**

```bash
git add src/store/useAppStore.ts src/App.tsx src/components/SessionFlow.tsx
git commit -m "feat: wire goal selection into app flow, gate sessions on goal type"
```

---

## Task 9: Goal Selection CSS

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 9.1: Add goal selection styles**

Append to `src/styles.css`:

```css
.goal-selection {
  max-width: 720px;
  margin: 2rem auto;
  text-align: center;
}

.goal-subtitle {
  color: var(--text-secondary, #999);
  margin-bottom: 1.5rem;
}

.goal-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.goal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: var(--surface-elevated, #1a1a2e);
  border: 2px solid var(--border, #333);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
  color: inherit;
  font: inherit;
}

.goal-card:hover {
  border-color: var(--accent, #6366f1);
  transform: translateY(-2px);
}

.goal-card h3 {
  font-size: 1.1rem;
  margin: 0;
}

.goal-card p {
  font-size: 0.85rem;
  color: var(--text-secondary, #999);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .goal-cards {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 9.2: Commit**

```bash
git add src/styles.css
git commit -m "feat: add goal selection card styles"
```

---

## Task 10: Tauri v2 Packaging

**Files:**
- Create: `src-tauri/` directory with Tauri scaffold
- Modify: `package.json`

- [ ] **Step 10.1: Install Tauri CLI**

Run:
```bash
cd ~/Projects/vision-trainer && npm install -D @tauri-apps/cli@^2
```

- [ ] **Step 10.2: Initialize Tauri**

Run:
```bash
cd ~/Projects/vision-trainer && npx tauri init
```

When prompted:
- App name: `Vision Trainer`
- Window title: `Vision Trainer`
- Web assets path: `../dist`
- Dev server URL: `http://localhost:5173`
- Dev command: `npm run dev`
- Build command: `npm run build`

- [ ] **Step 10.3: Configure tauri.conf.json**

After init, edit `src-tauri/tauri.conf.json`:

Set `bundle.identifier` to `com.visiontrainer.app`.

Set window config:
```json
{
  "windows": [
    {
      "title": "Vision Trainer",
      "width": 1200,
      "height": 800,
      "resizable": true,
      "fullscreen": false
    }
  ]
}
```

- [ ] **Step 10.4: Add Tauri scripts to package.json**

Add to `scripts` in `package.json`:

```json
"tauri": "tauri",
"tauri:dev": "tauri dev",
"tauri:build": "tauri build"
```

- [ ] **Step 10.5: Build .dmg**

Run:
```bash
cd ~/Projects/vision-trainer && npm run tauri:build
```

Expected: `.dmg` output in `src-tauri/target/release/bundle/dmg/`

- [ ] **Step 10.6: Commit**

```bash
git add src-tauri/ package.json package-lock.json
git commit -m "feat: add Tauri v2 for macOS .dmg packaging"
```

---

## Task 11: Cleanup — Remove Unused Dichoptic References

**Files:**
- Modify: `src/components/SessionFlow.tsx` (if not done in Task 8)
- Modify: `src/session/sessionPlanner.ts`

- [ ] **Step 11.1: Remove planDichopticSession export**

In `src/session/sessionPlanner.ts`, delete `planDichopticSession` (lines 63-75) — no longer called.

- [ ] **Step 11.2: Remove activeParadigmsForSession**

If not already removed in Task 6, delete `activeParadigmsForSession` (lines 161-166) from `sessionPlanner.ts`.

- [ ] **Step 11.3: Remove unused imports in SessionFlow**

In `src/components/SessionFlow.tsx`, remove:
- `Glasses` from lucide-react import
- `planDichopticSession` from session planner import
- `DichopticSetup` component import

- [ ] **Step 11.4: Verify build**

Run: `cd ~/Projects/vision-trainer && npx tsc --noEmit`
Expected: PASS with zero errors

- [ ] **Step 11.5: Commit**

```bash
git add src/session/sessionPlanner.ts src/components/SessionFlow.tsx
git commit -m "chore: remove unused dichoptic session planner and imports"
```

---

## Task 12: Verification — End-to-End Check

- [ ] **Step 12.1: Run full build**

```bash
cd ~/Projects/vision-trainer && npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 12.2: Start dev server and verify goal selection**

```bash
cd ~/Projects/vision-trainer && npm run dev
```

Open `http://localhost:5173`. Expected:
1. Goal selection screen appears (3 cards: Myopia, Presbyopia, Sports Vision)
2. Clicking a card stores the goal and shows the main app
3. Session planner uses condition-specific paradigms and durations

- [ ] **Step 12.3: Verify Gabor size visually**

Start a session. The Gabor patches should be MUCH larger than before (~4° visual angle = large visible patches, similar to RevitalVision screenshots).

- [ ] **Step 12.4: Verify stimulus duration**

During a trial, the stimulus should be visible for ~160ms (myopia) or ~200ms (presbyopia), noticeably longer than the old 60ms.

- [ ] **Step 12.5: Build Tauri .dmg**

```bash
cd ~/Projects/vision-trainer && npm run tauri:build
```

Expected: `.dmg` file in `src-tauri/target/release/bundle/dmg/`

---

## Summary of Changes

| Area | Before | After |
|---|---|---|
| Gabor size | ~0.3-0.5° (1 wavelength sigma) | **4°** visual angle (3° for sports) |
| Stimulus duration | 60ms fixed | **80-200ms** adaptive per condition |
| QUEST target | 82% correct | **79%** correct |
| Programs | 1 generic | **3** condition-specific (myopia, presbyopia, sports) |
| Paradigm selection | Fixed milestone unlock at sessions 6/11/16/21 | **Phase-based** per program config |
| Onboarding | None | **Goal selection** → condition-specific program |
| Dichoptic | Active | **Removed** (amblyopia-only, no evidence for 3 target conditions) |
| Distribution | localhost dev server | **macOS .dmg** via Tauri v2 (~8MB) |
| Paradigm mapping | All 6 for everyone | Myopia: LM+CD+BM · Presbyopia: LM+CD+BM · Sports: CD+BM+SM+PD |
