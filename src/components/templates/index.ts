import React from 'react';
import { Template1A, Template1AProps } from './Template1A';
import { Template1B, Template1BProps } from './Template1B';
import { Template2A, Template2AProps } from './Template2A';
import { Template3A, Template3AProps } from './Template3A';
import { Template3B, Template3BProps } from './Template3B';
import { Template4A, Template4AProps } from './Template4A';
import { Template5A, Template5AProps } from './Template5A';

export {
  Template1A,
  Template1B,
  Template2A,
  Template3A,
  Template3B,
  Template4A,
  Template5A,
};

export type {
  Template1AProps,
  Template1BProps,
  Template2AProps,
  Template3AProps,
  Template3BProps,
  Template4AProps,
  Template5AProps,
};

export type TemplateId = '1-a' | '1-b' | '2-a' | '3-a' | '3-b' | '4-a' | '5-a';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const templatesMap: Record<TemplateId, React.ComponentType<any>> = {
  '1-a': Template1A,
  '1-b': Template1B,
  '2-a': Template2A,
  '3-a': Template3A,
  '3-b': Template3B,
  '4-a': Template4A,
  '5-a': Template5A,
};

// Default width and height for each template type
export const templatesDimensions: Record<TemplateId, { width: number; height: number }> = {
  '1-a': { width: 1080, height: 1080 },
  '1-b': { width: 1080, height: 1080 },
  '2-a': { width: 1080, height: 1080 },
  '3-a': { width: 1080, height: 1080 },
  '3-b': { width: 1080, height: 1080 },
  '4-a': { width: 1080, height: 1080 },
  '5-a': { width: 1080, height: 1080 },
};

/**
 * Get the React Template component by ID
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTemplateComponent(templateId: string): React.ComponentType<any> | null {
  const normalizedId = templateId.toLowerCase() as TemplateId;
  return templatesMap[normalizedId] || null;
}
