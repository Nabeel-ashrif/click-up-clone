'use client';

import React from 'react';
import { CalendarView } from '@/components/views/CalendarView';

export default function CalendarPage({ params }: { params: { listId: string } }) {
  return <CalendarView listId={params.listId} />;
}
