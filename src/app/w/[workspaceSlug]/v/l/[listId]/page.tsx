'use client';

import React from 'react';
import { ListView } from '@/components/views/ListView';

export default function ListPage({ params }: { params: { listId: string } }) {
  return <ListView listId={params.listId} />;
}
