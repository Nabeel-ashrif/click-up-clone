'use client';

import React from 'react';
import { GanttView } from '@/components/views/GanttView';

export default function GanttPage({ params }: { params: { listId: string } }) {
  return <GanttView listId={params.listId} />;
}
