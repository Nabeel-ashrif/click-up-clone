'use client';

import React from 'react';
import { BoardView } from '@/components/views/BoardView';

export default function BoardPage({ params }: { params: { listId: string } }) {
  return <BoardView listId={params.listId} />;
}
