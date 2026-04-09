# Safety Budget

## Per-Call Limits
| Tier | Max cost/call | Max calls/pipeline | Timeout |
|------|:---:|:---:|:---:|
| fast | $0.01 | 20 | 30s |
| standard | $0.05 | 10 | 120s |
| pro | $0.20 | 5 | 180s |
| premium | $1.00 | 3 | 300s |

## Per-Pipeline Limits
- Max total fal.ai calls: 15
- Max total E2B sandboxes: 3
- Max retry budget: 3 per generation, 2 per alignment check
- Hard timeout: 10 minutes total pipeline
- If budget exhausted: stop and report to user

## Anti-Escalation
- After 2 failed regenerations at same tier: escalate ONE tier, not more
- After 1 failed regeneration at premium: STOP, report
- Never auto-escalate from standard to premium — go through pro first
