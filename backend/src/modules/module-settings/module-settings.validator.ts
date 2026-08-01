import { z } from 'zod';

export const updateModuleSettingSchema = z.object({
  isEnabled: z.boolean(),
});
