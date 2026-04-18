const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const result = fileContent.replace(search, replacement);
  fs.writeFileSync(filePath, result, 'utf8');
}

// MapPanel duplicate classes
replaceInFile(
  path.join(__dirname, '../src/pages/LandingPage.tsx'),
  /className="bg-zinc-900\/60" glowColor="(.*?)" size="md" customSize className="(.*?)"/g,
  'glowColor="$1" size="md" customSize className="bg-zinc-900/60 $2"'
);

// Type Imports Fixes
replaceInFile(
  path.join(__dirname, '../src/components/ui/modern-animated-sign-in.tsx'),
  /import {\n  memo,\n  ReactNode,\n  useState,\n  ChangeEvent,\n  FormEvent,/g,
  'import { memo, useState, useEffect, useRef, forwardRef } from "react";\nimport type { ReactNode, ChangeEvent, FormEvent } from "react";'
);
// Above replace broke the original imports structure if it was on multiple lines, let's just do simple regex search
replaceInFile(
  path.join(__dirname, '../src/components/ui/modern-animated-sign-in.tsx'),
  /ReactNode,/, ''
);
replaceInFile(
  path.join(__dirname, '../src/components/ui/modern-animated-sign-in.tsx'),
  /ChangeEvent,/, ''
);
replaceInFile(
  path.join(__dirname, '../src/components/ui/modern-animated-sign-in.tsx'),
  /FormEvent,/, ''
);
replaceInFile(
  path.join(__dirname, '../src/components/ui/modern-animated-sign-in.tsx'),
  /import {/, 'import type { ReactNode, ChangeEvent, FormEvent } from "react";\nimport {'
);

replaceInFile(
  path.join(__dirname, '../src/components/ui/spotlight-card.tsx'),
  /import React, { useEffect, useRef, ReactNode } from 'react';/,
  'import React, { useEffect, useRef } from "react";\nimport type { ReactNode } from "react";'
);

replaceInFile(
  path.join(__dirname, '../src/pages/AuthPage.tsx'),
  /import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';/,
  'import { useState } from "react";\nimport type { ChangeEvent, FormEvent } from "react";'
);

replaceInFile(
  path.join(__dirname, '../src/pages/AuthPage.tsx'),
  /IconConfig,/,
  ''
);

replaceInFile(
  path.join(__dirname, '../src/pages/AuthPage.tsx'),
  /import {/,
  'import type { IconConfig } from "@/components/ui/modern-animated-sign-in";\nimport {'
);

console.log("Fixed files");
