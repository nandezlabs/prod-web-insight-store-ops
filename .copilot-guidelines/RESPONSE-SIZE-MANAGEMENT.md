# Response Size Management Guidelines

**Purpose:** Prevent network errors (ERR_CONNECTION_CLOSED) from oversized responses

---

## Size Limits

**Safe Response Size:** < 50KB (~10,000 words)  
**Warning Zone:** 50-80KB  
**Danger Zone:** > 80KB (high risk of network error)

---

## Response Strategies by Request Type

### 1. Large Documentation/Reports

**DON'T:** Generate massive single files with everything  
**DO:**

- Create multiple focused files (Part 1, Part 2, etc.)
- Use file creation instead of chat responses
- Provide executive summary in chat, details in files

**Example:**

```
Instead of: 5000-line comprehensive report in chat
Use: Create 3-5 separate markdown files, brief summary in chat
```

### 2. Implementation Plans

**DON'T:** List every single task with full descriptions  
**DO:**

- High-level phases with file references
- Checklist format (concise bullets)
- Separate detailed specs in files

**Example:**

```
Chat: "Created ROADMAP.md with 12-week plan (5 phases, 40 tasks)"
File: Full implementation details with acceptance criteria
```

### 3. Code Generation

**DON'T:** Generate 10+ complete files in one response  
**DO:**

- Batch similar files together
- Use multi_replace or create_file in parallel
- Provide progress updates, not full code dumps

**Example:**

```
Instead of: Showing all 10 files' complete code
Use: "Creating 10 API endpoints..." + tool calls
```

### 4. Analysis/Comparison Reports

**DON'T:** Compare every single feature line-by-line  
**DO:**

- Summary tables
- Key differences only
- Full details in separate file

**Example:**

```
Chat: "Gap analysis complete. 15 missing features identified."
File: Detailed comparison matrix
```

---

## Red Flags (Triggers for Size Issues)

1. **"Comprehensive"** - Usually means too much detail
2. **"Complete list of..."** - Lists can be huge
3. **"Step-by-step for everything"** - Too granular
4. **Multiple large code blocks** - Each adds significant size
5. **Repeating context** - User already has the info

---

## Quick Fixes

### When Response Grows Too Large:

**Option 1: Split into files**

```
- Part 1: Overview + Priority items
- Part 2: Medium priority
- Part 3: Low priority + future
```

**Option 2: Use tables**

```
Instead of paragraphs, use markdown tables for comparison
```

**Option 3: Reference existing docs**

```
"See FEATURE-GAP-ANALYSIS.md section 3 for details"
```

**Option 4: Progressive disclosure**

```
"Would you like me to detail:
A) User Management
B) Store Management
C) All features"
```

---

## Response Templates

### For Large Reports:

```
✅ Created [FILENAME].md with:
- Section 1: [brief]
- Section 2: [brief]
- Section 3: [brief]

Total: X features analyzed, Y missing, Z phases planned

Next: [specific action item]
```

### For Implementation Plans:

```
✅ Created implementation roadmap:

**Phase 1 (Weeks 1-4):** User & Store Management
- 4 weeks, 20 tasks

**Phase 2 (Weeks 5-8):** Enhanced Features
- 4 weeks, 15 tasks

**Phase 3 (Weeks 9-12):** Communication & Real-time
- 4 weeks, 18 tasks

See ROADMAP.md for full details.

Current focus: [task 1]
Ready to proceed? [Y/N]
```

### For Multi-file Creation:

```
✅ Created 8 files:

API Endpoints:
- admin-users.ts (CRUD operations)
- admin-stores.ts (store management)

Components:
- UserManagement.tsx
- StoreManagement.tsx

Files ready. Run dev server to test.
```

---

## Measuring Response Size

**Simple heuristic:**

- 1 line ≈ 80 characters
- 1KB ≈ 12 lines
- 50KB ≈ 600 lines

**If response would exceed 500 lines:** Create files instead

---

## Implementation Checklist

Before sending large responses:

- [ ] Can this be a file instead of chat response?
- [ ] Can I use tables instead of paragraphs?
- [ ] Can I reference existing docs instead of repeating?
- [ ] Can I split into multiple focused responses?
- [ ] Is the user asking for details or just confirmation?
- [ ] Can I provide summary + "ask for more" pattern?

---

## Example: Good vs Bad

### ❌ BAD (Too Large):

```
Here's the complete analysis with every feature compared...
[5000 lines of detailed comparison]
[Full implementation guide for each feature]
[Complete code examples for all components]
```

### ✅ GOOD (Focused):

```
Analysis complete. Created 3 files:

1. FEATURE-GAP-ANALYSIS.md - 15 missing features
2. IMPLEMENTATION-ROADMAP.md - 12-week plan
3. QUICK-WINS.md - Low-hanging fruit

Summary: Core features ✅, missing 15 enterprise features
Priority: User Management → Store Management → Notifications

Ready to start Week 1? I'll create the user management API.
```

---

**Rule of Thumb:** If you're writing more than 3 paragraphs of explanation, create a file instead.
