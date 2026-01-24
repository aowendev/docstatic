# CollapsibleField Component

A generic, reusable wrapper component for TinaCMS fields that adds collapsible functionality without changing the field's display format or behavior.

## Features

- **Generic**: Works with any TinaCMS field component
- **Non-intrusive**: Preserves the original field's display format and functionality
- **Customizable**: Configurable default state (collapsed/expanded)
- **Smart previews**: Shows current value when collapsed
- **Accessible**: Proper ARIA labels and keyboard support
- **Responsive**: Clean, responsive UI that fits TinaCMS theme

## Basic Usage

```jsx
import CollapsibleField from "../CollapsibleField";
import { TextField } from "tinacms";

// Simple wrapper
const CollapsibleSlugField = (props) => (
  <CollapsibleField
    {...props}
    defaultCollapsed={true}
    FieldComponent={TextField}
  />
);

// Use in TinaCMS config
{
  type: "string",
  name: "slug",
  label: "Slug",
  ui: {
    component: CollapsibleSlugField,
  },
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `FieldComponent` | React Component | Required | The original TinaCMS field component to wrap |
| `defaultCollapsed` | boolean | `false` | Whether the field starts collapsed |
| `collapsedHeight` | string | `"auto"` | CSS height value when collapsed |
| `...props` | any | - | All other props are passed through to the wrapped field |

## Pre-built Components

The following ready-to-use collapsible components are included:

### CollapsibleSlugField
```jsx
import CollapsibleSlugField from "../CollapsibleSlugField";

{
  type: "string",
  name: "slug", 
  label: "Slug",
  ui: {
    component: CollapsibleSlugField,
  },
}
```

### CollapsibleDescriptionField
```jsx
import CollapsibleDescriptionField from "../CollapsibleDescriptionField";

{
  type: "string",
  name: "description",
  label: "Description", 
  ui: {
    component: CollapsibleDescriptionField,
  },
}
```

### CollapsibleTagsField
```jsx
import CollapsibleTagsField from "../CollapsibleTagsField";

{
  name: "tags",
  label: "Tags",
  type: "string",
  list: true,
  ui: {
    component: CollapsibleTagsField,
  },
  options: allTags,
}
```

### CollapsibleConditionsField
```jsx
import CollapsibleConditionsField from "../CollapsibleConditionsField";

{
  name: "conditions",
  label: "Conditions", 
  type: "string",
  list: true,
  ui: {
    component: CollapsibleConditionsField,
  },
  options: allConditions,
}
```

### CollapsibleWorkflowField
```jsx
import CollapsibleWorkflowField from "../CollapsibleWorkflowField";

{
  type: "boolean",
  name: "draft",
  label: "Workflow",
  ui: {
    component: CollapsibleWorkflowField,
  },
}
```

## Advanced Usage

### Custom Field Component
```jsx
import CollapsibleField from "../CollapsibleField";
import MyCustomField from "../MyCustomField";

const CollapsibleCustomField = (props) => (
  <CollapsibleField
    {...props}
    defaultCollapsed={true}
    FieldComponent={MyCustomField}
  />
);
```

### With Rich Text Fields
```jsx
import { RichTextField } from "tinacms";

const CollapsibleBodyField = (props) => (
  <CollapsibleField
    {...props}
    defaultCollapsed={false}
    FieldComponent={RichTextField}
  />
);
```

### With Reference Fields
```jsx
import { ReferenceField } from "tinacms";

const CollapsibleReferenceField = (props) => (
  <CollapsibleField
    {...props}
    defaultCollapsed={true}
    FieldComponent={ReferenceField}
  />
);
```

## Behavior

- **Collapsed State**: Shows a compact preview of the current value
- **Expanded State**: Shows the full field interface
- **Value Preview**: Automatically formats arrays, strings, and other values appropriately
- **Interaction**: Clicking the toggle button smoothly animates between states
- **Accessibility**: Screen readers can understand the collapse/expand functionality

## Styling

The component uses Tailwind CSS classes that match the existing TinaCMS theme. Key visual elements:

- Smooth transitions (300ms ease-in-out)
- Consistent spacing and typography
- Hover states for interactive elements
- Proper visual hierarchy
- Accessible color contrasts

## Integration with Existing Fields

To replace existing field usage with collapsible versions:

**Before:**
```jsx
{
  type: "string",
  name: "slug",
  label: "Slug",
}
```

**After:**
```jsx
{
  type: "string", 
  name: "slug",
  label: "Slug",
  ui: {
    component: CollapsibleSlugField,
  },
}
```

The field retains all its original functionality while gaining collapsible behavior.