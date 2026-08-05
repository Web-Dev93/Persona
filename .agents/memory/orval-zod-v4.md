---
name: Orval Zod v4 import fix
description: Orval generates Zod v4 syntax (zod.int()) but the catalog has zod@3.x. Fix: patch the import after codegen.
---

## Rule

After running `orval --config ./orval.config.ts`, the generated `lib/api-zod/src/generated/api.ts` imports from `'zod'` (resolves to v3) but uses `zod.int()` which is Zod v4 syntax. This causes `tsc --build` to fail with `Property 'int' does not exist`.

**Fix applied in `lib/api-spec/package.json` codegen script:**
```
orval --config ./orval.config.ts && sed -i "s|import * as zod from 'zod'|import * as zod from 'zod/v4'|g" ../../lib/api-zod/src/generated/api.ts && pnpm -w run typecheck:libs
```

**Why:** The workspace catalog pins `zod: ^3.25.76`. The `zod/v4` subpath export provides v4 API compatibility. DB schema files already use `from "zod/v4"` for the same reason.

**How to apply:** Always include this sed patch in the codegen script whenever `api-spec/package.json` is regenerated or the codegen script is reset.
