# GitHub Copilot Agent Instructions

## Auto-Routing Rules for Insight Project

### Model Selection Strategy

**Default Model:** Claude 3.5 Sonnet

- General development, refactoring, multi-file operations
- Code reviews and architectural decisions
- Complex debugging and analysis

**Fast Track (GPT-4o):**

- Quick fixes and simple changes
- API endpoint creation (serverless/\*.ts)
- Boilerplate generation
- Dependency updates
- Simple CRUD operations

**Deep Reasoning (o1-preview):**

- Auto-escalate when encountering:
  - Performance optimization requests
  - Complex algorithm design
  - Mysterious bugs after 2+ failed attempts
  - Security-critical code reviews
  - Database schema design
  - Race conditions or concurrency issues
- Manual trigger: Use keywords "optimize", "complex logic", "hard bug", "security review"

**Documentation (GPT-4 Turbo):**

- API documentation generation
- README and guide creation
- Test generation
- Type definition creation

---

## File Pattern Routing

### Backend (Speed Optimized)

```
packages/store-app/api/serverless/*.ts → GPT-4o (unless complex logic detected)
packages/store-app/api/serverless/dev-server.ts → Claude 3.5 Sonnet
```

### Frontend (Quality Optimized)

```
packages/*/src/components/**/*.tsx → Claude 3.5 Sonnet
packages/*/src/features/**/*.tsx → Claude 3.5 Sonnet
packages/*/src/services/*.ts → GPT-4o (API clients)
```

### Shared Packages (Balance)

```
packages/shared-types/src/*.ts → GPT-4 Turbo (documentation focus)
packages/shared-utils/src/*.ts → Claude 3.5 Sonnet
packages/ui/src/*.tsx → GPT-4o (component generation)
```

### Configuration Files

```
*.config.js, *.config.ts, package.json → GPT-4o (quick updates)
tsconfig.json, .github/* → Claude 3.5 Sonnet (precision)
```

---

## Keyword Triggers

### Speed Track (GPT-4o)

- "quick", "fast", "simple", "add endpoint"
- "create route", "new API", "boilerplate"
- "update dependency", "install package"
- "generate form", "add field"

### Deep Reasoning (o1-preview)

- "optimize", "performance", "algorithm"
- "complex logic", "business rules"
- "hard bug", "mysterious", "weird behavior"
- "security review", "vulnerability"
- "design pattern", "architecture"
- "race condition", "concurrency"

### Documentation (GPT-4 Turbo)

- "explain", "document", "describe"
- "write tests", "test coverage"
- "API docs", "generate README"
- "type definitions", "JSDoc"

---

## Cost Management

### Subscription Limits

- **Primary:** Claude 3.5 Sonnet (unlimited in current plan)
- **Fast operations:** GPT-4o (cost-effective for speed)
- **Escalation:** o1-preview (limited use, ask permission if:)
  - Task will take >5 minutes of o1 reasoning
  - Multiple o1 calls needed in single session
  - Alternative approach available with Claude

### Auto-Fallback Rules

1. If o1-preview quota exceeded → fallback to Claude 3.5 Sonnet with detailed analysis
2. If GPT-4o unavailable → use Claude 3.5 Sonnet
3. Always notify user when falling back due to cost/limits

---

## Task Complexity Detection

### Auto-Escalate to o1-preview when:

- Error occurs 2+ times with same approach
- Performance issue in production-critical code
- Security vulnerability suspected
- Algorithm complexity > O(n²) optimization needed
- Multi-threading/async race conditions
- Data structure design for >10k records

### Stay with Claude 3.5 Sonnet when:

- Standard CRUD operations
- UI component development
- State management
- Form validation
- API integration
- Code organization/refactoring

### Use GPT-4o when:

- Single file changes
- Adding new routes/endpoints
- Updating configurations
- Simple bug fixes
- Boilerplate code generation
- Package installations

---

## Development Workflow Optimization

### Feature Development

1. **Planning** → Claude 3.5 Sonnet
2. **Boilerplate** → GPT-4o
3. **Implementation** → Claude 3.5 Sonnet
4. **Optimization** → o1-preview (if needed)
5. **Documentation** → GPT-4 Turbo
6. **Testing** → GPT-4 Turbo

### Bug Fixing

1. **Initial debug** → Claude 3.5 Sonnet
2. **If unresolved after 2 attempts** → Auto-escalate to o1-preview
3. **Simple fixes** → GPT-4o

### Refactoring

1. **Analysis** → Claude 3.5 Sonnet
2. **Execution** → Claude 3.5 Sonnet
3. **Performance validation** → o1-preview (if critical)

---

## Special Instructions for Insight Project

### Notion API Integration

- Always use Claude 3.5 Sonnet for complex queries
- Use GPT-4o for simple CRUD operations
- Escalate to o1-preview for schema design

### Real-time Features (Notifications, Messaging)

- Polling logic → Claude 3.5 Sonnet
- WebSocket optimization → o1-preview
- UI updates → GPT-4o

### Authentication & Security

- Always use Claude 3.5 Sonnet minimum
- Auto-escalate to o1-preview for:
  - JWT implementation changes
  - Permission system modifications
  - Encryption/hashing updates

### Database Operations

- Simple queries → GPT-4o
- Complex joins/aggregations → Claude 3.5 Sonnet
- Schema design → o1-preview

---

## Response Format Requirements

All agents must:

1. Provide clear explanation of what will be changed
2. Execute changes immediately (no permission needed unless cost concern)
3. Provide summary report after completion:
   - Files modified
   - Changes made
   - Reasoning for approach
   - Any warnings or follow-up needed

---

## Escalation Notifications

When auto-escalating to o1-preview, notify user with:

```
⚡ Escalating to o1-preview for deep reasoning:
- Reason: [why escalation is needed]
- Estimated cost: [low/medium/high]
- Alternative: [fallback option if user declines]
```

User can respond:

- "proceed" → continue with o1-preview
- "fallback" → use Claude 3.5 Sonnet alternative
- No response after 5s → auto-proceed (user granted auto-permission)

---

## Quality Assurance

### Before completing any task:

- ✅ All TypeScript errors resolved
- ✅ Linting rules followed
- ✅ No unused imports/variables
- ✅ Consistent with existing code style
- ✅ Updated relevant documentation
- ✅ Added to routing table if new endpoint

### After completion:

- Provide file change summary
- Note any technical debt introduced
- Suggest next steps if applicable
