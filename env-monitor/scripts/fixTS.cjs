const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const result = fileContent.replace(search, replacement);
  fs.writeFileSync(filePath, result, 'utf8');
}

// MapPanel
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/MapPanel.tsx'),
  /import { Sensor, Factory, Event } from "@\/types";/g,
  'import type { Sensor, Factory, Event } from "@/types";'
);

// AlertBanner
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/AlertBanner.tsx'),
  /import { AlertTriangle, Info, ShieldAlert } from "lucide-react";/g,
  'import { AlertTriangle, ShieldAlert } from "lucide-react";'
);
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/AlertBanner.tsx'),
  /import { Event } from "@\/types";/g,
  'import type { Event } from "@/types";'
);

// FormAModal
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/FormAModal.tsx'),
  /import { Event } from "@\/types";/g,
  'import type { Event } from "@/types";'
);

// MetricsPanel
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/MetricsPanel.tsx'),
  /import { Sensor } from "@\/types";/g,
  'import type { Sensor } from "@/types";'
);

// SensorHealthPanel
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/SensorHealthPanel.tsx'),
  /import { Sensor } from "@\/types";/g,
  'import type { Sensor } from "@/types";'
);
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/SensorHealthPanel.tsx'),
  /(a,b) => \(a.status === 'Active' \? 1 : -1\)/g,
  '(a) => (a.status === \'Active\' ? 1 : -1)'
);

// TopNav
replaceInFile(
  path.join(__dirname, '../src/components/dashboard/TopNav.tsx'),
  /import { Role } from "@\/types";/g,
  'import type { Role } from "@/types";'
);

// BoxReveal
replaceInFile(
  path.join(__dirname, '../src/components/landing/BoxReveal.tsx'),
  /import { useEffect, useRef, useState } from "react";/g,
  'import { useEffect, useRef } from "react";'
);
replaceInFile(
  path.join(__dirname, '../src/components/landing/BoxReveal.tsx'),
  /import { cn } from "@\/lib\/utils";\n/g,
  ''
);

// useRealTimeData
replaceInFile(
  path.join(__dirname, '../src/hooks/useRealTimeData.ts'),
  /import { Sensor, Event, Factory } from '@\/types';/g,
  'import type { Sensor, Event, Factory } from "@/types";'
);
replaceInFile(
  path.join(__dirname, '../src/hooks/useRealTimeData.ts'),
  /from '.\/dataSimulation'/g,
  'from "../lib/dataSimulation"'
);

// dataSimulation
replaceInFile(
  path.join(__dirname, '../src/lib/dataSimulation.ts'),
  /import { Sensor, Event, Factory } from "@\/types";/g,
  'import type { Sensor, Event, Factory } from "@/types";'
);

// Dashboard
replaceInFile(
  path.join(__dirname, '../src/pages/Dashboard.tsx'),
  /import { Role, Event } from "@\/types";/g,
  'import type { Role, Event } from "@/types";'
);

console.log("Replaced");
