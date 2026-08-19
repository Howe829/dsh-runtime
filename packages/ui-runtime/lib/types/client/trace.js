/** Session and Agent Turn projections over the bounded runtime event window. */
/**
 * Build the stable selection key for one Session-owned Agent Turn.
 * @param sessionId - Opaque Session id from the trace event.
 * @param turn - Session-local Turn number.
 * @returns A key that remains unique across concurrent Sessions.
 */
export function runtimeTraceTurnKey(sessionId, turn) {
    return `${sessionId}:${turn}`;
}
function compareEvents(a, b) {
    return a.time - b.time || a.seq - b.seq;
}
function turnStatus(events, outcome) {
    const hasStart = events.some(event => event.type === 'turn/start');
    const hasEnd = events.some(event => event.type === 'turn/end');
    if (!hasStart)
        return 'incomplete';
    if (!hasEnd)
        return 'running';
    if (outcome === 'error')
        return 'failed';
    if (outcome === 'completed' || outcome === 'max-tokens')
        return 'completed';
    return 'stopped';
}
/**
 * Group the bounded event window into recent Sessions and their Agent Turns.
 * @param events - Privacy-safe events from the latest runtime snapshot.
 * @returns Sessions and Turns sorted by most recent activity.
 */
export function groupRuntimeTrace(events) {
    const sessions = new Map();
    for (const event of events) {
        let session = sessions.get(event.sessionId);
        if (session === undefined) {
            session = { sessionId: event.sessionId, turns: new Map(), sessionEvents: [] };
            sessions.set(event.sessionId, session);
        }
        if (event.turn === undefined) {
            session.sessionEvents.push(event);
            continue;
        }
        let turn = session.turns.get(event.turn);
        if (turn === undefined) {
            turn = { sessionId: event.sessionId, turn: event.turn, events: [event] };
            session.turns.set(event.turn, turn);
            continue;
        }
        turn.events.push(event);
    }
    return [...sessions.values()].map((session) => {
        const sessionEvents = [...session.sessionEvents].sort(compareEvents);
        const turns = [...session.turns.values()].map((turn) => {
            const turnEvents = [...turn.events].sort(compareEvents);
            const start = turnEvents.find(event => event.type === 'turn/start') ?? turn.events[0];
            const end = turnEvents.findLast(event => event.type === 'turn/end');
            const updatedAt = turnEvents.at(-1)?.time ?? start.time;
            const outcome = end?.outcome;
            return {
                key: runtimeTraceTurnKey(turn.sessionId, turn.turn),
                sessionId: turn.sessionId,
                turn: turn.turn,
                events: turnEvents,
                startedAt: start.time,
                updatedAt,
                durationMs: Math.max(0, (end?.time ?? updatedAt) - start.time),
                eventCount: turnEvents.length,
                stepCount: new Set(turnEvents.flatMap(event => event.step === undefined ? [] : [event.step])).size,
                toolCallCount: turnEvents.filter(event => event.type === 'tool/call').length,
                status: turnStatus(turnEvents, outcome),
                ...(outcome === undefined ? {} : { outcome }),
            };
        }).sort((a, b) => b.updatedAt - a.updatedAt || b.turn - a.turn);
        const updatedAt = Math.max(...turns.map(turn => turn.updatedAt), ...sessionEvents.map(event => event.time));
        return {
            sessionId: session.sessionId,
            turns,
            sessionEvents,
            eventCount: turns.reduce((count, turn) => count + turn.eventCount, sessionEvents.length),
            updatedAt,
        };
    }).sort((a, b) => b.updatedAt - a.updatedAt || a.sessionId.localeCompare(b.sessionId));
}
function includesTurn(turn, query) {
    return [
        `turn ${turn.turn}`,
        String(turn.turn),
        turn.status,
        turn.outcome,
        ...turn.events.flatMap(event => [event.type, event.name, event.callId]),
    ].filter(value => value !== undefined).join('\n').toLowerCase().includes(query);
}
/**
 * Filter the Turn directory without flattening its Session grouping.
 * @param sessions - Grouped runtime trace Sessions.
 * @param query - Normalized user query.
 * @returns Matching Session groups in their existing activity order.
 */
export function filterRuntimeTrace(sessions, query) {
    if (query === '')
        return [...sessions];
    return sessions.flatMap((session) => {
        if (session.sessionId.toLowerCase().includes(query))
            return [session];
        const turns = session.turns.filter(turn => includesTurn(turn, query));
        const sessionEvents = session.sessionEvents.filter(event => [event.type, event.name, event.callId, event.outcome]
            .filter(value => value !== undefined).join('\n').toLowerCase().includes(query));
        if (turns.length === 0 && sessionEvents.length === 0)
            return [];
        return [{
                ...session,
                turns,
                sessionEvents,
                eventCount: turns.reduce((count, turn) => count + turn.eventCount, sessionEvents.length),
            }];
    });
}
//# sourceMappingURL=trace.js.map