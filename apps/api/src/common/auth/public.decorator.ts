import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Marks a NestJS controller or route handler as accessible without a Portal SSO JWT. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
