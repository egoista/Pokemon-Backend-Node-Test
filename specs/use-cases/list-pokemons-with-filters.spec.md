# Use Case: List Pokemons with Filters

## Description
Retrieves a filtered, paginated, and sorted list of Pokemons based on query parameters.

## Actors
- System User (via API)

## Input Data
- `type`: String (Optional) - Filter by Pokemon type (exact match)
- `name`: String (Optional) - Filter by partial name (case-insensitive search)
- `sortBy`: String (Optional, default: "name") - Field to sort by
- `sortOrder`: String (Optional, default: "asc") - Sort order ("asc" or "desc")
- `page`: Integer (Optional, default: 1) - Page number (must be >= 1)
- `limit`: Integer (Optional, default: 20) - Items per page (must be between 1 and 100)

## Output Data
- `data`: `Pokemon[]` - List of Pokemon entities matching the criteria
- `pagination`: Object containing:
  - `page`: Integer - Current page number
  - `limit`: Integer - Items per page
  - `totalCount`: Integer - Total number of items matching the filter
  - `totalPages`: Integer - Total number of pages

## Business Rules
- `page` must be a positive integer (>= 1)
- `limit` must be between 1 and 100 (inclusive)
- `sortBy` must be a valid Pokemon field (currently only "name" is supported)
- `sortOrder` must be either "asc" or "desc"
- Type filter performs exact match (case-sensitive)
- Name filter performs partial match (case-insensitive)
- Multiple filters are combined with AND logic
- If no results match the filter, return empty array with totalCount = 0

## Errors
- `ValidationError`: when input parameters are invalid (e.g., page < 1, limit > 100, invalid sortOrder)

## Flow
1. **Validate Input**  
   - Validate page number (>= 1)
   - Validate limit (1-100 range)
   - Validate sortBy field
   - Validate sortOrder value ("asc" or "desc")
   - If validation fails, throw `ValidationError`

2. **Build Filter Criteria**  
   - Create filter object based on provided parameters
   - Type filter: exact match
   - Name filter: case-insensitive partial match (LIKE/ILIKE)

3. **Calculate Pagination**  
   - Calculate offset: `(page - 1) * limit`
   - Prepare pagination parameters for repository

4. **Retrieve Data**  
   - Query repository with filter, sort, and pagination parameters
   - Get total count of items matching the filter (for pagination metadata)

5. **Build Pagination Metadata**  
   - Calculate totalPages: `Math.ceil(totalCount / limit)`
   - Create pagination object with page, limit, totalCount, totalPages

6. **Return Result**  
   - Return object containing `data` array and `pagination` metadata
