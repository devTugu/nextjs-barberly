'use client';

import { useState } from 'react';
import { ServiceManageSheet } from './service-manage-sheet';
import { Button } from '@/shared/ui/button';

export function AdminServiceCreatePage() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Create service</Button>
      <ServiceManageSheet
        state={open ? { mode: 'create' } : null}
        onOpenChange={setOpen}
      />
    </>
  );
}
