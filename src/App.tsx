import './App.css';
import { useState } from 'react';
import { CssBaseline, Container, Box, Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AtlasThemeProvider } from './providers/ThemeProvider';
import { TodoProvider } from './contexts/TodoContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { TodoList } from './components/TodoList/TodoList';
import { CreateTodoButton } from './components/CreateTodoButton/CreateTodoButton';
import { TodoModal } from './components/TodoModal/TodoModal';
import type { Todo } from './types/Todo';

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
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TodoProvider>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: theme => theme.palette.background.default,
            }}
          >
            <Header />
            <Container
              maxWidth="md"
              sx={{
                flexGrow: 1,
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Box component="main">
                  <Box
                    sx={{
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h2>Your Todos</h2>
                    <CreateTodoButton />
                  </Box>
                  <TodoList onEditTodo={handleEditTodo} />
                </Box>
              </Paper>
            </Container>
            <Footer />
          </Box>
          <TodoModal
            isOpen={editModalOpen}
            onClose={handleCloseEditModal}
            mode="edit"
            initialValues={
              editingTodo
                ? {
                    id: editingTodo.id,
                    title: editingTodo.title,
                    description: editingTodo.description,
                    completed: editingTodo.completed,
                    dueDate: editingTodo.dueDate,
                  }
                : undefined
            }
          />
        </TodoProvider>
      </LocalizationProvider>
    </AtlasThemeProvider>
  );
}

export default App;
