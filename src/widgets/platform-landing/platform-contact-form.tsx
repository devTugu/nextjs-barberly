'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PlatformContactInfo } from '@/entities/tenant';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

interface PlatformContactFormProps {
  contact: PlatformContactInfo;
}

export function PlatformContactForm({ contact }: PlatformContactFormProps) {
  const t = useTranslations('marketing.platform');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const subject = encodeURIComponent(`${contact.title} — ${name || 'Barberly'}`);
  const body = encodeURIComponent(message);
  const href = `mailto:${contact.email}?subject=${subject}&body=${body}`;

  return (
    <form
      className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = href;
      }}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('contactName')}
        autoComplete="name"
      />
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t('contactMessage')}
        rows={5}
      />
      <Button type="submit" className="rounded-full bg-[var(--marketing-navy)] px-5 text-white hover:bg-[oklch(0.18_0.04_264)]">
        {t('contactSend')}
      </Button>
    </form>
  );
}
