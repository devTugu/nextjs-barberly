import { publicPostAnonymous } from '@/shared/lib/public-api';
import {
  platformContactSchema,
  type PlatformContactInput,
} from './platform-contact.schema';

export async function submitPlatformContact(
  input: PlatformContactInput,
): Promise<void> {
  const body = platformContactSchema.parse(input);
  await publicPostAnonymous('/platform/contact', body);
}
