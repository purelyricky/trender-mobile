# Database Collections

## 1. usercartitems
| Field | Type |
|-------|------|
| userId | string |
| clothingId | string |
| quantity | integer |
| addedAt | datetime |

## 2. usersaveditems
| Field | Type |
|-------|------|
| clothingId | string |
| userId | string |
| savedAt | datetime |

## 3. userinteractions
| Field | Type |
|-------|------|
| userId | string |
| interactionType | enum ["like", "dislike", "cart"] |
| createdAt | datetime |
| updatedAt | datetime |
| clothingId | string |

## 4. clothes
| Field | Type |
|-------|------|
| name | string |
| type | enum |
| description | string |
| price | integer |
| size | enum |
| color | enum |

## 5. galleries
| Field | Type |
|-------|------|
| image | url |