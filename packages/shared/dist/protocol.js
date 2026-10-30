import { z } from 'zod';
export const APP_VERSION = '0.1.0';
export const PROTOCOL_VERSION = 1;
export const probeRequestSchema = z.object({
    requestId: z.uuid(),
}).strict();
export const diagnosticStateSchema = z.object({
    connections: z.number().int().nonnegative(),
    serverTime: z.number().int().positive(),
    protocolVersion: z.literal(PROTOCOL_VERSION),
});
export const probeEventSchema = z.object({
    requestId: z.uuid(),
    sequence: z.number().int().positive(),
    serverTime: z.number().int().positive(),
});
export const systemStatusSchema = z.object({
    name: z.literal('TlinhGame'),
    version: z.string(),
    stage: z.literal('foundation'),
    protocolVersion: z.literal(PROTOCOL_VERSION),
    serverTime: z.number().int().positive(),
    capabilities: z.object({
        diagnostics: z.literal(true),
        authentication: z.literal(false),
        matchmaking: z.literal(false),
        persistence: z.literal(false),
    }),
});
