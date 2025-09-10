# Implementation Plan: Add Due Date Field to Todos (AIADT-106)

## Context

**Jira Ticket**: [AIADT-106](https://diligentbrands.atlassian.net/browse/AIADT-106)

**Title**: Add Due Date field to todos

**Business Value**: Allow users to set and view deadlines for tasks, enabling better prioritization and time-management.

**User Requirements**:

- Extend Todo data model with optional due date
- If persistence is already implemented, persist due date to sessionStorage
- UI: Add date picker to create/edit modal, display due date in list
- Basic validation and graceful handling of missing/invalid values
- Update unit tests

**Technical Context**:

- Current Todo interface: `{ id, title, description, completed, createdAt }`
- TodoContext uses in-memory state (no sessionStorage persistence currently implemented)
- Uses Material-UI components and React hooks
- Edit functionality exists but is incomplete (currently only console logs)
- All tests must pass with existing coverage baseline

**Dependencies to Add**:

- `@mui/x-date-pickers` for DatePicker component
- `date-fns` for date formatting and manipulation

**Clarifications from Comments**:

- No sessionStorage persistence exists currently, so due date will work with in-memory state only
- Edit modal functionality needs to be completed as part of this task
- LocalizationProvider will be added to App.tsx wrapping TodoProvider

## Task List

### Task 1: Install Required Dependencies

**Status**: TODO  
**Depends On**: None  
**Description**:
Install the required date handling dependencies for the due date feature.

**Code Snippets**:

```bash
npm install @mui/x-date-pickers date-fns
```

**Verification**:

- Dependencies appear in package.json
- npm install completes without errors
- No version conflicts with existing dependencies

### Task 2: Update Todo Interface

**Status**: TODO  
**Depends On**: None  
**Description**:
Add optional `dueDate` field to the Todo interface as an ISO 8601 string.

**Code Snippets**:

```typescript
// src/types/Todo.ts
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: string; // ISO 8601 date string
}
```

**Verification**:

- Todo interface includes optional dueDate field
- TypeScript compilation succeeds
- No breaking changes to existing code

### Task 3: Update TodoContext Interface and Implementation

**Status**: TODO  
**Depends On**: [2]  
**Description**:
Update the TodoContextType interface and TodoProvider implementation to handle due dates in addTodo and editTodo functions.

**Code Snippets**:

```typescript
// src/contexts/TodoContextType.ts
export interface TodoContextType {
  todos: Todo[];
  addTodo: (title: string, description: string, dueDate?: string) => void;
  editTodo: (id: string, updates: Partial<Todo>) => void;
  toggleTodoCompletion: (id: string) => void;
  deleteTodo: (id: string) => void;
}

// src/contexts/TodoContext.tsx - addTodo function
const addTodo = (title: string, description: string, dueDate?: string) => {
  const newTodo: Todo = {
    id: uuidv4(),
    title,
    description,
    completed: false,
    createdAt: new Date(),
    dueDate, // Will be undefined if not provided
  };
  setTodos([...todos, newTodo]);
};
```

**Verification**:

- TodoContextType interface updated with new addTodo signature
- addTodo function accepts optional dueDate parameter
- editTodo function can handle dueDate in updates object
- TypeScript compilation succeeds
- Existing functionality remains unaffected

### Task 4: Add LocalizationProvider to App

**Status**: TODO  
**Depends On**: [1]  
**Description**:
Wrap the application with LocalizationProvider from @mui/x-date-pickers to enable date picker functionality.

**Code Snippets**:

```typescript
// src/App.tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  // ... existing code ...

  return (
    <AtlasThemeProvider>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TodoProvider>
          {/* ... existing JSX ... */}
        </TodoProvider>
      </LocalizationProvider>
    </AtlasThemeProvider>
  );
}
```

**Verification**:

- LocalizationProvider wraps TodoProvider
- AdapterDateFns is imported and used
- Application renders without errors
- Date picker components can be used throughout the app

### Task 5: Update TodoModal to Include Due Date Picker

**Status**: TODO  
**Depends On**: [3, 4]  
**Description**:
Add DatePicker component to TodoModal for both create and edit modes. Include validation and state management for due date.

**Code Snippets**:

```typescript
// src/components/TodoModal/TodoModal.tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Add to interface
interface TodoModalProps {
  // ... existing props ...
  initialValues?: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string;
  };
}

// Add to component state
const [dueDate, setDueDate] = useState<Date | null>(null);

// In useEffect for loading initial values
useEffect(() => {
  if (isOpen) {
    if (mode === 'edit' && initialValues) {
      // ... existing code ...
      setDueDate(initialValues.dueDate ? new Date(initialValues.dueDate) : null);
    } else {
      // ... existing code ...
      setDueDate(null);
    }
  }
}, [isOpen, mode, initialValues]);

// In handleSubmit
if (mode === 'create') {
  addTodo(title.trim(), description.trim(), dueDate?.toISOString());
} else if (mode === 'edit' && initialValues) {
  editTodo(initialValues.id, {
    title: title.trim(),
    description: description.trim(),
    completed,
    dueDate: dueDate?.toISOString(),
  });
}

// In JSX after description field
<DatePicker
  label="Due Date (Optional)"
  value={dueDate}
  onChange={(newValue) => setDueDate(newValue)}
  slotProps={{
    textField: {
      fullWidth: true,
      'data-testid': 'due-date-picker',
    },
  }}
/>
```

**Verification**:

- DatePicker appears in both create and edit modes
- Due date is properly loaded in edit mode
- Due date is included in form submission
- Form validation handles invalid dates gracefully
- Date picker follows Material-UI design system

### Task 6: Update TodoItem to Display Due Date

**Status**: TODO  
**Depends On**: [1, 2]  
**Description**:
Modify TodoItem component to display due date information with proper formatting and visual indicators for overdue items.

**Code Snippets**:

```typescript
// src/components/TodoList/TodoItem.tsx
import { format, isPast, isToday } from 'date-fns';
import { Chip } from '@mui/material';

// Add due date display logic
const getDueDateDisplay = (dueDate?: string) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const formattedDate = format(date, 'PP'); // e.g., "Jan 1, 2024"

  let color: 'default' | 'error' | 'warning' | 'success' = 'default';
  let label = formattedDate;

  if (isPast(date) && !isToday(date)) {
    color = 'error';
    label = `Overdue: ${formattedDate}`;
  } else if (isToday(date)) {
    color = 'warning';
    label = `Due Today: ${formattedDate}`;
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{ ml: 1 }}
    />
  );
};

// In JSX, add after description
<ListItemText
  disableTypography
  primary={
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography
        variant="body1"
        sx={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? 'text.secondary' : 'text.primary',
          fontWeight: 500,
        }}
      >
        {todo.title}
      </Typography>
      {getDueDateDisplay(todo.dueDate)}
    </Box>
  }
  secondary={
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        textDecoration: todo.completed ? 'line-through' : 'none',
      }}
    >
      {todo.description}
    </Typography>
  }
/>
```

**Verification**:

- Due date displays correctly when present
- No due date shows no additional UI elements
- Overdue items show error color chip
- Today's due items show warning color chip
- Future due dates show default color
- Layout remains clean and responsive

### Task 7: Complete Edit Modal Integration

**Status**: TODO  
**Depends On**: [5]  
**Description**:
Replace the console.log in App.tsx handleEditTodo with proper modal state management to enable full edit functionality.

**Code Snippets**:

```typescript
// src/App.tsx
import { useState } from 'react';
import { TodoModal } from './components/TodoModal/TodoModal';

function App() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTodo(null);
  };

  return (
    <AtlasThemeProvider>
      {/* ... existing JSX ... */}
      <TodoModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        initialValues={editingTodo ? {
          id: editingTodo.id,
          title: editingTodo.title,
          description: editingTodo.description,
          completed: editingTodo.completed,
          dueDate: editingTodo.dueDate,
        } : undefined}
      />
    </AtlasThemeProvider>
  );
}
```

**Verification**:

- Clicking a todo item opens edit modal
- Edit modal is pre-populated with current values including due date
- Saving changes updates the todo in the list
- Modal closes after successful save
- Cancel button closes modal without changes

### Task 8: Add Date Validation Utility

**Status**: TODO  
**Depends On**: [1]  
**Description**:
Create utility functions for date validation to prevent submission of invalid dates and handle edge cases gracefully.

**Code Snippets**:

```typescript
// src/utils/dateUtils.ts (new file)
import { isValid, parseISO } from 'date-fns';

export const validateDate = (dateString: string | undefined): boolean => {
  if (!dateString) return true; // Optional field

  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

export const formatDateForStorage = (date: Date | null): string | undefined => {
  return date ? date.toISOString() : undefined;
};

export const parseDateFromStorage = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;

  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};
```

**Verification**:

- Utility functions handle null/undefined gracefully
- Invalid date strings return false/null appropriately
- Valid dates are properly converted between formats
- Functions are reusable across components

### Task 9: Update Unit Tests

**Status**: TODO  
**Depends On**: [2, 3, 5, 6, 7]  
**Description**:
Update existing unit tests and add new tests for due date functionality across all modified components.

**Code Snippets**:

```typescript
// src/__tests__/TodoContext.test.tsx - Add tests
test('addTodo creates todo with due date', () => {
  const { result } = renderHook(() => useTodo(), { wrapper: TodoProvider });
  const dueDate = '2024-12-31T23:59:59.999Z';

  act(() => {
    result.current.addTodo('Test Todo', 'Test Description', dueDate);
  });

  expect(result.current.todos).toHaveLength(1);
  expect(result.current.todos[0].dueDate).toBe(dueDate);
});

test('addTodo creates todo without due date', () => {
  const { result } = renderHook(() => useTodo(), { wrapper: TodoProvider });

  act(() => {
    result.current.addTodo('Test Todo', 'Test Description');
  });

  expect(result.current.todos).toHaveLength(1);
  expect(result.current.todos[0].dueDate).toBeUndefined();
});

// src/__tests__/TodoModal.test.tsx - Add tests
test('displays date picker in create mode', () => {
  render(
    <TodoModal isOpen={true} onClose={mockOnClose} mode="create" />
  );

  expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
});

test('loads due date in edit mode', () => {
  const mockTodo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    dueDate: '2024-12-31T00:00:00.000Z'
  };

  render(
    <TodoModal
      isOpen={true}
      onClose={mockOnClose}
      mode="edit"
      initialValues={mockTodo}
    />
  );

  // Test that date picker shows the correct date
  expect(screen.getByDisplayValue('12/31/2024')).toBeInTheDocument();
});

// src/__tests__/TodoItem.test.tsx - Add tests
test('displays due date when present', () => {
  const todoWithDueDate = {
    ...mockTodo,
    dueDate: '2024-12-31T00:00:00.000Z'
  };

  render(
    <TodoItem todo={todoWithDueDate} onEditClick={mockOnEditClick} />
  );

  expect(screen.getByText(/Dec 31, 2024/)).toBeInTheDocument();
});

test('shows overdue indicator for past due dates', () => {
  const overdueTodo = {
    ...mockTodo,
    dueDate: '2020-01-01T00:00:00.000Z'
  };

  render(
    <TodoItem todo={overdueTodo} onEditClick={mockOnEditClick} />
  );

  expect(screen.getByText(/overdue/i)).toBeInTheDocument();
});
```

**Verification**:

- All existing tests continue to pass
- New tests cover due date functionality
- Test coverage meets or exceeds existing baseline
- Edge cases are tested (null dates, invalid dates, overdue dates)
- Mock date functions work correctly in tests

### Task 10: Manual Testing and Validation

**Status**: TODO  
**Depends On**: [1, 2, 3, 4, 5, 6, 7, 8, 9]  
**Description**:
Perform comprehensive manual testing to ensure all acceptance criteria are met and the feature works as expected.

**Manual Test Cases**:

1. **Create Todo with Due Date**:
   - Open create modal
   - Fill in title, description, and due date
   - Submit and verify todo appears with due date

2. **Create Todo without Due Date**:
   - Open create modal
   - Fill in only title and description
   - Submit and verify todo appears without due date display

3. **Edit Existing Todo - Add Due Date**:
   - Click on existing todo without due date
   - Add due date in edit modal
   - Save and verify due date appears

4. **Edit Existing Todo - Modify Due Date**:
   - Click on existing todo with due date
   - Change due date in edit modal
   - Save and verify new due date appears

5. **Edit Existing Todo - Remove Due Date**:
   - Click on existing todo with due date
   - Clear due date in edit modal
   - Save and verify due date no longer appears

6. **Date Validation**:
   - Try to enter invalid date formats
   - Verify graceful handling and appropriate error messages

7. **Visual Indicators**:
   - Create todos with past, today, and future due dates
   - Verify correct color coding and labels

8. **Responsive Design**:
   - Test on mobile and desktop viewports
   - Verify due date display adapts properly

**Verification**:

- All acceptance criteria from ticket are met
- No console errors during normal usage
- UI remains responsive and accessible
- Date formatting is consistent and user-friendly
- Edge cases are handled gracefully

## Execution Guide

### Prerequisites

- Ensure development environment is set up
- All existing tests are passing
- No pending changes in working directory

### Execution Process

1. **Pick the next task** that is not in progress and has all dependencies marked as DONE.
   If multiple tasks are eligible, pick the first one in the list.

2. **Execute the selected task**:
   a. Set status to IN-PROGRESS
   b. Follow the task description and code snippets
   c. Complete verification steps
   d. Set status to DONE when verified successfully

3. **Continue to the next eligible task** until all tasks are completed.

### Acceptance Criteria Mapping

| Acceptance Criteria                                                | Tasks               |
| ------------------------------------------------------------------ | ------------------- |
| User can optionally pick a due date when creating a todo           | Tasks 1, 2, 3, 4, 5 |
| Existing todos without due date remain unaffected                  | Tasks 2, 3, 6       |
| Editing a todo shows current due date and allows change or removal | Tasks 5, 7          |
| Due date shows in todo item list                                   | Task 6              |
| Validation prevents submission of clearly invalid dates            | Tasks 5, 8          |
| All unit tests pass and coverage ≥ existing baseline               | Task 9              |

### Risk Mitigation

**Risk**: Breaking existing functionality  
**Mitigation**: Incremental changes with verification at each step, comprehensive testing

**Risk**: Date picker performance issues  
**Mitigation**: Use Material-UI's optimized DatePicker component, lazy load if needed

**Risk**: Date format inconsistencies  
**Mitigation**: Use date-fns for consistent formatting, ISO 8601 for storage

**Risk**: Test coverage dropping  
**Mitigation**: Add comprehensive tests for all new functionality before final verification

### Rollback Plan

If issues arise during implementation:

1. Revert to the last working commit
2. Remove any newly added dependencies
3. Restore original interfaces and function signatures
4. Run full test suite to ensure stability

The feature is designed to be additive, so rollback should be straightforward by removing the optional `dueDate` field and related UI components.
