# Typesense Configuration for Training1

## Collections Schema

### 1. Courses Collection
```json
{
  "name": "courses",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "tenantId", "type": "string", "facet": true},
    {"name": "title", "type": "string"},
    {"name": "description", "type": "string", "optional": true},
    {"name": "tags", "type": "string[]", "facet": true, "optional": true},
    {"name": "category", "type": "string", "facet": true, "optional": true},
    {"name": "status", "type": "string", "facet": true},
    {"name": "duration", "type": "int32", "optional": true},
    {"name": "enrollmentCount", "type": "int32", "optional": true},
    {"name": "rating", "type": "float", "optional": true},
    {"name": "createdAt", "type": "int64"},
    {"name": "updatedAt", "type": "int64"}
  ],
  "default_sorting_field": "enrollmentCount"
}
```

### 2. Users Collection
```json
{
  "name": "users",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "tenantId", "type": "string", "facet": true},
    {"name": "email", "type": "string"},
    {"name": "givenName", "type": "string", "optional": true},
    {"name": "familyName", "type": "string", "optional": true},
    {"name": "fullName", "type": "string"},
    {"name": "roles", "type": "string[]", "facet": true},
    {"name": "createdAt", "type": "int64"}
  ],
  "default_sorting_field": "createdAt"
}
```

### 3. Content (Lessons/Activities) Collection
```json
{
  "name": "content",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "tenantId", "type": "string", "facet": true},
    {"name": "courseId", "type": "string", "facet": true},
    {"name": "type", "type": "string", "facet": true},
    {"name": "title", "type": "string"},
    {"name": "description", "type": "string", "optional": true},
    {"name": "contentText", "type": "string", "optional": true},
    {"name": "tags", "type": "string[]", "facet": true, "optional": true},
    {"name": "duration", "type": "int32", "optional": true},
    {"name": "createdAt", "type": "int64"}
  ],
  "default_sorting_field": "createdAt"
}
```

### 4. Assessment Items Collection
```json
{
  "name": "assessment_items",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "tenantId", "type": "string", "facet": true},
    {"name": "type", "type": "string", "facet": true},
    {"name": "stem", "type": "string"},
    {"name": "tags", "type": "string[]", "facet": true, "optional": true},
    {"name": "difficulty", "type": "string", "facet": true, "optional": true},
    {"name": "createdAt", "type": "int64"}
  ],
  "default_sorting_field": "createdAt"
}
```

## Setup Script

Run this to create collections on Typesense Cloud:

```bash
# Backend: src/config/typesense.ts
import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [{
    host: process.env.TYPESENSE_HOST!,
    port: Number(process.env.TYPESENSE_PORT) || 443,
    protocol: process.env.TYPESENSE_PROTOCOL || 'https'
  }],
  apiKey: process.env.TYPESENSE_API_KEY!,
  connectionTimeoutSeconds: 2
});

export default client;
```

## Indexing Strategy

1. **Sync on Create/Update**: Index documents when created/modified
2. **Bulk Import**: Initial import from PostgreSQL
3. **Real-time Updates**: Use database triggers or event listeners
4. **Scheduled Reindex**: Daily full reindex for consistency

## Usage Examples

### Search Courses
```typescript
const results = await typesenseClient.collections('courses')
  .documents()
  .search({
    q: 'javascript programming',
    query_by: 'title,description,tags',
    filter_by: 'tenantId:=abc123 && status:=published',
    sort_by: 'enrollmentCount:desc',
    per_page: 20
  });
```

### Faceted Search
```typescript
const results = await typesenseClient.collections('courses')
  .documents()
  .search({
    q: '*',
    facet_by: 'category,tags,status',
    filter_by: 'tenantId:=abc123',
    max_facet_values: 10
  });
```

### Autocomplete
```typescript
const results = await typesenseClient.collections('courses')
  .documents()
  .search({
    q: 'prog',
    query_by: 'title',
    prefix: true,
    per_page: 5
  });
```

## Performance Tips

1. **Index Size**: Keep indexed fields minimal
2. **Typo Tolerance**: Enable for better UX
3. **Caching**: Cache frequent searches
4. **Pagination**: Use cursor-based pagination for large results
5. **Multi-tenant**: Always filter by tenantId for security

## Deployment

### Typesense Cloud (Recommended)
- Hosted solution with automatic backups
- $29/mo for Starter plan
- https://cloud.typesense.org

### Self-Hosted on Render
- Use Docker service with persistent disk
- See render.yaml configuration
- Cheaper but requires maintenance
