import { z } from 'zod';
export declare const APP_VERSION = "0.1.0";
export declare const PROTOCOL_VERSION = 1;
export declare const probeRequestSchema: z.ZodObject<{
    requestId: z.ZodUUID;
}, z.core.$strict>;
export declare const diagnosticStateSchema: z.ZodObject<{
    connections: z.ZodNumber;
    serverTime: z.ZodNumber;
    protocolVersion: z.ZodLiteral<1>;
}, z.core.$strip>;
export declare const probeEventSchema: z.ZodObject<{
    requestId: z.ZodUUID;
    sequence: z.ZodNumber;
    serverTime: z.ZodNumber;
}, z.core.$strip>;
export declare const systemStatusSchema: z.ZodObject<{
    name: z.ZodLiteral<"TlinhGame">;
    version: z.ZodString;
    stage: z.ZodLiteral<"foundation">;
    protocolVersion: z.ZodLiteral<1>;
    serverTime: z.ZodNumber;
    capabilities: z.ZodObject<{
        diagnostics: z.ZodLiteral<true>;
        authentication: z.ZodLiteral<false>;
        matchmaking: z.ZodLiteral<false>;
        persistence: z.ZodLiteral<false>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type DiagnosticState = z.infer<typeof diagnosticStateSchema>;
export type ProbeEvent = z.infer<typeof probeEventSchema>;
export type SystemStatus = z.infer<typeof systemStatusSchema>;
export type DiagnosticAck = {
    ok: true;
    serverTime: number;
} | {
    ok: false;
    code: 'INVALID_PAYLOAD' | 'RATE_LIMITED';
};
export interface ClientToServerEvents {
    'diagnostic:ping': (ack: (response: {
        serverTime: number;
    }) => void) => void;
    'diagnostic:probe': (payload: unknown, ack: (response: DiagnosticAck) => void) => void;
}
export interface ServerToClientEvents {
    'diagnostic:state': (state: DiagnosticState) => void;
    'diagnostic:probe': (event: ProbeEvent) => void;
    'diagnostic:shutdown': () => void;
}
