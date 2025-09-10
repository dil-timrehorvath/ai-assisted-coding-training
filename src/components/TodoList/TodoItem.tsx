import React from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Divider,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { format, isPast, isToday } from 'date-fns';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';
import { parseDateFromStorage } from '../../utils/dateUtils';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  // Add due date display logic
  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = parseDateFromStorage(dueDate);
    if (!date) return null; // Handle invalid dates gracefully

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

    return <Chip label={label} color={color} size="small" sx={{ ml: 1 }} />;
  };

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          py: 1,
          borderLeft: todo.completed ? '4px solid green' : '4px solid transparent',
          '&:hover': {
            bgcolor: 'action.hover',
            cursor: 'pointer',
          },
        }}
        onClick={() => onEditClick(todo)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            Delete
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.completed}
          onClick={e => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
          }}
          color="primary"
          sx={{ mr: 1 }}
        />
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
      </ListItem>
      <Divider />
    </>
  );
};
