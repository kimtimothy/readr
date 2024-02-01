import { generateReactHelpers } from '@uploadthing/react/hooks';

import type { OurFileRouter } from '@/app/uploadthing/core';

export const { useUploadThing } =
  generateReactHelpers<OurFileRouter>();
