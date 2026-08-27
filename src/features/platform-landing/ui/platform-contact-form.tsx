'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  platformContactSchema,
  submitPlatformContact,
} from '@/entities/tenant';
import { getErrorMessage } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

export function PlatformContactForm() {
  const t = useTranslations('marketing.platform');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = platformContactSchema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      toast.error(t('contactInvalid'));
      return;
    }
    setSubmitting(true);
    try {
      await submitPlatformContact(parsed.data);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      toast.success(t('contactSuccess'));
    } catch (error) {
      toast.error(getErrorMessage(error) || t('contactError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-sm"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('contactName')}
        autoComplete="name"
        required
      />
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t('contactEmail')}
        autoComplete="email"
        required
      />
      <Input
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder={t('contactPhone')}
        autoComplete="tel"
      />
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t('contactMessage')}
        rows={5}
        required
      />
      <Button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[var(--marketing-navy)] px-5 text-white hover:bg-[oklch(0.18_0.04_264)]"
      >
        {submitting ? t('contactSending') : t('contactSend')}
      </Button>
    </form>
  );
}
